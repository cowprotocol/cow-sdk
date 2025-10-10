import { OrderPostingResult, QuoteResults, SwapAdvancedSettings, TradingSdk } from '@cowprotocol/sdk-trading'
import { AccountAddress, getGlobalAdapter } from '@cowprotocol/sdk-common'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import { SigningScheme } from '@cowprotocol/sdk-order-book'
import { LatestAppDataDocVersion } from '@cowprotocol/sdk-app-data'

import {
  CollateralSwapParams,
  CollateralSwapQuoteParams,
  EncodedOrder,
  FlashLoanHint,
  FlashLoanHookAmounts,
} from './types'
import {
  AAVE_ADAPTER_FACTORY,
  AAVE_COLLATERAL_SWAP_ADAPTER_HOOK,
  AAVE_POOL_ADDRESS,
  DEFAULT_HOOK_GAS_LIMIT,
  DEFAULT_VALIDITY,
  EMPTY_PERMIT_SIGN,
  HASH_ZERO,
  PERCENT_SCALE,
} from './const'
import { aaveAdapterFactoryAbi } from './abi/AaveAdapterFactory'
import { collateralSwapAdapterHookAbi } from './abi/CollateralSwapAdapterHook'

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
export class AaveFlashLoanSdk {
  constructor(private tradingSdk: TradingSdk) {}

  /**
   * Executes a collateral swap using Aave flash loans.
   *
   * @remarks This method orchestrates a complex flash loan operation:
   *          1. Borrows the sell token via Aave flash loan
   *          2. Executes a CoW Protocol swap to the buy token
   *          3. Uses CoW hooks to deploy adapter contracts and manage the swap
   *          4. Repays the flash loan with fees
   *
   *          The order is signed using EIP-1271 with a deterministically generated
   *          smart contract address as the signer.
   *
   * @param {CollateralSwapParams} params - Configuration for the collateral swap.
   * @returns {Promise<OrderPostingResult>} The result of posting the order to CoW Protocol.
   *
   * @throws Will throw if the quote fails, contract deployment fails, or gas estimation fails.
   *
   * @example
   * ```typescript
   * const result = await flashLoanSdk.collateralSwap({
   *   chainId: SupportedChainId.GNOSIS_CHAIN,
   *   tradeParameters: {
   *     sellToken: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
   *     sellTokenDecimals: 18,
   *     buyToken: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0',
   *     buyTokenDecimals: 6,
   *     amount: '20000000000000000000',
   *     kind: OrderKind.SELL,
   *     validFor: 600,
   *     slippageBps: 50,
   *   },
   *   flashLoanFeePercent: 0.05,
   * })
   * ```
   */
  async collateralSwap(params: CollateralSwapParams): Promise<OrderPostingResult> {
    const quoteParams = await this.getCollateralSwapQuoteParams(params)

    const quoteAndPost = await this.tradingSdk.getQuote(quoteParams)

    const { quoteResults, postSwapOrderFromQuote } = quoteAndPost

    const swapSettings = await this.getCollateralSwapSettings(params, quoteParams, quoteResults)

    return postSwapOrderFromQuote(swapSettings)
  }

  async getCollateralSwapQuoteParams(params: CollateralSwapParams): Promise<CollateralSwapQuoteParams> {
    const { chainId, tradeParameters, flashLoanFeePercent = 0 } = params
    const { validFor = DEFAULT_VALIDITY, owner, amount } = tradeParameters

    const adapter = getGlobalAdapter()
    const trader = (owner ?? (await adapter.signer.getAddress())) as AccountAddress

    const validTo = tradeParameters.validTo ?? Math.ceil(Date.now() / 1000) + validFor
    const sellAmount = BigInt(amount)
    const flashLoanFeeAmount = (sellAmount * BigInt(flashLoanFeePercent * PERCENT_SCALE)) / BigInt(100 * PERCENT_SCALE)

    return {
      ...tradeParameters,
      flashLoanFeeAmount,
      chainId,
      owner: trader,
      amount: (sellAmount - flashLoanFeeAmount).toString(),
      validFor,
      validTo,
    }
  }

  async getCollateralSwapSettings(
    params: CollateralSwapParams,
    quoteParams: CollateralSwapQuoteParams,
    quoteResults: QuoteResults,
  ): Promise<SwapAdvancedSettings> {
    const { amount } = params.tradeParameters
    const { flashLoanFeeAmount, validTo, owner: trader } = quoteParams
    const { orderToSign } = quoteResults
    const buyAmount = quoteResults.amountsAndCosts.afterSlippage.buyAmount

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

    const expectedInstanceAddress = await this.getExpectedInstanceAddress(trader, hookAmounts, encodedOrder)

    const flashLoanHint: FlashLoanHint = {
      amount, // this is actually in UNDERLYING but aave tokens are 1:1
      receiver: AAVE_ADAPTER_FACTORY,
      liquidityProvider: AAVE_POOL_ADDRESS,
      protocolAdapter: AAVE_ADAPTER_FACTORY,
      token: orderToSign.sellToken,
    }

    return {
      quoteRequest: {
        validTo,
        receiver: expectedInstanceAddress,
        from: expectedInstanceAddress as AccountAddress,
      },
      additionalParams: {
        signingScheme: SigningScheme.EIP1271,
      },
      appData: {
        metadata: {
          flashloan: flashLoanHint,
          hooks: await this.getOrderHooks(trader, expectedInstanceAddress, hookAmounts, {
            ...encodedOrder,
            receiver: expectedInstanceAddress,
          }),
        },
      },
    }
  }

  private async getExpectedInstanceAddress(
    trader: AccountAddress,
    hookAmounts: FlashLoanHookAmounts,
    order: EncodedOrder,
  ): Promise<AccountAddress> {
    const hookOrderData = {
      owner: trader,
      sellAsset: order.sellToken,
      buyAsset: order.buyToken,
      sellAmount: order.sellAmount,
      buyAmount: order.buyAmount,
      kind: order.kind,
      validTo: order.validTo,
      flashLoanAmount: hookAmounts.flashLoanAmount,
      flashLoanFeeAmount: hookAmounts.flashLoanFeeAmount,
      hookSellAssetAmount: hookAmounts.sellAssetAmount,
      hookBuyAssetAmount: hookAmounts.buyAssetAmount,
    }

    return (await getGlobalAdapter().readContract({
      address: AAVE_ADAPTER_FACTORY,
      args: [AAVE_COLLATERAL_SWAP_ADAPTER_HOOK, hookOrderData],
      functionName: 'getInstanceDeterministicAddress',
      abi: aaveAdapterFactoryAbi,
    })) as AccountAddress
  }

  private getPreHookCallData(trader: AccountAddress, hookAmounts: FlashLoanHookAmounts, order: EncodedOrder): string {
    return getGlobalAdapter().utils.encodeFunction(aaveAdapterFactoryAbi, 'deployAndTransferFlashLoan', [
      trader,
      AAVE_COLLATERAL_SWAP_ADAPTER_HOOK,
      hookAmounts,
      order,
    ])
  }

  private getPostHookCallData(): string {
    return getGlobalAdapter().utils.encodeFunction(collateralSwapAdapterHookAbi, 'collateralSwapWithFlashLoan', [
      EMPTY_PERMIT_SIGN,
    ])
  }

  private async getOrderHooks(
    trader: AccountAddress,
    expectedInstanceAddress: AccountAddress,
    hookAmounts: FlashLoanHookAmounts,
    order: EncodedOrder,
  ): Promise<LatestAppDataDocVersion['metadata']['hooks']> {
    const adapter = getGlobalAdapter()

    const preHookCallData = this.getPreHookCallData(trader, hookAmounts, order)
    const postHookCallData = this.getPostHookCallData()

    return {
      pre: [
        {
          target: AAVE_ADAPTER_FACTORY,
          callData: preHookCallData,
          gasLimit: (
            await adapter.signer
              .estimateGas({
                to: AAVE_ADAPTER_FACTORY,
                data: preHookCallData,
              })
              .catch(() => DEFAULT_HOOK_GAS_LIMIT)
          ).toString(),
        },
      ],
      post: [
        {
          target: expectedInstanceAddress,
          callData: postHookCallData,
          gasLimit: (
            await adapter.signer
              .estimateGas({
                to: expectedInstanceAddress,
                data: postHookCallData,
              })
              .catch(() => DEFAULT_HOOK_GAS_LIMIT)
          ).toString(),
        },
      ],
    }
  }
}
