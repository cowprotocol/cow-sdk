import { cowAppDataLatestScheme as latestAppData } from '@cowprotocol/sdk-app-data'
import { BridgeStatus, QuoteBridgeRequest } from '../../types'
import { BungeeApi } from './BungeeApi'
import {
  BUNGEE_HOOK_DAPP_ID,
  BUNGEE_SUPPORTED_NETWORKS,
  BungeeBridgeProvider,
  BungeeBridgeProviderOptions,
  BungeeQuoteResult,
} from './BungeeBridgeProvider'
import { BungeeBridge, BungeeBridgeName, BungeeBuildTx, BungeeEvent, BungeeEventStatus, BungeeQuote } from './types'
import { SupportedChainId, TargetChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { createAdapters } from '../../../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

// Mock BungeeApi
jest.mock('./BungeeApi')

class BungeeBridgeProviderTest extends BungeeBridgeProvider {
  constructor(options: BungeeBridgeProviderOptions) {
    super(options)
  }

  // Re-expose the API for testing
  public getApi() {
    return this.api
  }

  // Allow to set the API for testing
  public setApi(api: BungeeApi) {
    this.api = api
  }
}

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe(`BungeeBridgeProvider for ${adapterName}`, () => {
    let provider: BungeeBridgeProviderTest

    beforeEach(() => {
      const adapter = adapters[adapterName]

      setGlobalAdapter(adapter)

      const options = {
        apiOptions: {},
      }
      provider = new BungeeBridgeProviderTest(options)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('getNetworks', () => {
      it('should return supported networks', async () => {
        const networks = await provider.getNetworks()

        expect(networks.length).toBeGreaterThan(0)
        expect(networks).toEqual(BUNGEE_SUPPORTED_NETWORKS)
      })
    })

    describe('getBuyTokens', () => {
      beforeEach(() => {
        const mockBungeeApi = new BungeeApi()
        // Mock the getBuyTokens method
        jest.spyOn(mockBungeeApi, 'getBuyTokens').mockImplementation(async (params) => {
          if (params.buyChainId === (12345 as TargetChainId)) {
            return []
          } else if (params.buyChainId === (137 as TargetChainId)) {
            return [
              {
                chainId: SupportedChainId.POLYGON,
                address: '0x123',
                decimals: 18,
                name: 'Test Token',
                symbol: 'TEST',
                logoUrl: 'https://example.com/logo.png',
              },
            ]
          }
          return []
        })
        provider.setApi(mockBungeeApi)
      })

      it('should return empty array for unsupported chain', async () => {
        const tokens = await provider.getBuyTokens({ buyChainId: 12345 as TargetChainId })

        expect(tokens).toEqual([])
      })

      it('should return tokens for supported chain', async () => {
        const tokens = await provider.getBuyTokens({ buyChainId: SupportedChainId.POLYGON })

        expect(tokens.length).toBeGreaterThan(0)
        expect(tokens).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              chainId: SupportedChainId.POLYGON,
              address: expect.any(String),
              decimals: expect.any(Number),
            }),
          ]),
        )
      })
    })

    describe('getQuote', () => {
      const mockBungeeQuote: BungeeQuote = {
        originChainId: 1,
        destinationChainId: 137,
        userAddress: '0x123',
        receiverAddress: '0x789',
        input: {
          token: {
            chainId: 1,
            address: '0x123',
            name: 'Token 1',
            symbol: 'TOKEN1',
            decimals: 18,
            logoURI: '',
            icon: '',
          },
          amount: '1000000000000000000',
          priceInUsd: 1,
          valueInUsd: 1,
        },
        route: {
          affiliateFee: null,
          quoteId: '123',
          quoteExpiry: 1234567890,
          output: {
            token: {
              chainId: 137,
              address: '0x456',
              name: 'Token 2',
              symbol: 'TOKEN2',
              decimals: 6,
              logoURI: '',
              icon: '',
            },
            amount: '1000000',
            priceInUsd: 1,
            valueInUsd: 1,
            minAmountOut: '999900',
            effectiveReceivedInUsd: 1,
          },
          approvalData: {
            spenderAddress: '0x123',
            amount: '1000000000000000000',
            tokenAddress: '0x123',
            userAddress: '0x123',
          },
          gasFee: {
            gasToken: {
              chainId: 1,
              address: '0x123',
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              icon: '',
              logoURI: '',
              chainAgnosticId: null,
            },
            gasLimit: '100000',
            gasPrice: '1000000000',
            estimatedFee: '50000',
            feeInUsd: 1,
          },
          slippage: 0,
          estimatedTime: 300,
          routeDetails: {
            name: 'across',
            logoURI: '',
            routeFee: {
              token: {
                chainId: 1,
                address: '0x123',
                name: 'Token 1',
                symbol: 'TOKEN1',
                decimals: 18,
                logoURI: '',
                icon: '',
              },
              amount: '5000000000000000',
              feeInUsd: 1,
              priceInUsd: 1,
            },
            dexDetails: null,
          },
          refuel: null,
        },
        routeBridge: BungeeBridge.Across,
        quoteTimestamp: 1234567890,
      }

      const mockBuildTx: BungeeBuildTx = {
        approvalData: {
          spenderAddress: '0x123',
          amount: '1000000000000000000',
          tokenAddress: '0x123',
          userAddress: '0x123',
        },
        txData: {
          data: '0x',
          to: '0x123',
          chainId: 1,
          value: '0',
        },
        userOp: '',
      }

      beforeEach(() => {
        const mockBungeeApi = new BungeeApi()
        jest.spyOn(mockBungeeApi, 'getBungeeQuoteWithBuildTx').mockResolvedValue({
          bungeeQuote: mockBungeeQuote,
          buildTx: mockBuildTx,
        })
        jest.spyOn(mockBungeeApi, 'verifyBungeeBuildTx').mockResolvedValue(true)
        provider.setApi(mockBungeeApi)
      })

      it('should return quote with bungee quote data', async () => {
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

        const quote = await provider.getQuote(request)

        const expectedQuote: BungeeQuoteResult = {
          isSell: true,
          amountsAndCosts: {
            beforeFee: { sellAmount: 1000000000000000000n, buyAmount: 1000000n },
            afterFee: { sellAmount: 1000000000000000000n, buyAmount: 1000000n },
            afterSlippage: { sellAmount: 1000000000000000000n, buyAmount: 1000000n },
            costs: {
              bridgingFee: {
                feeBps: 50,
                amountInSellCurrency: 5000000000000000n,
                amountInBuyCurrency: 0n,
              },
            },
            slippageBps: 0,
          },
          quoteTimestamp: 1234567890,
          expectedFillTimeSeconds: 300,
          fees: {
            bridgeFee: 5000000000000000n,
            destinationGasFee: 0n,
          },
          limits: {
            minDeposit: 0n,
            maxDeposit: 0n,
          },
          bungeeQuote: mockBungeeQuote,
          buildTx: mockBuildTx,
        }

        expect(quote).toEqual(expectedQuote)
      })
    })

    describe('info', () => {
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
        const mockBungeeApi = new BungeeApi()
        jest.spyOn(mockBungeeApi, 'getEvents').mockResolvedValue(mockEvents)
        provider.setApi(mockBungeeApi)
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
        const mockBungeeApi = new BungeeApi()
        jest.spyOn(mockBungeeApi, 'getEvents').mockResolvedValue([])
        provider.setApi(mockBungeeApi)

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
  })
})
