import { SupportedChainId, TargetChainId } from '../../../chains'
import { latest as latestAppData } from '@cowprotocol/app-data/dist/generatedTypes'
import { OrderKind } from '../../../order-book'
import { BridgeQuoteResult, BridgeStatus, QuoteBridgeRequest } from '../../types'
import { AcrossApi } from './AcrossApi'
import {
  ACROSS_HOOK_DAPP_ID,
  ACROSS_SUPPORTED_NETWORKS,
  AcrossBridgeProvider,
  AcrossBridgeProviderOptions,
} from './AcrossBridgeProvider'
import { SuggestedFeesResponse } from './types'
import { JsonRpcProvider } from '@ethersproject/providers'

// Mock AcrossApi
jest.mock('./AcrossApi')

const mockTokens = [
  { chainId: SupportedChainId.POLYGON, address: '0x123', decimals: 18, symbol: 'TOKEN1', name: 'Token 1' },
  { chainId: SupportedChainId.POLYGON, address: '0x456', decimals: 6, symbol: 'TOKEN2', name: 'Token 2' },
]

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
  let provider: AcrossBridgeProviderTest

  beforeEach(() => {
    const options = {
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
    beforeEach(() => {
      const mockAcrossApi = new AcrossApi()
      jest.spyOn(mockAcrossApi, 'getSupportedTokens').mockResolvedValue(mockTokens)
      provider.setApi(mockAcrossApi)
    })

    it('should return tokens for supported chain', async () => {
      const tokens = await provider.getBuyTokens(SupportedChainId.POLYGON)

      expect(tokens).toEqual(mockTokens)
      // mockGetTokenInfos was called with a list of addresses which includes 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 and 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
    })

    it('should return empty array for unsupported chain', async () => {
      const tokens = await provider.getBuyTokens(12345 as TargetChainId)

      // The token result is empty and we don't call getTokenInfos
      expect(tokens).toEqual([])
    })
  })

  describe('getQuote', () => {
    const mockSuggestedFees: SuggestedFeesResponse = {
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
      estimatedFillTimeSec: '300',
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
        buyTokenChainId: SupportedChainId.POLYGON,
        amount: 1000000000000000000n,
        receiver: '0x789',
        account: '0x123',
        sellTokenDecimals: 18,
        buyTokenAddress: '0x456',
        buyTokenDecimals: 6,
        appCode: '0x123',
        signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
      }

      const { suggestedFees, ...quote } = await provider.getQuote(request)

      // The quote contains the suggested fees returned by the API
      expect(suggestedFees).toEqual(mockSuggestedFees)

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
          },
          slippageBps: 0,
        },
        quoteTimestamp: 1234567890,
        expectedFillTimeSeconds: 300,
        fees: {
          bridgeFee: 50000n,
          destinationGasFee: 50000n,
        },
        limits: {
          minDeposit: 1000000n,
          maxDeposit: 1000000000000n,
        },
      }

      expect(quote).toEqual(expectedQuote)
    })
  })

  describe('info', () => {
    it('should return provider info', () => {
      expect(provider.info).toEqual({
        dappId: ACROSS_HOOK_DAPP_ID,
        name: 'Across',
        logoUrl: expect.stringContaining('across-logo.png'),
        website: 'https://across.to',
      })
    })
  })

  describe('decodeBridgeHook', () => {
    it('should return bridging id', async () => {
      await expect(provider.decodeBridgeHook({} as unknown as latestAppData.CoWHook)).rejects.toThrowError(
        'Not implemented',
      )
    })
  })

  describe('getBridgingId', () => {
    const mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 100 }),
      getTransactionReceipt: jest.fn().mockResolvedValue({
        status: 'success',
        logs: [
          {
            address: '0x123',
            topics: ['0x123'],
          },
        ],
      }),
    } as unknown as JsonRpcProvider

    it('should return null if the transaction receipt has no deposit events', async () => {
      expect(await provider.getBridgingParams(10, mockProvider, '123', '123')).toBe(null)
    })
  })

  describe('getExplorerUrl', () => {
    it('should return explorer url', () => {
      expect(provider.getExplorerUrl('123')).toEqual('https://app.across.to/transactions/123')
    })
  })

  describe('getStatus', () => {
    const mockDepositStatus = {
      status: 'filled' as const,
      originChainId: '',
      depositId: '',
    }

    beforeEach(() => {
      const mockAcrossApi = new AcrossApi()
      jest.spyOn(mockAcrossApi, 'getDepositStatus').mockResolvedValue(mockDepositStatus)
      provider.setApi(mockAcrossApi)
    })

    it('should return a valid status when passed a valid bridging id', async () => {
      const status = await provider.getStatus('123', SupportedChainId.MAINNET)

      expect(status).toEqual({
        status: BridgeStatus.EXECUTED,
      })

      expect(provider.getApi().getDepositStatus).toHaveBeenCalledWith({
        originChainId: SupportedChainId.MAINNET.toString(),
        depositId: '123',
      })
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
