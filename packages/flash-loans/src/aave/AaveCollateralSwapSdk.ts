import { OrderPostingResult, SwapAdvancedSettings, TradingSdk } from '@cowprotocol/sdk-trading'
import {
  AbstractSigner,
  AccountAddress,
  ERC20_ALLOWANCE_ABI,
  ERC20_APPROVE_ABI,
  getGlobalAdapter,
  Provider,
  TransactionResponse,
  ZERO_ADDRESS,
} from '@cowprotocol/sdk-common'
import { OrderSigningUtils, UnsignedOrder } from '@cowprotocol/sdk-order-signing'
import { SigningScheme } from '@cowprotocol/sdk-order-book'
import { LatestAppDataDocVersion } from '@cowprotocol/sdk-app-data'

import {
  CollateralOrderData,
  CollateralParameters,
  CollateralPermitData,
  CollateralSwapParams,
  CollateralSwapPostParams,
  CollateralSwapQuoteParams,
  CollateralSwapOrder,
  CollateralSwapTradeParams,
  EncodedOrder,
  FlashLoanHint,
  FlashLoanHookAmounts,
} from './types'
import {
  AAVE_ADAPTER_FACTORY,
  AAVE_COLLATERAL_SWAP_ADAPTER_HOOK,
  AAVE_POOL_ADDRESS,
  ADAPTER_DOMAIN_NAME,
  ADAPTER_DOMAIN_VERSION,
  ADAPTER_SIGNATURE_TYPES,
  DEFAULT_HOOK_GAS_LIMIT,
  DEFAULT_VALIDITY,
  GAS_ESTIMATION_ADDITION_PERCENT,
  HASH_ZERO,
  PERCENT_SCALE,
} from './const'
import { aaveAdapterFactoryAbi } from './abi/AaveAdapterFactory'
import { collateralSwapAdapterHookAbi } from './abi/CollateralSwapAdapterHook'
import { addPercentToValue } from './utils'
import { SupportedChainId } from '@cowprotocol/sdk-config'

/**
 * SDK for executing Aave flash loan operations, particularly collateral swaps.
 *
 * @remarks This SDK facilitates flash loan-based collateral swaps using Aave Protocol V3,
 *          integrated with CoW Protocol for optimal trading execution. It handles the
 *          complex flow of flash loans, order creation, and hook configuration.
 *
 * @see https://docs.aave.com/developers/guides/flash-loans
 * @see https://docs.cow.fi/
 */
export class AaveCollateralSwapSdk {
  /**
   * Executes a collateral swap using Aave flash loans.
   *
   * @remarks This method orchestrates a complex flash loan operation:
   *          1. Borrows the sell token via Aave flash loan
   *          2. Uses CoW hooks to deploy adapter contracts and manage the swap
   *          3. Executes a CoW Protocol swap to the buy token
   *          4. Repays the flash loan with fees
   *
   *          The order is signed using EIP-1271 with a deterministically generated
   *          smart contract address as the signer.
   *
   * @param {CollateralSwapParams} params - Configuration for the collateral swap.
   * @param {TradingSdk} tradingSdk - @cowprotocol/sdk-trading.
   * @returns {Promise<OrderPostingResult>} The result of posting the order to CoW Protocol.
   *
   * @throws Will throw if the quote fails, contract deployment fails, or gas estimation fails.
   * ```
   */
  async collateralSwap(params: CollateralSwapParams, tradingSdk: TradingSdk): Promise<OrderPostingResult> {
    const quoteParams = await this.getSwapQuoteParams(params)
    const {
      collateralToken,
      tradeParameters: { amount },
      settings,
    } = params
    const sellAmount = BigInt(amount)

    const quoteAndPost = await tradingSdk.getQuote(quoteParams)

    const { quoteResults, postSwapOrderFromQuote } = quoteAndPost

    const { swapSettings, instanceAddress } = await this.getOrderPostingSettings(quoteParams, {
      sellAmount,
      buyAmount: quoteResults.amountsAndCosts.afterSlippage.buyAmount,
      orderToSign: quoteResults.orderToSign,
      collateralPermit: settings?.collateralPermit,
    })

    const collateralParams: CollateralParameters = {
      instanceAddress,
      trader: quoteParams.owner,
      collateralToken: collateralToken,
      amount: sellAmount,
    }

    if (!settings?.preventApproval && !settings?.collateralPermit) {
      await this.approveCollateralIfNeeded(collateralParams, sellAmount)
    }

    return postSwapOrderFromQuote(swapSettings)
  }

  /**
   * Prepares quote parameters for the collateral swap operation.
   *
   * @remarks This method calculates the adjusted swap amount after deducting the flash loan fee,
   *          resolves the trader address, and computes the order validity timestamp. The flash
   *          loan fee is deducted from the sell amount before requesting a quote to ensure the
   *          final swap amount covers both the desired output and the flash loan repayment.
   *
   * @param {CollateralSwapParams} params - The collateral swap parameters including chain ID,
   *                                         trade parameters, and optional flash loan fee percentage.
   * @returns {Promise<CollateralSwapQuoteParams>} Quote parameters with adjusted amounts and
   *                                                 computed validity period.
   * ```
   */
  async getSwapQuoteParams(params: CollateralSwapParams): Promise<CollateralSwapQuoteParams> {
    const { chainId, tradeParameters, flashLoanFeePercent = 0 } = params
    const { validFor = DEFAULT_VALIDITY, owner, amount } = tradeParameters

    const adapter = getGlobalAdapter()
    const trader = (owner ?? (await adapter.signer.getAddress())) as AccountAddress

    const validTo = tradeParameters.validTo ?? Math.ceil(Date.now() / 1000) + validFor
    const sellAmount = BigInt(amount)

    if (!Number.isFinite(flashLoanFeePercent) || flashLoanFeePercent < 0 || flashLoanFeePercent > 100) {
      throw new Error(`flashLoanFeePercent must be between 0 and 100, got: ${flashLoanFeePercent}`)
    }

    const flashLoanFeeAmount =
      (sellAmount * BigInt(Math.round(flashLoanFeePercent * PERCENT_SCALE))) / BigInt(100 * PERCENT_SCALE)

    // Omit validFor because we use validTo instead (it is defined above)
    const { validFor: _, ...restParameters } = tradeParameters

    return {
      ...restParameters,
      flashLoanFeeAmount,
      chainId,
      owner: trader,
      amount: (sellAmount - flashLoanFeeAmount).toString(),
      validTo,
    }
  }

  /**
   * Generates order posting settings including hooks and flash loan metadata.
   *
   * @remarks This method constructs the complete order posting configuration for a flash loan-based
   *          collateral swap. It:
   *          - Encodes the order data for EIP-1271 signature verification
   *          - Calculates the deterministic address for the adapter contract
   *          - Configures pre and post-execution hooks for flash loan management
   *          - Generates flash loan hint metadata conforming to the flashloan v0.2.0 schema
   *          - Sets up EIP-1271 signing scheme with the expected instance address
   *          - Includes hooks configuration following the hooks v0.2.0 schema
   *
   *          The flash loan metadata includes information about the Aave pool, protocol adapter,
   *          and token amounts required for execution. The hooks enable the order to trigger
   *          flash loan deployment (pre-hook) and collateral swap execution (post-hook).
   *
   * @param {CollateralSwapTradeParams} params - Trade parameters including chain ID, validity period,
   *                                              owner address, and flash loan fee amount.
   * @param {CollateralSwapOrder} settings - Order configuration including sell/buy amounts, the
   *                                          unsigned order to sign, and optional collateral permit data.
   * @returns {Promise<CollateralSwapPostParams>} Object containing swap advanced settings with
   *                                               appData metadata (flashloan + hooks) and the
   *                                               deterministic adapter instance address.
   *
   * @throws Will throw if contract address calculation fails or gas estimation fails.
   * ```
   */
  async getOrderPostingSettings(
    params: CollateralSwapTradeParams,
    settings: CollateralSwapOrder,
  ): Promise<CollateralSwapPostParams> {
    const { sellAmount, buyAmount, orderToSign, collateralPermit } = settings
    const { chainId, flashLoanFeeAmount, validTo, owner: trader } = params

    const amount = sellAmount.toString()

    const encodedOrder: EncodedOrder = {
      ...OrderSigningUtils.encodeUnsignedOrder(orderToSign),
      appData: HASH_ZERO,
      validTo,
    }

    const hookAmounts: FlashLoanHookAmounts = {
      flashLoanAmount: amount,
      flashLoanFeeAmount: flashLoanFeeAmount.toString(),
      sellAssetAmount: amount,
      buyAssetAmount: buyAmount.toString(),
    }

    const instanceAddress = await this.getExpectedInstanceAddress(chainId, trader, hookAmounts, encodedOrder)

    const flashLoanHint: FlashLoanHint = {
      amount, // this is actually in UNDERLYING but aave tokens are 1:1
      receiver: AAVE_ADAPTER_FACTORY[chainId],
      liquidityProvider: AAVE_POOL_ADDRESS,
      protocolAdapter: AAVE_ADAPTER_FACTORY[chainId],
      token: orderToSign.sellToken,
    }

    const hooks = await this.getOrderHooks(
      chainId,
      trader,
      instanceAddress,
      hookAmounts,
      {
        ...encodedOrder,
        receiver: instanceAddress,
      },
      collateralPermit,
    )

    const swapSettings: SwapAdvancedSettings = {
      quoteRequest: {
        validTo,
        receiver: instanceAddress,
        from: instanceAddress as AccountAddress,
      },
      additionalParams: {
        signingScheme: SigningScheme.EIP1271,
        customEIP1271Signature: (orderToSign: UnsignedOrder, signer: AbstractSigner<Provider>) => {
          return this.adapterEIP1271Signature(chainId, instanceAddress, orderToSign, signer)
        },
      },
      appData: {
        metadata: {
          flashloan: flashLoanHint,
          hooks,
        },
      },
    }

    return {
      swapSettings,
      instanceAddress,
    }
  }

  /**
   * Checks the current allowance for the flash loan adapter to spend collateral tokens.
   *
   * @remarks This method queries the ERC-20 token contract to determine how many tokens
   *          the deterministic adapter instance address is approved to spend on behalf
   *          of the trader. This is useful for verifying if approval is needed before
   *          executing a collateral swap.
   *
   * @param {CollateralParameters} params - Parameters including trader address, collateral
   *                                         token address, and adapter instance address.
   * @returns {Promise<bigint>} The current allowance amount in token's smallest unit (wei).
   *
   * @example
   * ```typescript
   * const allowance = await sdk.getCollateralAllowance({
   *   trader: '0x...',
   *   collateralToken: '0x...',
   *   amount: BigInt('1000000000000000000'),
   *   instanceAddress: '0x...',
   * })
   * console.log('Current allowance:', allowance.toString())
   * ```
   */
  async getCollateralAllowance(params: CollateralParameters): Promise<bigint> {
    const { collateralToken, trader, instanceAddress } = params

    const adapter = getGlobalAdapter()

    return (await adapter.readContract({
      address: collateralToken,
      abi: ERC20_ALLOWANCE_ABI,
      functionName: 'allowance',
      args: [trader, instanceAddress],
    })) as bigint
  }

  /**
   * Approves the flash loan adapter to spend collateral tokens.
   *
   * @remarks This method sends an on-chain approval transaction to allow the deterministic
   *          adapter instance address to spend the specified amount of collateral tokens.
   *          The approval is required before executing a collateral swap unless using
   *          EIP-2612 permit or preventApproval settings.
   *
   * @param {CollateralParameters} params - Parameters including trader address, collateral
   *                                         token address, amount to approve, and adapter
   *                                         instance address.
   * @returns {Promise<TransactionResponse>} The transaction response from the approval transaction.
   *
   * @throws Will throw if the approval transaction fails or is rejected.
   *
   * @example
   * ```typescript
   * const txResponse = await sdk.approveCollateral({
   *   trader: '0x...',
   *   collateralToken: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
   *   amount: BigInt('20000000000000000000'),
   *   instanceAddress: '0x...',
   * })
   * console.log('Approval transaction hash:', txResponse.hash)
   * ```
   */
  async approveCollateral(params: CollateralParameters): Promise<TransactionResponse> {
    const { collateralToken, amount, instanceAddress } = params
    const adapter = getGlobalAdapter()

    const txParams = {
      to: collateralToken,
      data: adapter.utils.encodeFunction(ERC20_APPROVE_ABI, 'approve', [instanceAddress, '0x' + amount.toString(16)]),
    }

    return adapter.signer.sendTransaction(txParams)
  }

  async getExpectedInstanceAddress(
    chainId: SupportedChainId,
    trader: AccountAddress,
    hookAmounts: FlashLoanHookAmounts,
    order: EncodedOrder,
  ): Promise<AccountAddress> {
    const hookData = this.buildHookOrderData(trader, hookAmounts, order)

    return (await getGlobalAdapter().readContract({
      address: AAVE_ADAPTER_FACTORY[chainId],
      args: [AAVE_COLLATERAL_SWAP_ADAPTER_HOOK[chainId], hookData],
      functionName: 'getInstanceDeterministicAddress',
      abi: aaveAdapterFactoryAbi,
    })) as AccountAddress
  }

  private async approveCollateralIfNeeded(collateralParams: CollateralParameters, sellAmount: bigint): Promise<void> {
    const allowance = await this.getCollateralAllowance(collateralParams).catch((error) => {
      console.error('[AaveCollateralSwapSdk] Could not get allowance for collateral token', error)

      return null
    })

    if (!allowance || allowance < sellAmount) {
      await this.approveCollateral(collateralParams)
    }
  }

  private getPreHookCallData(
    chainId: SupportedChainId,
    trader: AccountAddress,
    hookAmounts: FlashLoanHookAmounts,
    order: EncodedOrder,
    instanceAddress: AccountAddress,
  ): string {
    const hookData = this.buildHookOrderData(trader, hookAmounts, order)
    const adapterImplementation = AAVE_COLLATERAL_SWAP_ADAPTER_HOOK[chainId]

    return getGlobalAdapter().utils.encodeFunction(aaveAdapterFactoryAbi, 'deployAndTransferFlashLoan', [
      adapterImplementation,
      { ...hookData, receiver: instanceAddress },
    ])
  }

  private buildHookOrderData(
    trader: AccountAddress,
    hookAmounts: FlashLoanHookAmounts,
    order: EncodedOrder,
  ): CollateralOrderData {
    const { sellToken, buyToken, sellAmount, buyAmount, kind, validTo } = order
    const parsedValidTo = typeof validTo === 'number' ? validTo : Number(validTo ?? 0)

    return {
      owner: trader,
      receiver: ZERO_ADDRESS,
      sellToken: String(sellToken),
      buyToken: String(buyToken),
      sellAmount: String(sellAmount),
      buyAmount: String(buyAmount),
      kind: String(kind),
      validTo: parsedValidTo,
      flashLoanAmount: hookAmounts.flashLoanAmount,
      flashLoanFeeAmount: hookAmounts.flashLoanFeeAmount,
      hookSellTokenAmount: hookAmounts.sellAssetAmount,
      hookBuyTokenAmount: hookAmounts.buyAssetAmount,
    }
  }

  private getPostHookCallData(collateralPermit: CollateralPermitData): string {
    return getGlobalAdapter().utils.encodeFunction(collateralSwapAdapterHookAbi, 'collateralSwapWithFlashLoan', [
      collateralPermit,
    ])
  }

  private async getOrderHooks(
    chainId: SupportedChainId,
    trader: AccountAddress,
    expectedInstanceAddress: AccountAddress,
    hookAmounts: FlashLoanHookAmounts,
    order: EncodedOrder,
    collateralPermit?: CollateralPermitData,
  ): Promise<LatestAppDataDocVersion['metadata']['hooks']> {
    const adapter = getGlobalAdapter()

    const preHookCallData = this.getPreHookCallData(chainId, trader, hookAmounts, order, expectedInstanceAddress)
    const postHookCallData = collateralPermit ? this.getPostHookCallData(collateralPermit) : undefined

    return {
      pre: [
        {
          target: AAVE_ADAPTER_FACTORY[chainId],
          callData: preHookCallData,
          gasLimit: (
            await adapter.signer
              .estimateGas({
                to: AAVE_ADAPTER_FACTORY[chainId],
                data: preHookCallData,
              })
              .then((gas) => {
                return addPercentToValue(gas, GAS_ESTIMATION_ADDITION_PERCENT)
              })
              .catch(() => DEFAULT_HOOK_GAS_LIMIT)
          ).toString(),
        },
      ],
      post: postHookCallData
        ? [
            {
              target: expectedInstanceAddress,
              callData: postHookCallData,
              gasLimit: (
                await adapter.signer
                  .estimateGas({
                    to: expectedInstanceAddress,
                    data: postHookCallData,
                  })
                  .then((gas) => {
                    return addPercentToValue(gas, GAS_ESTIMATION_ADDITION_PERCENT)
                  })
                  .catch(() => DEFAULT_HOOK_GAS_LIMIT)
              ).toString(),
            },
          ]
        : undefined,
    }
  }

  private async adapterEIP1271Signature(
    chainId: SupportedChainId,
    instanceAddress: AccountAddress,
    orderToSign: UnsignedOrder,
    signer: AbstractSigner<Provider>,
  ) {
    const adapterFactoryAddress = AAVE_ADAPTER_FACTORY[chainId]
    const encodedOrder = OrderSigningUtils.encodeUnsignedOrder(orderToSign)

    const domain = {
      name: ADAPTER_DOMAIN_NAME,
      version: ADAPTER_DOMAIN_VERSION,
      chainId,
      verifyingContract: adapterFactoryAddress,
    }

    const message = {
      instance: instanceAddress,
      sellToken: encodedOrder.sellToken,
      buyToken: encodedOrder.buyToken,
      sellAmount: encodedOrder.sellAmount,
      buyAmount: encodedOrder.buyAmount,
      kind: encodedOrder.kind,
      validTo: encodedOrder.validTo,
      appData: encodedOrder.appData,
    }

    const ecdsaSignature = await signer.signTypedData(domain, ADAPTER_SIGNATURE_TYPES, message)

    return OrderSigningUtils.getEip1271Signature(orderToSign, ecdsaSignature)
  }
}
