import { OrderPostingResult, QuoteResults, SwapAdvancedSettings, TradingSdk } from '@cowprotocol/sdk-trading'
import { AccountAddress, getGlobalAdapter } from '@cowprotocol/sdk-common'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import { SigningScheme } from '@cowprotocol/sdk-order-book'
import { LatestAppDataDocVersion } from '@cowprotocol/sdk-app-data'

import {
  CollateralOrderData,
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
export class AaveCollateralSwapSdk {
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
   * @param {TradingSdk} tradingSdk - @cowprotocol/sdk-trading.
   * @returns {Promise<OrderPostingResult>} The result of posting the order to CoW Protocol.
   *
   * @throws Will throw if the quote fails, contract deployment fails, or gas estimation fails.
   * ```
   */
  async collateralSwap(params: CollateralSwapParams, tradingSdk: TradingSdk): Promise<OrderPostingResult> {
    const quoteParams = await this.getSwapQuoteParams(params)

    const quoteAndPost = await tradingSdk.getQuote(quoteParams)

    const { quoteResults, postSwapOrderFromQuote } = quoteAndPost

    const swapSettings = await this.getOrderPostingSettings(params, quoteParams, quoteResults)

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

  /**
   * Generates order posting settings including hooks and flash loan metadata.
   *
   * @remarks This method constructs the complete order posting configuration for a flash loan-based
   *          collateral swap. It:
   *          - Encodes the order data for EIP-1271 signature verification
   *          - Calculates the deterministic address for the adapter contract
   *          - Configures pre and post-execution hooks for flash loan management
   *          - Generates flash loan hint metadata for the order
   *          - Sets up EIP-1271 signing scheme with the expected instance address
   *
   * @param {CollateralSwapParams} params - Original collateral swap parameters.
   * @param {CollateralSwapQuoteParams} quoteParams - Processed quote parameters with adjusted amounts.
   * @param {QuoteResults} quoteResults - Quote results from the trading SDK containing order details.
   * @returns {Promise<SwapAdvancedSettings>} Advanced settings for posting the swap order with
   *                                           flash loan hooks and metadata.
   *
   * @throws Will throw if contract address calculation fails or gas estimation fails.
   */
  async getOrderPostingSettings(
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
    } as CollateralOrderData

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
