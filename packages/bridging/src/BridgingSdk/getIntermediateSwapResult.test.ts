import { getIntermediateSwapResult } from './getIntermediateSwapResult'
import { MockHookBridgeProvider } from '../providers/mock/HookMockBridgeProvider'
import {
  bridgeQuoteResult,
  cowShedForAccount,
  getMockSigner,
  intermediateToken,
  intermediateTokenDecimals,
  orderQuoteResponse,
  quoteBridgeRequest,
} from './mock/bridgeRequestMocks'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { SupportedEvmChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { createAdapters } from '../../tests/setup'
import { AbstractSigner, setGlobalAdapter, Provider, TTLCache } from '@cowprotocol/sdk-common'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../errors'
import { TradingSdk } from '@cowprotocol/sdk-trading'
import { GetQuoteWithBridgeParams } from './types'
import { cowAppDataLatestScheme } from '@cowprotocol/sdk-app-data'

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

const mockIntermediateTokens: TokenInfo[] = [
  {
    address: intermediateToken,
    name: 'COW',
    symbol: 'COW',
    decimals: intermediateTokenDecimals,
    chainId: SupportedEvmChainId.MAINNET,
  },
  { address: '0x456', name: 'Token2', symbol: 'TK2', decimals: 6, chainId: SupportedEvmChainId.MAINNET },
]

adapterNames.forEach((adapterName) => {
  describe(`getIntermediateSwapResult with ${adapterName}`, () => {
    let tradingSdk: TradingSdk
    let orderBookApi: OrderBookApi
    let mockProvider: MockHookBridgeProvider
    let signerMock: AbstractSigner<Provider>

    let getQuoteResultsMock: jest.SpyInstance
    let getIntermediateTokensMock: jest.Mock

    beforeEach(() => {
      const adapter = adapters[adapterName]
      setGlobalAdapter(adapter)

      signerMock = getMockSigner(adapter)
      quoteBridgeRequest.signer = signerMock

      jest.clearAllMocks()

      // Clear localStorage for clean test state
      if (typeof localStorage !== 'undefined') {
        localStorage.clear()
      }

      // Mock gas estimation to avoid RPC errors in tests
      const mockEstimateGas = jest.fn().mockResolvedValue(BigInt(200000))
      if (signerMock.estimateGas) {
        signerMock.estimateGas = mockEstimateGas
      }

      mockProvider = new MockHookBridgeProvider()
      mockProvider.getQuote = jest.fn().mockResolvedValue(bridgeQuoteResult)
      mockProvider.getIntermediateTokens = getIntermediateTokensMock = jest
        .fn()
        .mockResolvedValue(mockIntermediateTokens)

      orderBookApi = {
        context: {
          chainId: SupportedEvmChainId.GNOSIS_CHAIN,
        },
        getQuote: jest.fn().mockResolvedValue(orderQuoteResponse),
        uploadAppData: jest.fn().mockResolvedValue(''),
        sendOrder: jest.fn().mockResolvedValue('0x01'),
      } as unknown as OrderBookApi

      tradingSdk = new TradingSdk({}, { orderBookApi })
      getQuoteResultsMock = jest.spyOn(tradingSdk, 'getQuoteResults').mockResolvedValue({
        result: {
          amountsAndCosts: {
            isSell: true,
            afterSlippage: {
              sellAmount: quoteBridgeRequest.amount,
              buyAmount: BigInt('100000000000000000000'), // 100 tokens
            },
            afterNetworkCosts: {
              sellAmount: quoteBridgeRequest.amount,
              buyAmount: BigInt('100000000000000000000'),
            },
            afterPartnerFees: {
              sellAmount: quoteBridgeRequest.amount,
              buyAmount: BigInt('100000000000000000000'),
            },
            beforeNetworkCosts: {
              sellAmount: quoteBridgeRequest.amount,
              buyAmount: BigInt('100000000000000000000'),
            },
            costs: {
              networkFee: {
                amountInSellCurrency: BigInt('1000000'),
                amountInBuyCurrency: BigInt('1000000000000000000'),
              },
              partnerFee: {
                amount: BigInt('0'),
                bps: 0,
              },
            },
          },
          orderToSign: {
            sellToken: quoteBridgeRequest.sellTokenAddress,
            buyToken: intermediateToken,
            receiver: cowShedForAccount,
            sellAmount: quoteBridgeRequest.amount.toString(),
            buyAmount: '100000000000000000000',
            partiallyFillable: false,
            kind: quoteBridgeRequest.kind,
            validTo: 1737468944,
            appData: '0x73e0a8a63c57d14526a53b5dfd3789f723f42344067f8fd53c4a9c6a5eb1034c',
            feeAmount: '1000000',
          },
          tradeParameters: {
            sellToken: quoteBridgeRequest.sellTokenAddress,
            sellTokenDecimals: quoteBridgeRequest.sellTokenDecimals,
            buyToken: intermediateToken,
            buyTokenDecimals: intermediateTokenDecimals,
            amount: quoteBridgeRequest.amount.toString(),
            kind: quoteBridgeRequest.kind,
            owner: quoteBridgeRequest.account,
          },
          orderTypedData: {} as any,
          suggestedSlippageBps: 50,
          quoteResponse: orderQuoteResponse,
          appDataInfo: {
            fullAppData: '{}',
            appDataKeccak256: '0x73e0a8a63c57d14526a53b5dfd3789f723f42344067f8fd53c4a9c6a5eb1034c',
            doc: {
              appCode: 'test',
              metadata: {},
              version: '1.3.0',
            },
          },
        },
        orderBookApi,
      } as any)
    })

    describe('getIntermediateSwapResult', () => {
      it('should successfully get intermediate swap result', async () => {
        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        const result = await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(result).toBeDefined()
        expect(result.swapAndBridgeRequest).toEqual(quoteBridgeRequest)
        expect(result.signer).toBeDefined()
        expect(result.bridgeRequestWithoutAmount).toBeDefined()
        expect(result.bridgeRequestWithoutAmount?.sellTokenAddress).toBe(intermediateToken)
        expect(result.bridgeRequestWithoutAmount?.sellTokenDecimals).toBe(intermediateTokenDecimals)
        expect(result.intermediateTokenAmount).toBe(BigInt('100000000000000000000'))
        expect(result.intermediaryTokenDecimals).toBe(intermediateTokenDecimals)
        expect(result.swapResult).toBeDefined()
        expect(result.orderBookApi).toBe(orderBookApi)
      })

      it('should use the first intermediate token', async () => {
        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        const result = await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(getIntermediateTokensMock).toHaveBeenCalledTimes(1)
        const firstToken = mockIntermediateTokens[0]
        expect(result.bridgeRequestWithoutAmount?.sellTokenAddress).toBe(firstToken?.address)
        expect(result.bridgeRequestWithoutAmount?.sellTokenDecimals).toBe(firstToken?.decimals)
      })

      it('should throw error when no intermediate tokens are available', async () => {
        mockProvider.getIntermediateTokens = jest.fn().mockResolvedValue([])

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        await expect(
          getIntermediateSwapResult({
            provider: mockProvider,
            params,
          }),
        ).rejects.toThrow(BridgeProviderQuoteError)

        await expect(
          getIntermediateSwapResult({
            provider: mockProvider,
            params,
          }),
        ).rejects.toThrow(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS)
      })

      it('should call getQuoteResults with correct parameters', async () => {
        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(getQuoteResultsMock).toHaveBeenCalledTimes(1)
        const [swapParams] = getQuoteResultsMock.mock.calls[0] as any[]

        expect(swapParams.chainId).toBe(quoteBridgeRequest.sellTokenChainId)
        expect(swapParams.sellToken).toBe(quoteBridgeRequest.sellTokenAddress)
        expect(swapParams.buyToken).toBe(intermediateToken)
        expect(swapParams.buyTokenDecimals).toBe(intermediateTokenDecimals)
        expect(swapParams.amount).toBe(quoteBridgeRequest.amount.toString())
        expect(swapParams.kind).toBe(quoteBridgeRequest.kind)
        expect(swapParams.signer).toBe(signerMock)
      })

      it('should add bridging metadata to appData', async () => {
        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(getQuoteResultsMock).toHaveBeenCalledTimes(1)
        const [, advancedSettings] = getQuoteResultsMock.mock.calls[0] as any[]

        expect(advancedSettings?.appData?.metadata?.bridging).toBeDefined()
        expect(advancedSettings?.appData?.metadata?.bridging?.destinationChainId).toBe(
          quoteBridgeRequest.buyTokenChainId.toString(),
        )
        expect(advancedSettings?.appData?.metadata?.bridging?.destinationTokenAddress).toBe(
          quoteBridgeRequest.buyTokenAddress,
        )
      })

      it('should add bridge hook to post hooks when getBridgeHook is provided', async () => {
        const mockBridgeHook: cowAppDataLatestScheme.CoWHook = {
          target: '0x0000000000000000000000000000000000000001',
          callData: '0x123',
          gasLimit: '100000',
          dappId: 'test-bridge',
        }

        const getBridgeHook = jest.fn().mockResolvedValue(mockBridgeHook)

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
          getBridgeHook,
        })

        expect(getBridgeHook).toHaveBeenCalledTimes(1)
        expect(getQuoteResultsMock).toHaveBeenCalledTimes(1)

        const [, advancedSettings] = getQuoteResultsMock.mock.calls[0] as any[]
        expect(advancedSettings?.appData?.metadata?.hooks?.post).toContain(mockBridgeHook)
      })

      it('should preserve existing pre hooks and add bridge hook to post hooks', async () => {
        const mockBridgeHook: cowAppDataLatestScheme.CoWHook = {
          target: '0x0000000000000000000000000000000000000001',
          callData: '0x123',
          gasLimit: '100000',
          dappId: 'test-bridge',
        }

        const existingPreHook: cowAppDataLatestScheme.CoWHook = {
          target: '0x0000000000000000000000000000000000000002',
          callData: '0x456',
          gasLimit: '50000',
          dappId: 'existing-pre',
        }

        const existingPostHook: cowAppDataLatestScheme.CoWHook = {
          target: '0x0000000000000000000000000000000000000003',
          callData: '0x789',
          gasLimit: '75000',
          dappId: 'existing-post',
        }

        const getBridgeHook = jest.fn().mockResolvedValue(mockBridgeHook)

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
          advancedSettings: {
            appData: {
              metadata: {
                hooks: {
                  pre: [existingPreHook],
                  post: [existingPostHook],
                },
              },
            },
          },
        }

        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
          getBridgeHook,
        })

        const [, advancedSettings] = getQuoteResultsMock.mock.calls[0] as any[]
        expect(advancedSettings?.appData?.metadata?.hooks?.pre).toEqual([existingPreHook])
        expect(advancedSettings?.appData?.metadata?.hooks?.post).toEqual([existingPostHook, mockBridgeHook])
      })

      it('should not add hooks when getBridgeHook is not provided', async () => {
        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        const [, _advancedSettings] = getQuoteResultsMock.mock.calls[0] as any[]
        // When getBridgeHook is not provided, hooks are undefined
        expect(_advancedSettings?.appData?.metadata?.hooks).toBeUndefined()
      })

      it('should pass through top-level advanced settings', async () => {
        const customAdvancedSettings = {
          slippageBps: 100,
        } as any

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
          advancedSettings: customAdvancedSettings,
        }

        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        const [, advancedSettings] = getQuoteResultsMock.mock.calls[0] as any[]
        expect(advancedSettings?.slippageBps).toBe(100)
        // Note: metadata is overridden with hooks and bridging, not spread
        expect(advancedSettings?.appData?.metadata?.bridging).toBeDefined()
      })

      it('should use cached intermediate tokens when cache is provided', async () => {
        const intermediateTokensCache = new TTLCache<TokenInfo[]>('test', true, 10000)

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
          intermediateTokensCache,
        }

        // First call
        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        // Second call - should use cache
        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(getIntermediateTokensMock).toHaveBeenCalledTimes(1)
      })

      it('should not cache intermediate tokens when cache is not provided', async () => {
        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        // First call
        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        // Second call - should not use cache
        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(getIntermediateTokensMock).toHaveBeenCalledTimes(2)
      })

      it('should handle signer from request if provided', async () => {
        const customSigner = getMockSigner(adapters[adapterName])

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: {
            ...quoteBridgeRequest,
            signer: customSigner,
          },
          tradingSdk,
        }

        const result = await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(result.signer).toBeDefined()
      })

      it('should use global signer if not provided in request', async () => {
        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: {
            ...quoteBridgeRequest,
            signer: undefined,
          },
          tradingSdk,
        }

        const result = await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(result.signer).toBeDefined()
      })

      it('should correctly calculate intermediate token amount from swap result', async () => {
        const expectedBuyAmount = BigInt('250000000000000000000') // 250 tokens

        getQuoteResultsMock.mockResolvedValueOnce({
          result: {
            amountsAndCosts: {
              isSell: true,
              afterSlippage: {
                sellAmount: quoteBridgeRequest.amount,
                buyAmount: expectedBuyAmount,
              },
              afterNetworkCosts: {
                sellAmount: quoteBridgeRequest.amount,
                buyAmount: expectedBuyAmount,
              },
              afterPartnerFees: {
                sellAmount: quoteBridgeRequest.amount,
                buyAmount: expectedBuyAmount,
              },
              beforeNetworkCosts: {
                sellAmount: quoteBridgeRequest.amount,
                buyAmount: expectedBuyAmount,
              },
              costs: {
                networkFee: {
                  amountInSellCurrency: BigInt('1000000'),
                  amountInBuyCurrency: BigInt('1000000000000000000'),
                },
                partnerFee: {
                  amount: BigInt('0'),
                  bps: 0,
                },
              },
            },
            orderToSign: {} as any,
            tradeParameters: {} as any,
            orderTypedData: {} as any,
          },
          orderBookApi,
        } as any)

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        const result = await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(result.intermediateTokenAmount).toBe(expectedBuyAmount)
      })
    })

    describe('intermediate tokens caching', () => {
      it('should cache intermediate tokens with correct key', async () => {
        const intermediateTokensCache = new TTLCache<TokenInfo[]>('test', true, 10000)
        const setSpy = jest.spyOn(intermediateTokensCache, 'set')
        const getSpy = jest.spyOn(intermediateTokensCache, 'get')

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
          intermediateTokensCache,
        }

        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(setSpy).toHaveBeenCalledTimes(1)
        expect(getSpy).toHaveBeenCalledTimes(1)
        expect(setSpy.mock.calls[0]?.[1]).toEqual(mockIntermediateTokens)
      })

      it('should use different cache keys for different requests', async () => {
        const intermediateTokensCache = new TTLCache<TokenInfo[]>('test', true, 10000)
        const setSpy = jest.spyOn(intermediateTokensCache, 'set')

        const params1: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
          intermediateTokensCache,
        }

        const params2: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: {
            ...quoteBridgeRequest,
            buyTokenChainId: SupportedEvmChainId.ARBITRUM_ONE,
          },
          tradingSdk,
          intermediateTokensCache,
        }

        await getIntermediateSwapResult({
          provider: mockProvider,
          params: params1,
        })

        await getIntermediateSwapResult({
          provider: mockProvider,
          params: params2,
        })

        expect(setSpy).toHaveBeenCalledTimes(2)
        expect(getIntermediateTokensMock).toHaveBeenCalledTimes(2)
        // The cache keys should be different
        expect(setSpy.mock.calls[0]?.[0]).not.toBe(setSpy.mock.calls[1]?.[0])
      })
    })

    describe('error handling', () => {
      it('should propagate errors from getIntermediateTokens', async () => {
        const error = new Error('Failed to get intermediate tokens')
        mockProvider.getIntermediateTokens = jest.fn().mockRejectedValue(error)

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        await expect(
          getIntermediateSwapResult({
            provider: mockProvider,
            params,
          }),
        ).rejects.toThrow(error)
      })

      it('should propagate errors from tradingSdk.getQuoteResults', async () => {
        const error = new Error('Failed to get quote')
        getQuoteResultsMock.mockRejectedValue(error)

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        await expect(
          getIntermediateSwapResult({
            provider: mockProvider,
            params,
          }),
        ).rejects.toThrow(error)
      })

      it('should propagate errors from getBridgeHook', async () => {
        const error = new Error('Failed to get bridge hook')
        const getBridgeHook = jest.fn().mockRejectedValue(error)

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: quoteBridgeRequest,
          tradingSdk,
        }

        await expect(
          getIntermediateSwapResult({
            provider: mockProvider,
            params,
            getBridgeHook,
          }),
        ).rejects.toThrow(error)
      })
    })

    describe('getSwapQuote', () => {
      it('should pass swapSlippageBps correctly to tradingSdk.getQuoteResults when provided', async () => {
        const customSwapSlippageBps = 100

        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: {
            ...quoteBridgeRequest,
            swapSlippageBps: customSwapSlippageBps,
          },
          tradingSdk,
        }

        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(getQuoteResultsMock).toHaveBeenCalledTimes(1)
        const [swapParams] = getQuoteResultsMock.mock.calls[0] as any[]

        expect(swapParams.slippageBps).toBe(customSwapSlippageBps)
      })

      it('should not include bridgeSlippageBps in swap params passed to tradingSdk.getQuoteResults', async () => {
        const params: GetQuoteWithBridgeParams = {
          swapAndBridgeRequest: {
            ...quoteBridgeRequest,
            swapSlippageBps: 100,
            bridgeSlippageBps: 200,
          },
          tradingSdk,
        }

        await getIntermediateSwapResult({
          provider: mockProvider,
          params,
        })

        expect(getQuoteResultsMock).toHaveBeenCalledTimes(1)
        const [swapParams] = getQuoteResultsMock.mock.calls[0] as any[]

        expect(swapParams.slippageBps).toBe(100)
        expect(swapParams.bridgeSlippageBps).toBeUndefined()
      })
    })
  })
})
