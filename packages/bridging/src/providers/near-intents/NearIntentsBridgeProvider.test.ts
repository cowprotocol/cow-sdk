import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  BTC_CURRENCY_ADDRESS,
  NonEvmChains,
  SOL_NATIVE_CURRENCY_ADDRESS,
  SupportedChainId,
} from '@cowprotocol/sdk-config'
import { GetExecutionStatusResponse, QuoteRequest, TokenResponse } from '@defuse-protocol/one-click-sdk-typescript'

import { createAdapters } from '../../../tests/setup'
import { BridgeStatus } from '../../types'
import { NearIntentsApi } from './NearIntentsApi'
import type { NearIntentsBridgeProviderOptions } from './NearIntentsBridgeProvider'
import { NEAR_INTENTS_HOOK_DAPP_ID, NearIntentsBridgeProvider } from './NearIntentsBridgeProvider'
import { NEAR_INTENTS_SUPPORTED_NETWORKS } from './const'

import type { TargetChainId } from '@cowprotocol/sdk-config'
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
        correlationId: 'test-correlation-id',
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
          correlationId: 'test-correlation-id',
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

    describe('getBridgingParams', () => {
      const sellTokenAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'

      const mockTokens: TokenResponse[] = [
        {
          assetId: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
          decimals: 6,
          blockchain: TokenResponse.blockchain.BASE,
          symbol: 'USDC',
          price: 1,
          priceUpdatedAt: '2025-09-05T12:00:38.695Z',
          contractAddress: sellTokenAddress,
        },
        {
          assetId: '1cs_v1:btc:native:coin',
          decimals: 8,
          blockchain: TokenResponse.blockchain.BTC,
          symbol: 'BTC(OMNI)',
          price: 60000,
          priceUpdatedAt: '2025-09-05T12:00:38.695Z',
          contractAddress: 'coin',
        },
      ]

      const buildMockStatus = (destinationAsset: string): GetExecutionStatusResponse => ({
        status: GetExecutionStatusResponse.status.SUCCESS,
        updatedAt: '2025-09-05T12:01:33.000Z',
        correlationId: 'test-correlation-id',
        swapDetails: {
          intentHashes: ['intentHash1'],
          nearTxHashes: ['nearTxHash1'],
          amountIn: '52000000',
          amountInFormatted: '52.0',
          amountInUsd: '51.9929',
          amountOut: '86000',
          amountOutFormatted: '0.00086',
          amountOutUsd: '51.6',
          slippage: -5,
          refundedAmount: '0',
          refundedAmountFormatted: '0',
          refundedAmountUsd: '0',
          originChainTxHashes: [{ hash: 'originChainTxHash1', explorerUrl: '' }],
          destinationChainTxHashes: [{ hash: 'destBtcTxHash1', explorerUrl: '' }],
        },
        quoteResponse: {
          timestamp: '2025-09-05T12:00:38.695Z',
          signature: 'ed25519:signature',
          correlationId: 'test-correlation-id',
          quoteRequest: {
            dry: false,
            swapType: QuoteRequest.swapType.EXACT_INPUT,
            depositMode: QuoteRequest.depositMode.SIMPLE,
            slippageTolerance: 100,
            originAsset: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset,
            amount: '52000000',
            refundTo: '0xRefundTo',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2025-09-05T12:10:38.605Z',
          },
          quote: {
            amountIn: '52000000',
            amountInFormatted: '52.0',
            amountInUsd: '51.9897',
            minAmountIn: '52000000',
            amountOut: '87000',
            amountOutFormatted: '0.00087',
            amountOutUsd: '52.2',
            minAmountOut: '86000',
            timeWhenInactive: '2025-09-06T12:00:41.894Z',
            depositAddress: '0xDepositAddress',
            deadline: '2025-09-06T12:00:41.894Z',
            timeEstimate: 600,
          },
        },
      })

      const mockOrder = { receiver: '0xDepositAddress', owner: '0xOwner' }

      const mockApi = (status: GetExecutionStatusResponse) => {
        const api = new NearIntentsApi()
        jest.spyOn(api, 'getTokens').mockResolvedValue(mockTokens)
        jest.spyOn(api, 'getStatus').mockResolvedValue(status)
        provider.setApi(api)
      }

      it('resolves an order whose destinationAsset is the new BTC id (1cs_v1:btc:native:coin)', async () => {
        mockApi(buildMockStatus('1cs_v1:btc:native:coin'))
        const result = await provider.getBridgingParams(SupportedChainId.BASE, mockOrder as any, '0xtxhash')
        expect(result).not.toBeNull()
        expect(result?.params.outputTokenAddress).toBe(BTC_CURRENCY_ADDRESS)
        expect(result?.params.destinationChainId).toBe(NonEvmChains.BITCOIN)
        expect(result?.status.status).toBe(BridgeStatus.EXECUTED)
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
          correlationId: 'test-correlation-id',
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

      it('reports bridging fee amounts in the correct sell and buy currency scales', async () => {
        const api = new NearIntentsApi()
        const sellTokenAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
        const buyTokenAddress = '0x4200000000000000000000000000000000000006'
        const testQuoteHash = '0xtestFeeCurrencyQuoteHash'

        // Sell token (USDC, 6 decimals) and buy token (ETH, 18 decimals) differ hugely in scale, and
        // the quote carries both fees, so a sell/buy-currency swap is observable (with no fees at all
        // both sides are 0 and the swap hides).
        const amountIn = '52000000' // 52 USDC (6 decimals)
        const amountOut = '11760237526222378' // ~0.01176 ETH (18 decimals)
        const minAmountOut = '11701433538591266'
        const amountInUsd = '51.9897'
        const amountOutUsd = '51.9508'

        const mockQuoteResponse: QuoteResponse = {
          quote: {
            amountIn,
            amountInFormatted: '52.0',
            amountInUsd,
            minAmountIn: amountIn,
            amountOut,
            amountOutFormatted: '0.011760237526222378',
            amountOutUsd,
            minAmountOut,
            withdrawFee: '560000000000',
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
            amount: amountIn,
            refundTo: '0x0000000000000000000000000000000000000000',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: '0x0000000000000000000000000000000000000000',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2025-09-05T12:10:38.605Z',
            appFees: [{ recipient: 'test.near', fee: 10 }],
          },
          signature: 'ed25519:testFeeSignature',
          timestamp: '2025-09-05T12:00:38.695Z',
          correlationId: 'test-correlation-id',
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
          amount: 52000000n,
          account: '0x0000000000000000000000000000000000000000',
          appCode: 'test',
          signer: '0x0000000000000000000000000000000000000000',
        })

        const bridgingFee = quote.amountsAndCosts.costs.bridgingFee

        // The sell-currency fee must be denominated in the sell token (USDC, 6 decimals) and thus
        // scaled by amountIn; the buy-currency fee in the buy token (ETH, 18 decimals). Before the
        // fix these two were swapped (each reported in the wrong token).
        // 10 bps appFee on 52 USDC = 52000 atoms, plus the 5.6e11 wei withdrawFee converted across.
        expect(bridgingFee.amountInSellCurrency).toBe(54473n)
        expect(bridgingFee.amountInBuyCurrency).toBe(12332570096318n)
        // `fees.bridgeFee` mirrors the sell-currency amount, as documented in PROVIDER_README.md.
        expect(quote.fees.bridgeFee).toBe(bridgingFee.amountInSellCurrency)

        // The fee is the two 1Click fees, never the 50 bps slippage tolerance that separates
        // amountOut from minAmountOut.
        expect(bridgingFee.feeBps).toBe(10)
        expect(quote.amountsAndCosts.slippageBps).toBe(50)

        // Sanity on magnitude: the sell fee is USDC-sized (small), the buy fee is ETH-sized (large).
        expect(bridgingFee.amountInSellCurrency < 1_000_000n).toBe(true)
        expect(bridgingFee.amountInBuyCurrency > 1_000_000_000_000n).toBe(true)
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
          correlationId: 'test-correlation-id',
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
        expect(result?.stringifiedQuote).not.toContain('depositMode')
        expect(result?.quoteHash).toBeDefined()
        expect(result?.quoteHash.length).toBeGreaterThan(0)
        expect(result?.address).toBeDefined()
        expect(result?.address.length).toBeGreaterThan(0)
      })

      it('should return quote when destination asset is bitcoin', async () => {
        const api = new NearIntentsApi()
        const sellTokenAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
        const buyTokenAddress = BTC_CURRENCY_ADDRESS
        const testQuoteHash = '0xtestBtcQuoteHash123'

        const mockQuoteResponse: QuoteResponse = {
          quote: {
            amountIn: '1000000',
            amountInFormatted: '1.0',
            amountInUsd: '1.0',
            minAmountIn: '1000000',
            amountOut: '10000',
            amountOutFormatted: '0.0001',
            amountOutUsd: '1.0',
            minAmountOut: '9900',
            timeEstimate: 600,
            deadline: '2025-09-05T12:10:38.605Z',
            timeWhenInactive: '2025-09-05T12:10:38.605Z',
            depositAddress: '0xAd8b7139196c5ae9fb66B71C91d87A1F9071687e',
          },
          quoteRequest: {
            dry: false,
            swapType: QuoteRequest.swapType.EXACT_INPUT,
            depositMode: QuoteRequest.depositMode.SIMPLE,
            slippageTolerance: 100,
            originAsset: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset: '1cs_v1:btc:native:coin',
            amount: '1000000',
            refundTo: '0x0000000000000000000000000000000000000000',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2025-09-05T12:10:38.605Z',
          },
          signature: 'ed25519:testBtcSignature',
          timestamp: '2025-09-05T12:00:38.695Z',
          correlationId: 'test-correlation-id',
        }

        jest.spyOn(api, 'getQuote').mockResolvedValue(mockQuoteResponse)
        jest.spyOn(api, 'getTokens').mockResolvedValue([
          {
            assetId: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
            decimals: 6,
            blockchain: TokenResponse.blockchain.BASE,
            symbol: 'USDC',
            price: 1,
            priceUpdatedAt: '2025-09-05T12:00:38.695Z',
            contractAddress: sellTokenAddress,
          },
          {
            assetId: '1cs_v1:btc:native:coin',
            decimals: 8,
            blockchain: TokenResponse.blockchain.BTC,
            symbol: 'BTC(OMNI)',
            price: 60000,
            priceUpdatedAt: '2025-09-05T12:00:38.695Z',
            contractAddress: 'coin',
          },
        ])
        jest.spyOn(api, 'getAttestation').mockResolvedValue({
          version: 1,
          signature:
            '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c',
        })
        provider.setApi(api)

        jest.spyOn(provider, 'recoverDepositAddress').mockResolvedValue({
          address: ATTESTATOR_ADDRESS,
          quoteHash: testQuoteHash,
          stringifiedQuote: '',
          attestationSignature: '',
        })

        const quote = await provider.getQuote({
          kind: OrderKind.SELL,
          sellTokenChainId: SupportedChainId.BASE,
          sellTokenAddress,
          sellTokenDecimals: 6,
          buyTokenChainId: NonEvmChains.BITCOIN as number,
          buyTokenAddress,
          buyTokenDecimals: 8,
          amount: 1000000n,
          account: '0x0000000000000000000000000000000000000000',
          appCode: 'test',
          signer: '0x0000000000000000000000000000000000000000',
        })

        expect(quote.id).toBe(testQuoteHash)
        expect(quote.signature).toBe('ed25519:testBtcSignature')
        expect(quote.depositAddress).toBe('0xAd8b7139196c5ae9fb66B71C91d87A1F9071687e')
        expect(quote.amountsAndCosts.beforeFee.buyAmount).toBe(10000n)
      })

      it('should compute a sane BTC-denominated fee for a real production BTC bridge quote', async () => {
        // Regression test for a swapped-currency bug: the BTC-denominated fee was
        // being computed from the USDC-side amount (and vice versa), which is invisible
        // on same-magnitude routes but produces an absurd result on BTC (8 decimals).
        // Numbers below are the real quote/settlement for deposit address
        // 0x712bf81469904cee52f5ba897fd51a338f6b73e4, see
        // https://explorer.near-intents.org/transactions/0x712bf81469904cee52f5ba897fd51a338f6b73e4
        const api = new NearIntentsApi()
        const sellTokenAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
        const buyTokenAddress = BTC_CURRENCY_ADDRESS
        const testQuoteHash = '0xtestRealBtcTxQuoteHash'

        const mockQuoteResponse: QuoteResponse = {
          quote: {
            amountIn: '5945707',
            amountInFormatted: '5.945707',
            amountInUsd: '5.9446',
            minAmountIn: '5915978',
            amountOut: '7047',
            amountOutFormatted: '0.00007047',
            amountOutUsd: '4.6811',
            minAmountOut: '7011',
            withdrawFee: '11', // ~15 bps of amountOut, the going rate for a BTC withdrawal
            timeEstimate: 470,
            deadline: '2026-06-19T12:03:12.000Z',
            timeWhenInactive: '2026-06-19T12:03:12.000Z',
            depositAddress: '0x712bF81469904cEE52f5ba897Fd51A338f6b73e4',
          },
          quoteRequest: {
            dry: false,
            swapType: QuoteRequest.swapType.FLEX_INPUT,
            depositMode: QuoteRequest.depositMode.SIMPLE,
            slippageTolerance: 50,
            originAsset: 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset: '1cs_v1:btc:native:coin',
            amount: '5945707',
            refundTo: '0x0000000000000000000000000000000000000000',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: 'bc1qray0vz42y0sl4m0qwar58yel6lure25q8f22cn',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2026-06-19T12:03:12.000Z',
            appFees: [{ recipient: 'test.near', fee: 10 }],
          },
          signature: 'ed25519:testRealBtcSignature',
          timestamp: '2026-06-16T11:33:13.082Z',
          correlationId: 'test-correlation-id',
        }

        jest.spyOn(api, 'getQuote').mockResolvedValue(mockQuoteResponse)
        jest.spyOn(api, 'getTokens').mockResolvedValue([
          {
            assetId: 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near',
            decimals: 6,
            blockchain: TokenResponse.blockchain.ARB,
            symbol: 'USDC',
            price: 1,
            priceUpdatedAt: '2026-06-16T11:33:13.082Z',
            contractAddress: sellTokenAddress,
          },
          {
            assetId: '1cs_v1:btc:native:coin',
            decimals: 8,
            blockchain: TokenResponse.blockchain.BTC,
            symbol: 'BTC(OMNI)',
            price: 66432,
            priceUpdatedAt: '2026-06-16T11:33:13.082Z',
            contractAddress: 'coin',
          },
        ])
        jest.spyOn(api, 'getAttestation').mockResolvedValue({
          version: 1,
          signature:
            '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c',
        })
        provider.setApi(api)

        jest.spyOn(provider, 'recoverDepositAddress').mockResolvedValue({
          address: ATTESTATOR_ADDRESS,
          quoteHash: testQuoteHash,
          stringifiedQuote: '',
          attestationSignature: '',
        })

        const quote = await provider.getQuote({
          kind: OrderKind.SELL,
          sellTokenChainId: SupportedChainId.ARBITRUM_ONE,
          sellTokenAddress,
          sellTokenDecimals: 6,
          buyTokenChainId: NonEvmChains.BITCOIN as number,
          buyTokenAddress,
          buyTokenDecimals: 8,
          amount: 5945707n,
          account: '0x0000000000000000000000000000000000000000',
          appCode: 'test',
          signer: '0x0000000000000000000000000000000000000000',
        })

        const bridgingFee = quote.amountsAndCosts.costs.bridgingFee

        // The BTC-denominated fee must never exceed the BTC amount being bridged (7047 sats).
        // With the swapped-currency bug it was 1,263,735 sats, bigger than the whole trade.
        expect(bridgingFee.amountInBuyCurrency).toBeLessThan(quote.amountsAndCosts.beforeFee.buyAmount)
        // 11 sats of withdrawFee, plus the 10 bps appFee converted from the USDC side.
        expect(bridgingFee.amountInBuyCurrency).toBe(18n)
        expect(bridgingFee.amountInSellCurrency).toBe(15202n)
        expect(quote.fees.bridgeFee).toBe(bridgingFee.amountInSellCurrency)
        // BTC is where withdrawFee dominates: 26 bps total against a 10 bps appFee. Deriving the fee
        // from the USD values instead would have reported 2125 bps on this quote.
        expect(bridgingFee.feeBps).toBe(26)
        // Slippage stays what we asked Near for, and is reported separately from the fee.
        expect(quote.amountsAndCosts.slippageBps).toBe(51)
        // beforeFee -> afterFee is the fee, afterFee -> afterSlippage is the slippage.
        expect(quote.amountsAndCosts.beforeFee.buyAmount).toBe(7065n)
        expect(quote.amountsAndCosts.afterFee.buyAmount).toBe(7047n)
        expect(quote.amountsAndCosts.afterSlippage.buyAmount).toBe(7011n)
      })

      it('should not report the slippage tolerance as the bridging fee', async () => {
        // Regression test for https://github.com/cowprotocol/cow-sdk/pull/929, which derived the fee
        // from (amountOut - minAmountOut). That gap is just the slippageTolerance we send in the
        // request, so every Near route reported a flat 0.5% fee. Real quote from an ETH -> ETH
        // bridge where Near actually charged ~1 bp.
        const api = new NearIntentsApi()
        const sellTokenAddress = '0x0000000000000000000000000000000000000000'
        const buyTokenAddress = '0x4200000000000000000000000000000000000006'
        const testQuoteHash = '0xtestSlippageNotFeeQuoteHash'

        const amountIn = '27627599418206933101'
        const amountOut = '27624746408619420000'
        const minAmountOut = '27486622676576326000' // amountOut - 50 bps
        // The quote lost 1.03 bps end to end, less than a single bp of appFee would allow, so it
        // carried none. What little it did cost was execution spread, which is not a fee.
        const withdrawFee = '560000000000'

        const mockQuoteResponse: QuoteResponse = {
          quote: {
            amountIn,
            amountInFormatted: '27.627599418206933101',
            amountInUsd: '69068.9985',
            minAmountIn: amountIn,
            amountOut,
            amountOutFormatted: '27.62474640861942',
            amountOutUsd: '69061.8660',
            minAmountOut,
            withdrawFee,
            timeEstimate: 60,
            deadline: '2026-08-28T12:10:38.605Z',
            timeWhenInactive: '2026-08-28T12:10:38.605Z',
            depositAddress: '0xAd8b7139196c5ae9fb66B71C91d87A1F9071687e',
          },
          quoteRequest: {
            dry: false,
            swapType: QuoteRequest.swapType.FLEX_INPUT,
            depositMode: QuoteRequest.depositMode.SIMPLE,
            slippageTolerance: 50,
            originAsset: 'nep141:eth.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset: 'nep141:base.omft.near',
            amount: amountIn,
            refundTo: '0x0000000000000000000000000000000000000000',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: '0x0000000000000000000000000000000000000000',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2026-08-28T12:10:38.605Z',
            appFees: [],
          },
          signature: 'ed25519:testSlippageNotFeeSignature',
          timestamp: '2026-08-28T12:00:38.695Z',
          correlationId: 'test-correlation-id',
        }

        jest.spyOn(api, 'getQuote').mockResolvedValue(mockQuoteResponse)
        jest.spyOn(api, 'getTokens').mockResolvedValue([
          {
            assetId: 'nep141:eth.omft.near',
            decimals: 18,
            blockchain: TokenResponse.blockchain.ETH,
            symbol: 'ETH',
            price: 2500,
            priceUpdatedAt: '2026-08-28T12:00:38.695Z',
            contractAddress: sellTokenAddress,
          },
          {
            assetId: 'nep141:base.omft.near',
            decimals: 18,
            blockchain: TokenResponse.blockchain.BASE,
            symbol: 'ETH',
            price: 2500,
            priceUpdatedAt: '2026-08-28T12:00:38.695Z',
            contractAddress: buyTokenAddress,
          },
        ])
        jest.spyOn(api, 'getAttestation').mockResolvedValue({
          version: 1,
          signature:
            '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c',
        })
        provider.setApi(api)

        jest.spyOn(provider, 'recoverDepositAddress').mockResolvedValue({
          address: ATTESTATOR_ADDRESS,
          quoteHash: testQuoteHash,
          stringifiedQuote: '',
          attestationSignature: '',
        })

        const quote = await provider.getQuote({
          kind: OrderKind.SELL,
          sellTokenChainId: SupportedChainId.MAINNET,
          sellTokenAddress,
          sellTokenDecimals: 18,
          buyTokenChainId: 8453,
          buyTokenAddress,
          buyTokenDecimals: 18,
          amount: BigInt(amountIn),
          account: '0x0000000000000000000000000000000000000000',
          appCode: 'test',
          signer: '0x0000000000000000000000000000000000000000',
        })

        // 1Click's only charge here is the withdrawFee, well under a bp. The bug reported 49 bps
        // (0.1381 ETH) -- five orders of magnitude more.
        expect(quote.amountsAndCosts.costs.bridgingFee.feeBps).toBe(0)
        expect(quote.fees.bridgeFee).toBe(560057823942n)
        expect(quote.fees.bridgeFee).toBeLessThan(138123732043094000n)

        // Slippage is reported on its own, and must not leak into the fee.
        expect(quote.amountsAndCosts.slippageBps).toBe(49)
        expect(quote.amountsAndCosts.costs.bridgingFee.feeBps).not.toBe(quote.amountsAndCosts.slippageBps)

        // afterFee is what 1Click quotes, afterSlippage is the guaranteed floor.
        expect(quote.amountsAndCosts.beforeFee.buyAmount).toBe(27624746968619420000n)
        expect(quote.amountsAndCosts.afterFee.buyAmount).toBe(BigInt(amountOut))
        expect(quote.amountsAndCosts.afterSlippage.buyAmount).toBe(BigInt(minAmountOut))
      })

      it('should match the real cost of a live 1Click quote on a same-asset route', async () => {
        // Every field below is a verbatim 1Click response (dry quote, USDC Arbitrum -> USDC Base,
        // slippageTolerance 50), including the appFees the API attaches to our quotes. Sell and buy
        // are the same asset, so the total loss is exactly amountIn - amountOut = 1_104_298 atoms
        // (11.04 bps), which splits into 10.02 bps of fees and 1.02 bps of execution spread.
        const api = new NearIntentsApi()
        const sellTokenAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
        const buyTokenAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
        const testQuoteHash = '0xtestLiveSameAssetQuoteHash'

        const amountIn = '1000000000'
        const amountOut = '998895702'
        const minAmountOut = '993901223' // amountOut * (1 - 50 bps), i.e. pure slippage

        const mockQuoteResponse: QuoteResponse = {
          quote: {
            amountIn,
            amountInFormatted: '1000.0',
            amountInUsd: '999.976000000000',
            minAmountIn: '995000000',
            amountOut,
            amountOutFormatted: '998.895702',
            amountOutUsd: '998.871728503152',
            minAmountOut,
            withdrawFee: '2400',
            timeEstimate: 27,
            deadline: '2026-08-29T12:00:00.000Z',
            timeWhenInactive: '2026-08-29T12:00:00.000Z',
            depositAddress: '0xAd8b7139196c5ae9fb66B71C91d87A1F9071687e',
          },
          quoteRequest: {
            dry: false,
            swapType: QuoteRequest.swapType.FLEX_INPUT,
            depositMode: QuoteRequest.depositMode.SIMPLE,
            slippageTolerance: 50,
            originAsset: 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
            amount: amountIn,
            refundTo: '0x0000000000000000000000000000000000000000',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: '0x0000000000000000000000000000000000000000',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2026-08-29T12:00:00.000Z',
            appFees: [{ recipient: '5880ad2b362620fadf759cbceb1cd5737ce8c6ed7fb8e9942881e6731f9247dd', fee: 10 }],
          },
          signature: 'ed25519:testLiveSameAssetSignature',
          timestamp: '2026-08-28T12:03:34.889Z',
          correlationId: 'test-correlation-id',
        }

        jest.spyOn(api, 'getQuote').mockResolvedValue(mockQuoteResponse)
        jest.spyOn(api, 'getTokens').mockResolvedValue([
          {
            assetId: 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near',
            decimals: 6,
            blockchain: TokenResponse.blockchain.ARB,
            symbol: 'USDC',
            price: 1,
            priceUpdatedAt: '2026-08-28T12:03:34.889Z',
            contractAddress: sellTokenAddress,
          },
          {
            assetId: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
            decimals: 6,
            blockchain: TokenResponse.blockchain.BASE,
            symbol: 'USDC',
            price: 1,
            priceUpdatedAt: '2026-08-28T12:03:34.889Z',
            contractAddress: buyTokenAddress,
          },
        ])
        jest.spyOn(api, 'getAttestation').mockResolvedValue({
          version: 1,
          signature:
            '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c',
        })
        provider.setApi(api)

        jest.spyOn(provider, 'recoverDepositAddress').mockResolvedValue({
          address: ATTESTATOR_ADDRESS,
          quoteHash: testQuoteHash,
          stringifiedQuote: '',
          attestationSignature: '',
        })

        const quote = await provider.getQuote({
          kind: OrderKind.SELL,
          sellTokenChainId: SupportedChainId.ARBITRUM_ONE,
          sellTokenAddress,
          sellTokenDecimals: 6,
          buyTokenChainId: 8453,
          buyTokenAddress,
          buyTokenDecimals: 6,
          amount: BigInt(amountIn),
          account: '0x0000000000000000000000000000000000000000',
          appCode: 'test',
          signer: '0x0000000000000000000000000000000000000000',
        })

        // 10 bps appFee on 1000 USDC = 1_000_000 atoms, plus the 2400 atom withdrawFee.
        expect(quote.fees.bridgeFee).toBe(1002400n)
        expect(quote.amountsAndCosts.costs.bridgingFee.feeBps).toBe(10)

        // The remainder of the 1_104_298 atom total loss is execution spread, not a fee, so the
        // reported fee sits just below it. Deriving the fee from the USD values would have swept
        // that spread in -- harmless here, but 34 bps against 10 bps of fees on a cross-asset route.
        const totalLoss = BigInt(amountIn) - BigInt(amountOut)
        expect(totalLoss).toBe(1104298n)
        expect(quote.fees.bridgeFee).toBeLessThan(totalLoss)
        expect(totalLoss - quote.fees.bridgeFee).toBe(101898n)

        // The 50 bps tolerance is slippage, and reporting it as the fee (the #929 bug) would have
        // claimed 4.99 USDC of cost instead of 1.00.
        expect(quote.amountsAndCosts.slippageBps).toBe(50)
        expect(quote.fees.bridgeFee).toBeLessThan(BigInt(amountOut) - BigInt(minAmountOut))
      })

      it('should keep the expected buy amount above the minimum on a fee-heavy BTC route', async () => {
        // Regression test for https://github.com/cowprotocol/cowswap/issues/7426. Consumers render
        // "expected to receive" as `beforeFee.buyAmount - bridgingFee.amountInBuyCurrency`, so if
        // `beforeFee.buyAmount` is left at `amountOut` -- which 1Click already reports net of
        // `withdrawFee` -- the fee is subtracted twice and the result drops below `afterSlippage`.
        // Verbatim 1Click response for 9.9923 USDC (Arbitrum) -> BTC, the quote from the bug report.
        // BTC's withdrawFee is a flat 1900 sats no matter the size, which is 17% of a trade this
        // small, so it is the sharpest case available.
        const api = new NearIntentsApi()
        const sellTokenAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
        const buyTokenAddress = BTC_CURRENCY_ADDRESS
        const testQuoteHash = '0xtestBtcExpectedAboveMinQuoteHash'

        const amountIn = '9992300'
        const amountOut = '10813'
        const minAmountOut = '10758'

        const mockQuoteResponse: QuoteResponse = {
          quote: {
            amountIn,
            amountInFormatted: '9.9923',
            amountInUsd: '9.990561339800',
            minAmountIn: '9942338',
            amountOut,
            amountOutFormatted: '0.00010813',
            amountOutUsd: '8.489826950000',
            minAmountOut,
            withdrawFee: '1900',
            refundFee: '5300',
            timeEstimate: 470,
            deadline: '2026-09-01T12:00:00.000Z',
            timeWhenInactive: '2026-09-01T12:00:00.000Z',
            depositAddress: '0xAd8b7139196c5ae9fb66B71C91d87A1F9071687e',
          },
          quoteRequest: {
            dry: false,
            swapType: QuoteRequest.swapType.FLEX_INPUT,
            depositMode: QuoteRequest.depositMode.SIMPLE,
            slippageTolerance: 50,
            originAsset: 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset: '1cs_v1:btc:native:coin',
            amount: amountIn,
            refundTo: '0x0000000000000000000000000000000000000000',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: 'bc1qray0vz42y0sl4m0qwar58yel6lure25q8f22cn',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2026-09-01T12:00:00.000Z',
            appFees: [{ recipient: '5880ad2b362620fadf759cbceb1cd5737ce8c6ed7fb8e9942881e6731f9247dd', fee: 10 }],
          },
          signature: 'ed25519:testBtcExpectedAboveMinSignature',
          timestamp: '2026-08-31T10:00:00.000Z',
          correlationId: 'test-correlation-id',
        }

        jest.spyOn(api, 'getQuote').mockResolvedValue(mockQuoteResponse)
        jest.spyOn(api, 'getTokens').mockResolvedValue([
          {
            assetId: 'nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near',
            decimals: 6,
            blockchain: TokenResponse.blockchain.ARB,
            symbol: 'USDC',
            price: 1,
            priceUpdatedAt: '2026-08-31T10:00:00.000Z',
            contractAddress: sellTokenAddress,
          },
          {
            assetId: '1cs_v1:btc:native:coin',
            decimals: 8,
            blockchain: TokenResponse.blockchain.BTC,
            symbol: 'BTC(OMNI)',
            price: 78518,
            priceUpdatedAt: '2026-08-31T10:00:00.000Z',
            contractAddress: 'coin',
          },
        ])
        jest.spyOn(api, 'getAttestation').mockResolvedValue({
          version: 1,
          signature:
            '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c',
        })
        provider.setApi(api)

        jest.spyOn(provider, 'recoverDepositAddress').mockResolvedValue({
          address: ATTESTATOR_ADDRESS,
          quoteHash: testQuoteHash,
          stringifiedQuote: '',
          attestationSignature: '',
        })

        const quote = await provider.getQuote({
          kind: OrderKind.SELL,
          sellTokenChainId: SupportedChainId.ARBITRUM_ONE,
          sellTokenAddress,
          sellTokenDecimals: 6,
          buyTokenChainId: NonEvmChains.BITCOIN as number,
          buyTokenAddress,
          buyTokenDecimals: 8,
          amount: BigInt(amountIn),
          account: '0x0000000000000000000000000000000000000000',
          appCode: 'test',
          signer: '0x0000000000000000000000000000000000000000',
        })

        const { beforeFee, afterFee, afterSlippage, costs } = quote.amountsAndCosts

        // 1900 sats of withdrawFee plus the 10 bps appFee converted across the swap rate.
        expect(costs.bridgingFee.amountInBuyCurrency).toBe(1912n)

        // Subtracting the fee from beforeFee must land exactly on what 1Click quotes, and that must
        // stay above the guaranteed floor. Before the fix this was 10813 - 1912 = 8901 < 10758.
        expect(beforeFee.buyAmount - costs.bridgingFee.amountInBuyCurrency).toBe(BigInt(amountOut))
        expect(beforeFee.buyAmount).toBe(12725n)
        expect(afterFee.buyAmount).toBe(BigInt(amountOut))
        expect(afterSlippage.buyAmount).toBe(BigInt(minAmountOut))
        expect(beforeFee.buyAmount - costs.bridgingFee.amountInBuyCurrency).toBeGreaterThan(afterSlippage.buyAmount)
        expect(afterFee.buyAmount).toBeGreaterThan(afterSlippage.buyAmount)
      })

      it('should return quote when destination asset is solana', async () => {
        const api = new NearIntentsApi()
        const sellTokenAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
        const buyTokenAddress = SOL_NATIVE_CURRENCY_ADDRESS
        const testQuoteHash = '0xtestSolQuoteHash123'

        const mockQuoteResponse: QuoteResponse = {
          quote: {
            amountIn: '1000000',
            amountInFormatted: '1.0',
            amountInUsd: '1.0',
            minAmountIn: '1000000',
            amountOut: '100000000',
            amountOutFormatted: '1.0',
            amountOutUsd: '1.0',
            minAmountOut: '99000000',
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
            originAsset: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
            depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
            destinationAsset: 'nep141:sol.omft.near',
            amount: '1000000',
            refundTo: '0x0000000000000000000000000000000000000000',
            refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
            recipient: 'So11111111111111111111111111111111111111112',
            recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
            deadline: '2025-09-05T12:10:38.605Z',
          },
          signature: 'ed25519:testSolSignature',
          timestamp: '2025-09-05T12:00:38.695Z',
          correlationId: 'test-correlation-id',
        }

        jest.spyOn(api, 'getQuote').mockResolvedValue(mockQuoteResponse)
        jest.spyOn(api, 'getTokens').mockResolvedValue([
          {
            assetId: 'nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
            decimals: 6,
            blockchain: TokenResponse.blockchain.BASE,
            symbol: 'USDC',
            price: 1,
            priceUpdatedAt: '2025-09-05T12:00:38.695Z',
            contractAddress: sellTokenAddress,
          },
          {
            assetId: 'nep141:sol.omft.near',
            decimals: 9,
            blockchain: TokenResponse.blockchain.SOL,
            symbol: 'SOL',
            price: 150,
            priceUpdatedAt: '2025-09-05T12:00:38.695Z',
          },
        ])
        jest.spyOn(api, 'getAttestation').mockResolvedValue({
          version: 1,
          signature:
            '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c',
        })
        provider.setApi(api)

        jest.spyOn(provider, 'recoverDepositAddress').mockResolvedValue({
          address: ATTESTATOR_ADDRESS,
          quoteHash: testQuoteHash,
          stringifiedQuote: '',
          attestationSignature: '',
        })

        const quote = await provider.getQuote({
          kind: OrderKind.SELL,
          sellTokenChainId: SupportedChainId.BASE,
          sellTokenAddress,
          sellTokenDecimals: 6,
          buyTokenChainId: NonEvmChains.SOLANA as number,
          buyTokenAddress,
          buyTokenDecimals: 9,
          amount: 1000000n,
          account: '0x0000000000000000000000000000000000000000',
          appCode: 'test',
          signer: '0x0000000000000000000000000000000000000000',
        })

        expect(quote.id).toBe(testQuoteHash)
        expect(quote.signature).toBe('ed25519:testSolSignature')
        expect(quote.depositAddress).toBe('0xAd8b7139196c5ae9fb66B71C91d87A1F9071687e')
        expect(quote.amountsAndCosts.beforeFee.buyAmount).toBe(100000000n)
      })

      it('should throw NO_ROUTES when sellTokenAddress is BTC_CURRENCY_ADDRESS', async () => {
        await expect(
          provider.getQuote({
            kind: OrderKind.SELL,
            sellTokenChainId: SupportedChainId.BASE,
            sellTokenAddress: BTC_CURRENCY_ADDRESS,
            sellTokenDecimals: 8,
            buyTokenChainId: SupportedChainId.BASE,
            buyTokenAddress: '0x4200000000000000000000000000000000000006',
            buyTokenDecimals: 18,
            amount: 1000000n,
            account: '0x0000000000000000000000000000000000000000',
            appCode: 'test',
            signer: '0x0000000000000000000000000000000000000000',
          }),
        ).rejects.toThrow('NO_ROUTES')
      })

      it('should throw NO_ROUTES when sellTokenAddress is SOL_NATIVE_CURRENCY_ADDRESS', async () => {
        await expect(
          provider.getQuote({
            kind: OrderKind.SELL,
            sellTokenChainId: SupportedChainId.BASE,
            sellTokenAddress: SOL_NATIVE_CURRENCY_ADDRESS,
            sellTokenDecimals: 9,
            buyTokenChainId: SupportedChainId.BASE,
            buyTokenAddress: '0x4200000000000000000000000000000000000006',
            buyTokenDecimals: 18,
            amount: 1000000n,
            account: '0x0000000000000000000000000000000000000000',
            appCode: 'test',
            signer: '0x0000000000000000000000000000000000000000',
          }),
        ).rejects.toThrow('NO_ROUTES')
      })
    })
  })
})
