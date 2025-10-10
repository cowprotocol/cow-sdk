import {
  AccountAddress,
  getGlobalAdapter,
  LatestAppDataDocVersion,
  OrderPostingResult,
  OrderSigningUtils,
  SigningScheme,
  SupportedChainId,
  TradeParameters,
  TradingSdk,
} from '@cowprotocol/cow-sdk'
import {
  AAVE_ADAPTER_FACTORY,
  AAVE_COLLATERAL_SWAP_ADAPTER_HOOK,
  AAVE_POOL_ADDRESS,
  DEFAULT_HOOK_GAS_LIMIT,
  EMPTY_PERMIT_SIGN,
  HASH_ZERO,
  PERCENT_SCALE,
} from './const'
import { aaveAdapterFactoryAbi } from './abi/AaveAdapterFactory'
import { collateralSwapAdapterHookAbi } from './abi/CollateralSwapAdapterHook'
import { EncodedOrder, FlashLoanHint, FlashLoanHookAmounts } from './types'

interface CollateralSwapParams {
  chainId: SupportedChainId
  tradeParameters: TradeParameters
  flashLoanFeePercent?: number
}

const DEFAULT_VALIDITY = 10 * 60 // 10 min

export class AaveFlashLoanSdk {
  constructor(private tradingSdk: TradingSdk) {}

  async collateralSwap(params: CollateralSwapParams): Promise<OrderPostingResult> {
    const { chainId, tradeParameters, flashLoanFeePercent = 0 } = params
    const { validFor = DEFAULT_VALIDITY, owner, amount } = tradeParameters

    const adapter = getGlobalAdapter()
    const trader = (owner ?? (await adapter.signer.getAddress())) as AccountAddress

    const validTo = tradeParameters.validTo ?? Math.ceil(Date.now() / 1000) + validFor
    const sellAmount = BigInt(amount)
    const flashLoanFeeAmount = (sellAmount * BigInt(flashLoanFeePercent * PERCENT_SCALE)) / BigInt(100 * PERCENT_SCALE)

    const quoteAndPost = await this.tradingSdk.getQuote({
      chainId,
      ...tradeParameters,
      owner: trader,
      amount: (sellAmount - flashLoanFeeAmount).toString(),
      validFor,
    })

    const {
      quoteResults: {
        orderToSign,
        amountsAndCosts: {
          afterSlippage: { buyAmount },
        },
      },
      postSwapOrderFromQuote,
    } = quoteAndPost

    const encodedOrder: EncodedOrder = {
      ...OrderSigningUtils.encodeUnsignedOrder(orderToSign),
      appData: HASH_ZERO,
      validTo,
    }

    const hookAmounts: FlashLoanHookAmounts = {
      flashLoanAmount: sellAmount.toString(),
      flashLoanFeeAmount: flashLoanFeeAmount.toString(),
      sellAssetAmount: sellAmount.toString(),
      buyAssetAmount: buyAmount.toString(),
    }

    const expectedInstanceAddress = await this.getExpectedInstanceAddress(trader, hookAmounts, encodedOrder)

    const flashLoanHint: FlashLoanHint = {
      amount: sellAmount.toString(), // this is actually in UNDERLYING but aave tokens are 1:1
      receiver: AAVE_ADAPTER_FACTORY,
      liquidityProvider: AAVE_POOL_ADDRESS,
      protocolAdapter: AAVE_ADAPTER_FACTORY,
      token: orderToSign.sellToken,
    }

    return postSwapOrderFromQuote({
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
    })
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
