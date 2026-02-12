import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { SupportedEvmChainId } from '@cowprotocol/sdk-config'
import { GetExecutionStatusResponse, QuoteRequest, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

import { createAdapters } from '../../../tests/setup'
import { BridgeStatus } from '../../types'
import { NearIntentsApi } from './NearIntentsApi'
import type { NearIntentsBridgeProviderOptions } from './NearIntentsBridgeProvider'
import { NEAR_INTENTS_HOOK_DAPP_ID, NearIntentsBridgeProvider } from './NearIntentsBridgeProvider'
import { NEAR_INTENTS_SUPPORTED_NETWORKS } from './const'

import type { TargetEvmChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import type { QuoteResponse } from '@defuse-protocol/one-click-sdk-typescript'

// Mock NearIntentsApi
jest.mock('./NearIntentsApi')

class NearIntentsBridgeProviderTest extends NearIntentsBridgeProvider {
  constructor(options: NearIntentsBridgeProviderOptions = {}) {
    super(options)
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

    it('should pass apiKey to api', () => {
      const apiKey = 'test-api-key'
      const providerWithKey = new NearIntentsBridgeProviderTest({ apiKey })
      expect(providerWithKey.getApi()).toBeInstanceOf(NearIntentsApi)
      // Since NearIntentsApi is mocked, we can check if it was called with the apiKey.
      // However, the current mock setup might be tricky to inspect the constructor directly
      // without changing how the mock is defined at the top of the file.
      // Let's verify the mock calls.
      expect(NearIntentsApi).toHaveBeenCalledWith(apiKey)
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
        const result = await provider.getBuyTokens({ buyChainId: 12345 as TargetEvmChainId })
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
          buyChainId: SupportedEvmChainId.MAINNET,
        })
        expect(result.tokens.length).toBeGreaterThan(0)
        expect(result.tokens).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              chainId: SupportedEvmChainId.MAINNET,
              address: expect.any(String),
              decimals: expect.any(Number),
            }),
          ]),
        )
        expect(result.isRouteAvailable).toEqual(true)
        expect(api.getTokens).toHaveBeenCalledTimes(1)
      })
    })

    describe('info', () => {
      it('should return provider info', () => {
        expect(provider.info).toEqual({
          dappId: NEAR_INTENTS_HOOK_DAPP_ID,
          name: 'Near Intents',
          type: 'ReceiverAccountBridgeProvider',
          logoUrl: expect.stringContaining('near-intents-logo.png'),
          website: 'https://www.near.org/intents',
        })
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
        const status = await provider.getStatus('depositAddress', SupportedEvmChainId.BASE)
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
        const status = await provider.getStatus('depositAddress2', SupportedEvmChainId.BASE)
        expect(status).toEqual({
          status: BridgeStatus.UNKNOWN,
        })
      })
    })

    describe('getCancelBridgingTx', () => {
      it('should throw error as not implemented', async () => {
        await expect(() => provider.getCancelBridgingTx('123')).toThrow('Not implemented')
      })
    })

    describe('getRefundBridgingTx', () => {
      it('should throw error as not implemented', async () => {
        await expect(() => provider.getRefundBridgingTx('123')).toThrow('Not implemented')
      })
    })

    describe('getQuote', () => {
      const ATTESTATOR_ADDRESS = '0x0073DD100b51C555E41B2a452E5933ef76F42790'

      it('should return quote with id and signature', async () => {
        const api = new NearIntentsApi()
        const sellTokenAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
        const buyTokenAddress = '0x4200000000000000000000000000000000000006'
        const testQuoteHash = '0xtestQuoteHash123'

        const mockQuoteResponse: QuoteResponse = {
          quote: {
            amountIn: '1000000',
            amountInFormatted: '1.0',
            amountInUsd: '1.0',
            minAmountIn: '1000000',
            amountOut: '1000000',
            amountOutFormatted: '1.0',
            amountOutUsd: '1.0',
            minAmountOut: '990000',
            timeEstimate: 60,
            deadline: '2025-09-05T12:10:38.605Z',
            timeWhenInactive: '2025-09-05T12:10:38.605Z',
            depositAddress: '0xAd8b7139196c5ae9fb66B71C91d87A1F9071687e',
          },
          quoteRequest: {
            dry: false,
            swapType: QuoteRequest.swapType.EXACT_INPUT,
            depositMode: QuoteRequest.depositMode.SIMPLE,
            slippageTolerance: 100,
            originAsset: 'nep141:usdc.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset: 'nep141:base.omft.near',
            amount: '1000000',
            refundTo: '0x0000000000000000000000000000000000000000',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: '0x0000000000000000000000000000000000000000',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2025-09-05T12:10:38.605Z',
          },
          signature: 'ed25519:testSignature',
          timestamp: '2025-09-05T12:00:38.695Z',
        }

        jest.spyOn(api, 'getQuote').mockResolvedValue(mockQuoteResponse)
        jest.spyOn(api, 'getTokens').mockResolvedValue([
          {
            assetId: 'nep141:usdc.omft.near',
            decimals: 6,
            blockchain: TokenResponse.blockchain.BASE,
            symbol: 'USDC',
            price: 1,
            priceUpdatedAt: '2025-09-05T12:00:38.695Z',
            contractAddress: sellTokenAddress,
          },
          {
            assetId: 'nep141:base.omft.near',
            decimals: 18,
            blockchain: TokenResponse.blockchain.BASE,
            symbol: 'ETH',
            price: 1,
            priceUpdatedAt: '2025-09-05T12:00:38.695Z',
            contractAddress: buyTokenAddress,
          },
        ])
        jest.spyOn(api, 'getAttestation').mockResolvedValue({
          version: 1,
          signature:
            '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c',
        })
        provider.setApi(api)

        // Mock recoverDepositAddress to return the attestator address
        jest.spyOn(provider, 'recoverDepositAddress').mockResolvedValue({
          address: ATTESTATOR_ADDRESS,
          quoteHash: testQuoteHash,
          stringifiedQuote: '',
          attestationSignature: '',
        })

        const quote = await provider.getQuote({
          kind: OrderKind.SELL,
          sellTokenChainId: 8453,
          sellTokenAddress,
          sellTokenDecimals: 6,
          buyTokenChainId: 8453,
          buyTokenAddress,
          buyTokenDecimals: 18,
          amount: 1000000n,
          account: '0x0000000000000000000000000000000000000000',
          appCode: 'test',
          signer: '0x0000000000000000000000000000000000000000',
        })

        expect(quote.id).toBe(testQuoteHash)
        expect(quote.signature).toBe('ed25519:testSignature')
      })

      it('should return stringifiedQuote and attestationSignature', async () => {
        const api = new NearIntentsApi()

        const mockQuoteResponse: QuoteResponse = {
          quote: {
            amountIn: '1000000',
            amountInFormatted: '1.0',
            amountInUsd: '1.0',
            minAmountIn: '1000000',
            amountOut: '1000000',
            amountOutFormatted: '1.0',
            amountOutUsd: '1.0',
            minAmountOut: '990000',
            timeEstimate: 60,
            deadline: '2025-09-05T12:10:38.605Z',
            timeWhenInactive: '2025-09-05T12:10:38.605Z',
            depositAddress: '0xAd8b7139196c5ae9fb66B71C91d87A1F9071687e',
          },
          quoteRequest: {
            dry: false,
            swapType: QuoteRequest.swapType.EXACT_INPUT,
            depositMode: QuoteRequest.depositMode.SIMPLE,
            slippageTolerance: 100,
            originAsset: 'nep141:usdc.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset: 'nep141:base.omft.near',
            amount: '1000000',
            refundTo: '0x0000000000000000000000000000000000000000',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: '0x0000000000000000000000000000000000000000',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2025-09-05T12:10:38.605Z',
          },
          signature: 'ed25519:testSignature',
          timestamp: '2025-09-05T12:00:38.695Z',
        }

        const mockAttestationSignature =
          '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c'

        jest.spyOn(api, 'getAttestation').mockResolvedValue({
          version: 1,
          signature: mockAttestationSignature,
        })
        provider.setApi(api)

        const result = await provider.recoverDepositAddress(mockQuoteResponse)

        expect(result).not.toBeNull()
        expect(result?.attestationSignature).toBe(mockAttestationSignature)
        expect(result?.stringifiedQuote).toBeDefined()
        expect(result?.stringifiedQuote.length).toBeGreaterThan(0)
        expect(result?.quoteHash).toBeDefined()
        expect(result?.quoteHash.length).toBeGreaterThan(0)
        expect(result?.address).toBeDefined()
        expect(result?.address.length).toBeGreaterThan(0)
      })
    })
  })
})
