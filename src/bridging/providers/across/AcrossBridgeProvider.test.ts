import { AdditionalTargetChainId, SupportedChainId, TargetChainId } from '../../../chains'
import { TokenInfo } from '../../../common'
import { OrderKind } from '../../../order-book'
import { BridgeHook, BridgeQuoteResult, QuoteBridgeRequest } from '../../types'
import { AcrossApi } from './AcrossApi'
import { ACROSS_SUPPORTED_NETWORKS, AcrossBridgeProvider, AcrossBridgeProviderOptions } from './AcrossBridgeProvider'

// Mock AcrossApi
jest.mock('./AcrossApi')

class AcrossBridgeProviderTest extends AcrossBridgeProvider {
  constructor(options: AcrossBridgeProviderOptions) {
    super(options)
  }

  // Re-expose the API for testing
  public getApi() {
    return this.api
  }

  // Allow to set the API for testing
  public setApi(api: AcrossApi) {
    this.api = api
  }
}

describe('AcrossBridgeProvider', () => {
  const mockGetTokenInfos = jest.fn()
  let provider: AcrossBridgeProviderTest

  beforeEach(() => {
    const options = {
      getTokenInfos: mockGetTokenInfos,
      apiOptions: {},
    }
    provider = new AcrossBridgeProviderTest(options)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getNetworks', () => {
    it('should return supported networks', async () => {
      const networks = await provider.getNetworks()

      expect(networks.length).toBeGreaterThan(0)
      expect(networks).toEqual(ACROSS_SUPPORTED_NETWORKS)
    })
  })

  describe('getBuyTokens', () => {
    const mockTokens: TokenInfo[] = [
      { chainId: AdditionalTargetChainId.POLYGON, address: '0x123', decimals: 18, symbol: 'TOKEN1', name: 'Token 1' },
      { chainId: AdditionalTargetChainId.POLYGON, address: '0x456', decimals: 6, symbol: 'TOKEN2', name: 'Token 2' },
    ]

    beforeEach(() => {
      mockGetTokenInfos.mockResolvedValue(mockTokens)
    })

    it('should return tokens for supported chain', async () => {
      const tokens = await provider.getBuyTokens({
        targetChainId: AdditionalTargetChainId.POLYGON,
      })

      expect(tokens).toEqual(mockTokens)
      // mockGetTokenInfos was called with a list of addresses which includes 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 and 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619

      // The token result contains USDC and WETH in polygon
      expect(mockGetTokenInfos).toHaveBeenCalledWith(
        AdditionalTargetChainId.POLYGON,
        expect.arrayContaining([
          '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
          '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        ])
      )
    })

    it('should return empty array for unsupported chain', async () => {
      const tokens = await provider.getBuyTokens({
        targetChainId: 12345 as TargetChainId, // unsupported chain
      })

      // The token result is empty and we don't call getTokenInfos
      expect(tokens).toEqual([])
      expect(mockGetTokenInfos).not.toHaveBeenCalled()
    })
  })

  describe('getQuote', () => {
    const mockSuggestedFees = {
      totalRelayFee: { pct: '100000000000000', total: '100000' },
      relayerCapitalFee: { pct: '50000000000000', total: '50000' },
      relayerGasFee: { pct: '50000000000000', total: '50000' },
      lpFee: { pct: '30000000000000', total: '30000' },
      timestamp: '1234567890',
      isAmountTooLow: false,
      quoteBlock: '12345',
      spokePoolAddress: '0xabcd',
      exclusiveRelayer: '0x0000000000000000000000000000000000000000',
      exclusivityDeadline: '0',
      expectedFillTimeSec: '300',
      fillDeadline: '1234567890',
      limits: {
        minDeposit: '1000000',
        maxDeposit: '1000000000000',
        maxDepositInstant: '100000000',
        maxDepositShortDelay: '500000000',
        recommendedDepositInstant: '50000000',
      },
    }

    beforeEach(() => {
      const mockAcrossApi = new AcrossApi()
      jest.spyOn(mockAcrossApi, 'getSuggestedFees').mockResolvedValue(mockSuggestedFees)
      provider.setApi(mockAcrossApi)
    })

    it('should return quote with suggested fees', async () => {
      const request: QuoteBridgeRequest = {
        kind: OrderKind.SELL,
        sellTokenAddress: '0x123',
        sellTokenChainId: SupportedChainId.MAINNET,
        buyTokenChainId: AdditionalTargetChainId.POLYGON,
        amount: 1000000000000000000n,
        recipient: '0x789',
        account: '0x123',
        sellTokenDecimals: 18,
        buyTokenAddress: '0x456',
        buyTokenDecimals: 6,
        feeBps: 0,
        feeRecipient: '0x789',
        appCode: '0x123',
        signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
      }

      const { suggestedFees, ...quote } = await provider.getQuote(request)

      // The quote contains the suggested fees returned by the API
      expect(suggestedFees).toEqual(mockSuggestedFees)

      console.log('quote', quote.amountsAndCosts.costs)
      const expectedQuote: BridgeQuoteResult = {
        isSell: true,
        amountsAndCosts: {
          beforeFee: { sellAmount: 1000000000000000000n, buyAmount: 1000000n },
          afterFee: { sellAmount: 1000000000000000000n, buyAmount: 999900n },
          afterSlippage: { sellAmount: 1000000000000000000n, buyAmount: 999900n },
          costs: {
            bridgingFee: {
              feeBps: 1,
              amountInSellCurrency: 100000000000000n,
              amountInBuyCurrency: 100n,
            },
            slippageBps: 0,
          },
        },
        quoteTimestamp: 1234567890,
        expectedFillTimeSeconds: 300,
      }

      expect(quote).toEqual(expectedQuote)
    })
  })

  describe('info', () => {
    it('should return provider info', () => {
      expect(provider.info).toEqual({
        name: 'Across',
        logoUrl: expect.stringContaining('across-logo.png'),
      })
    })
  })

  describe('decodeBridgeHook', () => {
    it('should return bridging id', async () => {
      await expect(provider.decodeBridgeHook({} as BridgeHook)).rejects.toThrowError('Not implemented')
    })
  })

  describe('getBridgingId', () => {
    it('should return bridging id', async () => {
      await expect(provider.getBridgingId('123', '123')).rejects.toThrowError('Not implemented')
    })
  })

  describe('getExplorerUrl', () => {
    it('should return explorer url', () => {
      expect(provider.getExplorerUrl('123')).toEqual('https://app.across.to/transactions/123')
    })
  })

  describe('getStatus', () => {
    it('should return status', async () => {
      await expect(provider.getStatus('123')).rejects.toThrowError('Not implemented')
    })
  })

  describe('getCancelBridgingTx', () => {
    it('should return cancel bridging tx', async () => {
      await expect(provider.getCancelBridgingTx('123')).rejects.toThrowError('Not implemented')
    })
  })

  describe('getRefundBridgingTx', () => {
    it('should return refund bridging tx', async () => {
      await expect(provider.getRefundBridgingTx('123')).rejects.toThrowError('Not implemented')
    })
  })
})
