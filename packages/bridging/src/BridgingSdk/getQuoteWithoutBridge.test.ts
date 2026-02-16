import { TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderBookApi, OrderKind } from '@cowprotocol/sdk-order-book'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { getQuoteWithoutBridge } from './getQuoteWithoutBridge'
import { QuoteBridgeRequest } from '../types'
import { createAdapters } from '../../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { getMockSigner, orderQuoteResponse } from './mock/bridgeRequestMocks'

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe(`getQuoteWithoutBridge with ${adapterName}`, () => {
    let tradingSdk: TradingSdk
    let orderBookApi: OrderBookApi
    let getQuoteMock: jest.Mock

    beforeEach(() => {
      const adapter = adapters[adapterName]
      setGlobalAdapter(adapter)

      jest.clearAllMocks()

      getQuoteMock = jest.fn().mockResolvedValue({
        ...orderQuoteResponse,
        postSwapOrderFromQuote: jest.fn(),
      })

      orderBookApi = {
        context: {
          chainId: SupportedChainId.GNOSIS_CHAIN,
        },
        getQuote: getQuoteMock,
        uploadAppData: jest.fn().mockResolvedValue(''),
        sendOrder: jest.fn().mockResolvedValue('0x01'),
      } as unknown as OrderBookApi

      tradingSdk = new TradingSdk({}, { orderBookApi })
      tradingSdk.getQuote = getQuoteMock
    })

    it('should override slippageBps with swapSlippageBps in getQuote call', async () => {
      const quoteBridgeRequest: QuoteBridgeRequest = {
        kind: OrderKind.SELL,
        sellTokenChainId: SupportedChainId.GNOSIS_CHAIN,
        sellTokenAddress: '0x6810e776880c02933d47db1b9fc05908e5386b96',
        sellTokenDecimals: 18,
        buyTokenChainId: SupportedChainId.MAINNET,
        buyTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        buyTokenDecimals: 6,
        amount: 1000000000000000000n,
        account: '0x1234567890123456789012345678901234567890',
        appCode: 'test',
        signer: getMockSigner(adapters[adapterName]),
        swapSlippageBps: 100, // Custom swap slippage
      }

      await getQuoteWithoutBridge({
        quoteBridgeRequest,
        tradingSdk,
      })

      expect(getQuoteMock).toHaveBeenCalledTimes(1)
      const callArgs = getQuoteMock.mock.calls[0][0]
      expect(callArgs.slippageBps).toBe(100)
      expect(callArgs.slippageBps).toBe(quoteBridgeRequest.swapSlippageBps)
    })
  })
})
