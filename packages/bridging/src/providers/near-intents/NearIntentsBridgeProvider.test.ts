import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { ETH_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { QuoteRequest, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'
import { padHex, zeroAddress } from 'viem'

import { createAdapters } from '../../../tests/setup'
import NearIntentsApi from './NearIntentsApi'
import { NEAR_INTENTS_SUPPORTED_NETWORKS, NearIntentsBridgeProvider } from './NearIntentsBridgeProvider'

import type { TargetChainId } from '@cowprotocol/sdk-config'
import type { QuoteBridgeRequest } from 'types'

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

    /*describe('info', () => {
      it('should return provider info', () => {
        expect(provider.info).toEqual({
          dappId: BUNGEE_HOOK_DAPP_ID,
          name: 'Bungee',
          logoUrl: expect.stringContaining('bungee-logo.png'),
          website: 'https://www.bungee.exchange',
        })
      })
    })

    describe('decodeBridgeHook', () => {
      it('should throw error as not implemented', async () => {
        await expect(provider.decodeBridgeHook({} as unknown as latestAppData.CoWHook)).rejects.toThrowError(
          'Not implemented',
        )
      })
    })

    describe('getExplorerUrl', () => {
      it('should return explorer url', () => {
        expect(provider.getExplorerUrl('123')).toEqual('https://socketscan.io/tx/123')
      })
    })

    describe('getStatus', () => {
      const mockEvents: BungeeEvent[] = [
        {
          identifier: '123',
          srcTransactionHash: '0x123',
          bridgeName: BungeeBridgeName.ACROSS,
          fromChainId: 1,
          gasUsed: '100000',
          isCowswapTrade: true,
          isSocketTx: true,
          metadata: '',
          orderId: '123',
          recipient: '0x789',
          sender: '0x123',
          socketContractVersion: '1.0.0',
          srcAmount: '1000000000000000000',
          srcBlockHash: '0x123',
          srcBlockNumber: 12345678,
          srcBlockTimeStamp: 1234567890,
          srcTokenAddress: '0x123',
          srcTokenDecimals: 18,
          srcTokenLogoURI: '',
          srcTokenName: 'Token 1',
          srcTokenSymbol: 'TOKEN1',
          to: '0x123',
          toChainId: 137,
          destTransactionHash: '0x456',
          destAmount: '1000000',
          destBlockHash: '0x456',
          destBlockNumber: 12345678,
          destBlockTimeStamp: 1234567890,
          destTokenAddress: '0x456',
          destTokenDecimals: 6,
          destTokenLogoURI: '',
          destTokenName: 'Token 2',
          destTokenSymbol: 'TOKEN2',
          srcTxStatus: BungeeEventStatus.COMPLETED,
          destTxStatus: BungeeEventStatus.COMPLETED,
        },
      ]

      beforeEach(() => {
        const api = new NearIntentsApi()
        jest.spyOn(api, 'getEvents').mockResolvedValue(mockEvents)
        provider.setApi(api)
      })

      it('should return executed status when both transactions are completed', async () => {
        const status = await provider.getStatus('123')

        expect(status).toEqual({
          status: BridgeStatus.EXECUTED,
          depositTxHash: '0x123',
          fillTxHash: '0x456',
        })
      })

      it('should return unknown status when no events are found', async () => {
        const api = new NearIntentsApi()
        jest.spyOn(api, 'getEvents').mockResolvedValue([])
        provider.setApi(api)

        const status = await provider.getStatus('123')

        expect(status).toEqual({
          status: BridgeStatus.UNKNOWN,
        })
      })
    })

    describe('getCancelBridgingTx', () => {
      it('should throw error as not implemented', async () => {
        await expect(provider.getCancelBridgingTx('123')).rejects.toThrowError('Not implemented')
      })
    })

    describe('getRefundBridgingTx', () => {
      it('should throw error as not implemented', async () => {
        await expect(provider.getRefundBridgingTx('123')).rejects.toThrowError('Not implemented')
      })
    })

    describe('getGasLimitEstimationForHook', () => {
      it('should return default gas limit estimation for non-Mainnet to Gnosis', async () => {
        mockGetCode.mockResolvedValue('0x1234567890')

        const request: QuoteBridgeRequest = {
          kind: OrderKind.SELL,
          sellTokenAddress: '0x123',
          sellTokenChainId: SupportedChainId.MAINNET,
          buyTokenChainId: SupportedChainId.POLYGON,
          amount: 1000000000000000000n,
          receiver: '0x789',
          account: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', // need to find cowshed account address
          sellTokenDecimals: 18,
          buyTokenAddress: '0x456',
          buyTokenDecimals: 6,
          appCode: '0x123',
          signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
        }

        const gasLimit = await provider.getGasLimitEstimationForHook(request)

        expect(gasLimit).toEqual(DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION)
      })

      it('should return default gas limit estimation for Mainnet to Polygon and deploy proxy account', async () => {
        mockGetCode.mockResolvedValue(undefined)

        const request: QuoteBridgeRequest = {
          kind: OrderKind.SELL,
          sellTokenAddress: '0x123',
          sellTokenChainId: SupportedChainId.MAINNET,
          buyTokenChainId: SupportedChainId.POLYGON,
          amount: 1000000000000000000n,
          receiver: '0x789',
          account: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', // need to find cowshed account address
          sellTokenDecimals: 18,
          buyTokenAddress: '0x456',
          buyTokenDecimals: 6,
          appCode: '0x123',
          signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
        }

        const gasLimit = await provider.getGasLimitEstimationForHook(request)

        expect(gasLimit).toEqual(DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + COW_SHED_PROXY_CREATION_GAS)
      })

      it('should return default gas limit estimation for Mainnet to Gnosis', async () => {
        mockGetCode.mockResolvedValue('0x1234567890')

        const request: QuoteBridgeRequest = {
          kind: OrderKind.SELL,
          sellTokenAddress: '0x123',
          sellTokenChainId: SupportedChainId.MAINNET,
          buyTokenChainId: SupportedChainId.GNOSIS_CHAIN,
          amount: 1000000000000000000n,
          receiver: '0x789',
          account: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', // need to find cowshed account address
          sellTokenDecimals: 18,
          buyTokenAddress: '0x456',
          buyTokenDecimals: 6,
          appCode: '0x123',
          signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
        }

        const gasLimit = await provider.getGasLimitEstimationForHook(request)

        expect(gasLimit).toEqual(DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + DEFAULT_EXTRA_GAS_FOR_HOOK_ESTIMATION)
      })

      it('should return default gas limit estimation for Mainnet to Gnosis and deploy proxy account', async () => {
        mockGetCode.mockResolvedValue('0x')

        const request: QuoteBridgeRequest = {
          kind: OrderKind.SELL,
          sellTokenAddress: '0x123',
          sellTokenChainId: SupportedChainId.MAINNET,
          buyTokenChainId: SupportedChainId.GNOSIS_CHAIN,
          amount: 1000000000000000000n,
          receiver: '0x789',
          account: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', // need to find cowshed account address
          sellTokenDecimals: 18,
          buyTokenAddress: '0x456',
          buyTokenDecimals: 6,
          appCode: '0x123',
          signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
        }

        const gasLimit = await provider.getGasLimitEstimationForHook(request)

        expect(gasLimit).toEqual(
          DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + COW_SHED_PROXY_CREATION_GAS + DEFAULT_EXTRA_GAS_PROXY_CREATION,
        )
      })
    })*/
  })
})
