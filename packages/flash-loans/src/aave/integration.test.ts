import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { gnosis } from 'viem/chains'

import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { LimitTradeParameters, TradingSdk } from '@cowprotocol/sdk-trading'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { AaveCollateralSwapSdk } from './AaveCollateralSwapSdk'
import { CollateralSwapParams } from './types'

// =================== Config ===================
const RPC_URL = 'https://rpc.gnosis.gateway.fm'
const PRIVATE_KEY = '' // private key here (0x...)
// ===============================================================

describe.skip('AaveFlashLoanIntegration', () => {
  it('Test AaveFlashLoanSdk collateralSwap on Gnosis Chain with swap', async () => {
    const chainId = SupportedChainId.GNOSIS_CHAIN

    if (!PRIVATE_KEY) {
      throw new Error('Set PRIVATE_KEY to run this example')
    }

    const publicClient = createPublicClient({
      chain: gnosis,
      transport: http(RPC_URL),
    })
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)

    const adapter = new ViemAdapter({ provider: publicClient, signer: account })
    const tradingSdk = new TradingSdk(
      {
        chainId,
        appCode: 'aave-v3-flashloan',
        signer: account,
        env: 'staging',
      },
      {},
      adapter,
    )
    const flashLoanSdk = new AaveCollateralSwapSdk()

    try {
      const result = await flashLoanSdk.collateralSwap(
        {
          chainId: SupportedChainId.GNOSIS_CHAIN,
          collateralToken: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533', // aGnoWXDAI
          tradeParameters: {
            sellToken: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // WXDAI
            sellTokenDecimals: 18,
            buyToken: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0', // USDC.e
            buyTokenDecimals: 6,
            amount: '20000000000000000000', // 20 WXDAI
            kind: OrderKind.SELL,
            validFor: 10 * 60, // 10m
            slippageBps: 8,
          },
          flashLoanFeePercent: 0.05, // 0.05%
        },
        tradingSdk,
      )

      expect(result).toEqual({ result: 'orderId' })
    } catch (error) {
      expect((error as { body: unknown }).body || error).toEqual({})
    }
  }, 120_000)

  it('Test AaveFlashLoanSdk collateralSwap on Gnosis Chain with limit order', async () => {
    const chainId = SupportedChainId.GNOSIS_CHAIN

    if (!PRIVATE_KEY) {
      throw new Error('Set PRIVATE_KEY to run this example')
    }

    const publicClient = createPublicClient({
      chain: gnosis,
      transport: http(RPC_URL),
    })
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)

    const adapter = new ViemAdapter({ provider: publicClient, signer: account })
    const tradingSdk = new TradingSdk(
      {
        chainId,
        appCode: 'aave-v3-flashloan',
        signer: account,
      },
      {},
      adapter,
    )
    const flashLoanSdk = new AaveCollateralSwapSdk()

    const sellAmount = 20000000000000000000n // 20 WXDAI
    const collateralPermit = undefined

    const collateralSwapParams: CollateralSwapParams = {
      chainId: SupportedChainId.GNOSIS_CHAIN,
      collateralToken: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533', // aGnoWXDAI
      tradeParameters: {
        sellToken: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // WXDAI
        sellTokenDecimals: 18,
        buyToken: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0', // USDC.e
        buyTokenDecimals: 6,
        amount: sellAmount.toString(),
        kind: OrderKind.SELL,
        validFor: 10 * 60, // 10m
        slippageBps: 8,
      },
      flashLoanFeePercent: 0.05, // 0.05%
      settings: {
        collateralPermit,
      },
    }

    const quoteParams = await flashLoanSdk.getSwapQuoteParams(collateralSwapParams)

    const { quoteResults } = await tradingSdk.getQuote(quoteParams)

    const orderPostParams = await flashLoanSdk.getOrderPostingSettings(
      {
        chainId: quoteParams.chainId,
        validTo: quoteParams.validTo,
        owner: quoteParams.owner,
        flashLoanFeeAmount: quoteParams.flashLoanFeeAmount,
      },
      {
        sellAmount,
        buyAmount: quoteResults.amountsAndCosts.afterSlippage.buyAmount,
        orderToSign: quoteResults.orderToSign,
        collateralPermit,
      },
    )

    const { tradeParameters } = collateralSwapParams
    const { orderToSign, quoteResponse } = quoteResults

    const limitOrder: LimitTradeParameters = {
      sellToken: tradeParameters.sellToken,
      sellTokenDecimals: tradeParameters.sellTokenDecimals,
      buyToken: tradeParameters.buyToken,
      buyTokenDecimals: tradeParameters.buyTokenDecimals,
      kind: tradeParameters.kind,
      sellAmount: orderToSign.sellAmount,
      buyAmount: orderToSign.buyAmount,
      quoteId: quoteResponse.id,
    }

    try {
      const result = await tradingSdk.postLimitOrder(limitOrder, orderPostParams.swapSettings)

      expect(result).toEqual({ result: 'orderId' })
    } catch (error) {
      expect((error as { body: unknown }).body || error).toEqual({})
    }
  }, 120_000)
})
