import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { ETH_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { GetExecutionStatusResponse, QuoteRequest, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'
import { padHex, zeroAddress } from 'viem'

import { COW_SHED_PROXY_CREATION_GAS, DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION } from '../../const'
import { createAdapters } from '../../../tests/setup'
import NearIntentsApi from './NearIntentsApi'
import { NEAR_INTENTS_HOOK_DAPP_ID, NearIntentsBridgeProvider } from './NearIntentsBridgeProvider'
import { NEAR_INTENTS_SUPPORTED_NETWORKS } from './const'
import { BridgeStatus } from '../../types'

import type { TargetChainId } from '@cowprotocol/sdk-config'
import type { QuoteBridgeRequest } from '../../types'

// Mock NearIntentsApi
jest.mock('./NearIntentsApi')

class NearIntentsBridgeProviderTest extends NearIntentsBridgeProvider {
  constructor() {
    super({})
  }

  // Re-expose the API for testing
  public getApi() {
    return this.api
  }

  // Allow to set the API for testing
  public setApi(api: NearIntentsApi) {
    this.api = api
  }
}

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

const mockGetCode = jest.fn()

adapterNames.forEach((adapterName) => {
  describe(`NearIntentsBridgeProvider for ${adapterName}`, () => {
    let provider: NearIntentsBridgeProviderTest

    beforeEach(() => {
      const adapter = adapters[adapterName]
      adapter.getCode = mockGetCode
      setGlobalAdapter(adapter)
      provider = new NearIntentsBridgeProviderTest()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('getNetworks', () => {
      it('should return supported networks', async () => {
        const networks = await provider.getNetworks()
        expect(networks.length).toBeGreaterThan(0)
        expect(networks).toEqual(NEAR_INTENTS_SUPPORTED_NETWORKS)
      })
    })

    describe('getBuyTokens', () => {
      let api: NearIntentsApi

      const mockApi = (tokens: TokenResponse[]) => {
        api = new NearIntentsApi()
        jest.spyOn(api, 'getTokens').mockResolvedValue(tokens)
        provider.setApi(api)
      }

      it('should return empty array for unsupported chain', async () => {
        mockApi([])
        const result = await provider.getBuyTokens({ buyChainId: 12345 as TargetChainId })
        expect(result.tokens).toEqual([])
        expect(result.isRouteAvailable).toEqual(false)
        expect(api.getTokens).toHaveBeenCalledTimes(1)
      })

      it('should return tokens for supported chain', async () => {
        mockApi([
          {
            assetId: 'nep141:eth.omft.near',
            decimals: 18,
            blockchain: TokenResponse.blockchain.ETH,
            symbol: 'ETH',
            price: 4463.25,
            priceUpdatedAt: '2025-09-03T14:42:00.329Z',
          },
        ])
        const result = await provider.getBuyTokens({
          buyChainId: SupportedChainId.MAINNET,
        })
        expect(result.tokens.length).toBeGreaterThan(0)
        expect(result.tokens).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              chainId: SupportedChainId.MAINNET,
              address: expect.any(String),
              decimals: expect.any(Number),
            }),
          ]),
        )
        expect(result.isRouteAvailable).toEqual(true)
        expect(api.getTokens).toHaveBeenCalledTimes(1)
      })
    })

    describe('getQuote', () => {
      beforeEach(() => {
        const api = new NearIntentsApi()
        jest.spyOn(api, 'getTokens').mockResolvedValue([
          {
            assetId: 'nep141:eth.omft.near',
            decimals: 18,
            blockchain: TokenResponse.blockchain.ETH,
            symbol: 'ETH',
            price: 4463.25,
            priceUpdatedAt: '2025-09-03T14:42:00.329Z',
          },
          {
            assetId: 'nep245:v2_1.omni.hot.tg:137_11111111111111111111',
            decimals: 18,
            blockchain: TokenResponse.blockchain.POL,
            symbol: 'POL',
            price: 0.287879,
            priceUpdatedAt: '2025-09-03T14:42:00.329Z',
          },
        ])
        jest.spyOn(api, 'getQuote').mockResolvedValue({
          quote: {
            amountIn: '35000000000000',
            amountInFormatted: '0.000035',
            amountInUsd: '0.1566',
            minAmountIn: '35000000000000',
            amountOut: '468413404557660287',
            amountOutFormatted: '0.468413404557660287',
            amountOutUsd: '0.1349',
            minAmountOut: '463000005761085287',
            timeEstimate: 49,
            deadline: '2025-09-04T14:46:59.148Z',
            timeWhenInactive: '2025-09-04T14:46:59.148Z',
            depositAddress: '0xAd8b7139196c5ae9fb66B71C91d87A1F9071687e',
          },
          quoteRequest: {
            depositMode: QuoteRequest.depositMode.SIMPLE,
            quoteWaitingTimeMs: 3000,
            dry: false,
            swapType: QuoteRequest.swapType.EXACT_INPUT,
            slippageTolerance: 100,
            originAsset: 'nep141:eth.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset: 'nep245:v2_1.omni.hot.tg:137_11111111111111111111',
            amount: '35000000000000',
            refundTo: '0x0000000000000000000000000000000000000000',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: '0x0000000000000000000000000000000000000000',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2025-09-03T15:46:55.000Z',
          },
          signature: 'ed25519:Y54QM45ockDtJf3uAVhV8xndF79GPeQW5fJaZZLKfnaj8mW9NaBDsGg3uVXY1Fge73fYDAsdn9qokhjm2rsJATz',
          timestamp: '2025-09-03T14:46:55.987Z',
        })
        provider.setApi(api)
      })

      it('should return quote with deposit address', async () => {
        const request: QuoteBridgeRequest = {
          kind: OrderKind.SELL,
          sellTokenAddress: ETH_ADDRESS,
          sellTokenChainId: SupportedChainId.MAINNET,
          buyTokenChainId: SupportedChainId.POLYGON,
          amount: 35000000000000n,
          receiver: zeroAddress,
          account: zeroAddress,
          sellTokenDecimals: 18,
          buyTokenAddress: ETH_ADDRESS,
          buyTokenDecimals: 6,
          appCode: zeroAddress,
          signer: padHex('0x1'),
        }

        const quote = await provider.getQuote(request)

        expect(quote).toEqual({
          isSell: true,
          depositAddress: '0xAd8b7139196c5ae9fb66B71C91d87A1F9071687e',
          quoteTimestamp: 1756910815987,
          expectedFillTimeSeconds: 49,
          limits: { minDeposit: 35000000000000n, maxDeposit: 35000000000000n },
          fees: { bridgeFee: 0n, destinationGasFee: 0n },
          amountsAndCosts: {
            beforeFee: { sellAmount: 468413404557660287n, buyAmount: 35000000000000n },
            afterFee: { sellAmount: 468413404557660287n, buyAmount: 35000000000000n },
            afterSlippage: { sellAmount: 463000005761085287n, buyAmount: 35000000000000n },
            slippageBps: 1385,
            costs: { bridgingFee: { feeBps: 0, amountInSellCurrency: 0n, amountInBuyCurrency: 0n } },
          },
        })
      })
    })

    describe('info', () => {
      it('should return provider info', () => {
        expect(provider.info).toEqual({
          dappId: NEAR_INTENTS_HOOK_DAPP_ID,
          name: 'Near Intents',
          logoUrl: expect.stringContaining('near-intents-logo.png'),
          website: 'https://www.near.org/intents',
        })
      })
    })

    describe('decodeBridgeHook', () => {
      it('should throw error as not implemented', async () => {
        await expect(provider.decodeBridgeHook({} as unknown as LatestAppDataDocVersion.CoWHook)).rejects.toThrow(
          'Not implemented',
        )
      })
    })

    describe('getExplorerUrl', () => {
      it('should return explorer url', () => {
        expect(provider.getExplorerUrl('123')).toEqual('https://explorer.near-intents.org/transactions/123')
      })
    })

    describe('getStatus', () => {
      const mockStatus: GetExecutionStatusResponse = {
        status: GetExecutionStatusResponse.status.SUCCESS,
        updatedAt: '2025-09-05T12:01:33.000Z',
        swapDetails: {
          intentHashes: ['intentHash1'],
          nearTxHashes: ['nearTxHash1', 'nearTxHash2', 'nearTxHash3'],
          amountIn: '52000000',
          amountInFormatted: '52.0',
          amountInUsd: '51.9929',
          amountOut: '11765806672337253',
          amountOutFormatted: '0.011765806672337253',
          amountOutUsd: '51.9757',
          slippage: -5,
          refundedAmount: '0',
          refundedAmountFormatted: '0',
          refundedAmountUsd: '0',
          originChainTxHashes: [{ hash: 'originChainTxHash1', explorerUrl: '' }],
          destinationChainTxHashes: [{ hash: 'destinationChainTxHash2', explorerUrl: '' }],
        },
        quoteResponse: {
          timestamp: '2025-09-05T12:00:38.695Z',
          signature: 'ed25519:signature',
          quoteRequest: {
            dry: false,
            swapType: QuoteRequest.swapType.EXACT_INPUT,
            depositMode: QuoteRequest.depositMode.SIMPLE,
            slippageTolerance: 50,
            originAsset: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset: 'nep141:base.omft.near',
            amount: '52000000',
            refundTo: 'refundTo',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: 'recipient',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2025-09-05T12:10:38.605Z',
            appFees: [{ recipient: 'recipient', fee: 10 }],
            virtualChainRecipient: undefined,
            virtualChainRefundRecipient: undefined,
          },
          quote: {
            amountIn: '52000000',
            amountInFormatted: '52.0',
            amountInUsd: '51.9897',
            minAmountIn: '52000000',
            amountOut: '11760237526222378',
            amountOutFormatted: '0.011760237526222378',
            amountOutUsd: '51.9508',
            minAmountOut: '11701433538591266',
            timeWhenInactive: '2025-09-06T12:00:41.894Z',
            depositAddress: 'depositAddress',
            deadline: '2025-09-06T12:00:41.894Z',
            timeEstimate: 37,
          },
        },
      }

      const mockApi = (mockStatus: GetExecutionStatusResponse) => {
        const api = new NearIntentsApi()
        jest.spyOn(api, 'getStatus').mockResolvedValue(mockStatus)
        provider.setApi(api)
      }

      it('should return executed status when the order is filled on near', async () => {
        mockApi(mockStatus)
        const status = await provider.getStatus('depositAddress', SupportedChainId.BASE)
        expect(status).toEqual({
          status: BridgeStatus.EXECUTED,
          depositTxHash: 'originChainTxHash1',
          fillTxHash: 'destinationChainTxHash2',
        })
      })

      it('should return unknown status when no status is returned', async () => {
        const api = new NearIntentsApi()
        jest.spyOn(api, 'getStatus').mockResolvedValue({} as any)
        provider.setApi(api)
        const status = await provider.getStatus('depositAddress2', SupportedChainId.BASE)
        expect(status).toEqual({
          status: BridgeStatus.UNKNOWN,
        })
      })
    })

    describe('getCancelBridgingTx', () => {
      it('should throw error as not implemented', async () => {
        await expect(provider.getCancelBridgingTx('123')).rejects.toThrowError(new Error('Not implemented'))
      })
    })

    describe('getRefundBridgingTx', () => {
      it('should throw error as not implemented', async () => {
        await expect(provider.getRefundBridgingTx('123')).rejects.toThrowError(new Error('Not implemented'))
      })
    })

    describe('getGasLimitEstimationForHook', () => {
      it('should return default gas limit estimation', async () => {
        mockGetCode.mockResolvedValue('0x1234567890')
        const gasLimit = await provider.getGasLimitEstimationForHook({
          kind: OrderKind.SELL,
          sellTokenAddress: ETH_ADDRESS,
          sellTokenChainId: SupportedChainId.MAINNET,
          buyTokenChainId: SupportedChainId.POLYGON,
          amount: 1000000000000000000n,
          receiver: zeroAddress,
          account: zeroAddress,
          sellTokenDecimals: 18,
          buyTokenAddress: zeroAddress,
          buyTokenDecimals: 6,
          appCode: zeroAddress,
          signer: padHex('0x'),
        })
        expect(gasLimit).toEqual(DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION)
      })

      it('should return default gas limit estimation and deploy proxy account', async () => {
        mockGetCode.mockResolvedValue(undefined)
        const gasLimit = await provider.getGasLimitEstimationForHook({
          kind: OrderKind.SELL,
          sellTokenAddress: ETH_ADDRESS,
          sellTokenChainId: SupportedChainId.MAINNET,
          buyTokenChainId: SupportedChainId.POLYGON,
          amount: 1000000000000000000n,
          receiver: zeroAddress,
          account: zeroAddress,
          sellTokenDecimals: 18,
          buyTokenAddress: zeroAddress,
          buyTokenDecimals: 6,
          appCode: zeroAddress,
          signer: padHex('0x'),
        })
        expect(gasLimit).toEqual(DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + COW_SHED_PROXY_CREATION_GAS)
      })
    })
  })
})
