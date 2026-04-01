import { cowAppDataLatestScheme as latestAppData } from '@cowprotocol/sdk-app-data'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { BridgeQuoteResult, BridgeStatus, QuoteBridgeRequest } from '../../types'
import { AcrossApi } from './AcrossApi'
import {
  ACROSS_HOOK_DAPP_ID,
  ACROSS_SUPPORTED_NETWORKS,
  AcrossBridgeProvider,
  AcrossBridgeProviderOptions,
} from './AcrossBridgeProvider'
import { ACROSS_SWAP_APPROVAL_MAX_DEPOSIT_LIMIT, type SwapApprovalApiResponse } from './swapApprovalMapper'
import { EVM_NATIVE_CURRENCY_ADDRESS, SupportedChainId, TargetChainId } from '@cowprotocol/sdk-config'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { AbstractProviderAdapter, getWrappedNativeToken, setGlobalAdapter } from '@cowprotocol/sdk-common'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { createAdapters } from '../../../tests/setup'
import { DEFAULT_EXTRA_GAS_FOR_HOOK_ESTIMATION, DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION } from '../../const'
import stringify from 'json-stable-stringify'

// Mock AcrossApi
jest.mock('./AcrossApi')

const TOKEN_A = { chainId: SupportedChainId.POLYGON, address: '0x123', decimals: 18, symbol: 'TOKEN1', name: 'Token 1' }
const TOKEN_B = { chainId: SupportedChainId.POLYGON, address: '0x456', decimals: 6, symbol: 'TOKEN2', name: 'Token 2' }

function padWordAcross(n: bigint): string {
  return n.toString(16).padStart(64, '0')
}

/** Matches fee math and timing used in getQuote expectations below. */
function mockSwapApprovalFixture(): SwapApprovalApiResponse {
  const quoteTs = 1234567890
  const fillDl = 1234567890
  const w7 = '0'.repeat(64)
  const body =
    [1n, 2n, 3n, 4n, 5n, 6n, 7n].map(padWordAcross).join('') +
    w7 +
    padWordAcross(BigInt(quoteTs)) +
    padWordAcross(BigInt(fillDl)) +
    padWordAcross(0n)
  const data = `0x110560ad${body}`

  return {
    id: '1',
    inputAmount: '1000000',
    expectedOutputAmount: '20000',
    inputToken: TOKEN_A,
    outputToken: TOKEN_B,
    expectedFillTime: 300,
    swapTx: {
      data,
      to: '0xabcd1234abcd1234abcd1234abcd1234abcd1234',
      chainId: SupportedChainId.MAINNET,
    },
    steps: {
      bridge: {
        outputAmount: '20000',
        fees: {
          pct: '100000000000000',
          amount: '100000',
          details: {
            type: 'across',
            relayerCapital: { pct: '50000000000000', amount: '50000' },
            destinationGas: { pct: '50000000000000', amount: '50000' },
            lp: { pct: '30000000000000', amount: '30000' },
          },
        },
      },
    },
  }
}
const mockTokens = [TOKEN_A, TOKEN_B]

/** Defaults for `QuoteBridgeRequest` in Across provider tests; spread overrides per case. */
const baseAcrossQuoteRequest: QuoteBridgeRequest = {
  kind: OrderKind.SELL,
  sellTokenAddress: '0x123',
  sellTokenChainId: SupportedChainId.MAINNET,
  buyTokenChainId: SupportedChainId.POLYGON,
  amount: 1000000000000000000n,
  receiver: '0x2000000000000000000000000000000000000002',
  account: '0x1000000000000000000000000000000000000001',
  sellTokenDecimals: 18,
  buyTokenAddress: '0x456',
  buyTokenDecimals: 6,
  appCode: '0x123',
  signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
}

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

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe(`AcrossBridgeProvider with ${adapterName}`, () => {
    let provider: AcrossBridgeProviderTest
    let adapter: AbstractProviderAdapter

    beforeEach(() => {
      adapter = adapters[adapterName] as AbstractProviderAdapter

      adapter.getCode = jest.fn().mockResolvedValue('0x1234567890')

      setGlobalAdapter(adapter)

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
        const result = await provider.getBuyTokens({ buyChainId: SupportedChainId.POLYGON })

        expect(result.tokens).toEqual(mockTokens)
        expect(result.isRouteAvailable).toEqual(true)
        // mockGetTokenInfos was called with a list of addresses which includes 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 and 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
      })

      it('should return empty array for unsupported chain', async () => {
        const result = await provider.getBuyTokens({ buyChainId: 12345 as TargetChainId })

        // The token result is empty and we don't call getTokenInfos
        expect(result.tokens).toEqual([])
        expect(result.isRouteAvailable).toEqual(false)
      })
    })

    describe('getQuote', () => {
      const mockSwapApproval = mockSwapApprovalFixture()

      beforeEach(() => {
        const mockAcrossApi = new AcrossApi()
        jest.spyOn(mockAcrossApi, 'getSwapApproval').mockResolvedValue(mockSwapApproval)
        provider.setApi(mockAcrossApi)
      })

      it('should return quote with swap approval payload', async () => {
        const request = { ...baseAcrossQuoteRequest }

        const { swapApproval, ...quote } = await provider.getQuote(request)

        expect(swapApproval).toEqual(mockSwapApproval)

        const expectedQuote: BridgeQuoteResult = {
          id: '1',
          isSell: true,
          quoteBody: stringify(mockSwapApproval),
          amountsAndCosts: {
            beforeFee: { sellAmount: 1000000000000000000n, buyAmount: 20000n },
            afterFee: { sellAmount: 1000000000000000000n, buyAmount: 19998n },
            afterSlippage: { sellAmount: 1000000000000000000n, buyAmount: 19898n },
            costs: {
              bridgingFee: {
                feeBps: 1,
                amountInSellCurrency: 100000000000000n,
                amountInBuyCurrency: 2n,
              },
            },
            slippageBps: 50,
          },
          quoteTimestamp: 1234567890,
          expectedFillTimeSeconds: 300,
          fees: {
            bridgeFee: 50000n,
            destinationGasFee: 50000n,
          },
          limits: {
            minDeposit: 1000000n,
            maxDeposit: BigInt(ACROSS_SWAP_APPROVAL_MAX_DEPOSIT_LIMIT),
          },
        }

        expect(quote).toEqual(expectedQuote)
      })

      it('should reject getQuote when sell token is native for EOA', async () => {
        const request: QuoteBridgeRequest = {
          ...baseAcrossQuoteRequest,
          sellTokenAddress: EVM_NATIVE_CURRENCY_ADDRESS,
        }

        const getSwapApprovalSpy = jest.spyOn(provider.getApi(), 'getSwapApproval')

        await expect(provider.getQuote(request)).rejects.toMatchObject({
          message: BridgeQuoteErrors.NO_ROUTES,
          context: { info: 'Across does not support native token deposit for EOA' },
        })

        expect(getSwapApprovalSpy).not.toHaveBeenCalled()
      })

      it('should reject getQuote when destination is wrapped native for EOA (matches getBuyTokens filter)', async () => {
        const wrapped = getWrappedNativeToken(SupportedChainId.MAINNET)
        if (!wrapped) {
          throw new Error('expected WETH on mainnet for test')
        }

        const request: QuoteBridgeRequest = {
          ...baseAcrossQuoteRequest,
          sellTokenChainId: SupportedChainId.POLYGON,
          buyTokenChainId: SupportedChainId.MAINNET,
          buyTokenAddress: wrapped.address,
          buyTokenDecimals: 18,
        }

        const getSwapApprovalSpy = jest.spyOn(provider.getApi(), 'getSwapApproval')

        await expect(provider.getQuote(request)).rejects.toThrow(BridgeProviderQuoteError)
        await expect(provider.getQuote(request)).rejects.toThrow(BridgeQuoteErrors.NO_ROUTES)

        expect(getSwapApprovalSpy).not.toHaveBeenCalled()
      })

      it('should pass account as swap-approval recipient when receiver is undefined', async () => {
        const mockAcrossApi = new AcrossApi()
        const getSwapApprovalSpy = jest.spyOn(mockAcrossApi, 'getSwapApproval').mockResolvedValue(mockSwapApproval)
        provider.setApi(mockAcrossApi)

        const account = '0x1111111111111111111111111111111111111111'
        const request: QuoteBridgeRequest = {
          ...baseAcrossQuoteRequest,
          account,
          receiver: undefined,
        }

        await provider.getQuote(request)

        const expectedDepositor = new CowShedSdk(adapter).getCowShedAccount(request.sellTokenChainId, account)
        expect(getSwapApprovalSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            recipient: account,
            depositor: expectedDepositor,
          }),
        )
      })

      it('should pass account as swap-approval recipient when receiver is empty string', async () => {
        const mockAcrossApi = new AcrossApi()
        const getSwapApprovalSpy = jest.spyOn(mockAcrossApi, 'getSwapApproval').mockResolvedValue(mockSwapApproval)
        provider.setApi(mockAcrossApi)

        const account = '0x2222222222222222222222222222222222222222'
        const request: QuoteBridgeRequest = {
          ...baseAcrossQuoteRequest,
          account,
          receiver: '' as QuoteBridgeRequest['receiver'],
        }

        await provider.getQuote(request)

        const expectedDepositor = new CowShedSdk(adapter).getCowShedAccount(request.sellTokenChainId, account)
        expect(getSwapApprovalSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            recipient: account,
            depositor: expectedDepositor,
          }),
        )
      })

      it('should pass receiver to swap approval when set', async () => {
        const mockAcrossApi = new AcrossApi()
        const getSwapApprovalSpy = jest.spyOn(mockAcrossApi, 'getSwapApproval').mockResolvedValue(mockSwapApproval)
        provider.setApi(mockAcrossApi)

        const receiver = '0x3333333333333333333333333333333333333333'
        const request: QuoteBridgeRequest = {
          ...baseAcrossQuoteRequest,
          receiver,
        }

        await provider.getQuote(request)

        const expectedDepositor = new CowShedSdk(adapter).getCowShedAccount(
          request.sellTokenChainId,
          request.owner ?? request.account,
        )
        expect(getSwapApprovalSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            recipient: receiver,
            depositor: expectedDepositor,
          }),
        )
      })
    })

    describe('info', () => {
      it('should return provider info', () => {
        expect(provider.info).toEqual({
          dappId: ACROSS_HOOK_DAPP_ID,
          name: 'Across',
          type: 'HookBridgeProvider',
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

    describe('getExplorerUrl', () => {
      it('should return explorer url', () => {
        expect(provider.getExplorerUrl('123', '0xaaa')).toEqual('https://app.across.to/transaction/0xaaa')
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

    describe('getGasLimitEstimationForHook', () => {
      it('should return default gas limit estimation for non-Mainnet to Gnosis', async () => {
        const request: QuoteBridgeRequest = {
          ...baseAcrossQuoteRequest,
          buyTokenChainId: SupportedChainId.ARBITRUM_ONE,
          account: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        }

        const gasLimit = await provider.getGasLimitEstimationForHook(request)

        expect(gasLimit).toEqual(DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + DEFAULT_EXTRA_GAS_FOR_HOOK_ESTIMATION)
      })
    })
  })
})
