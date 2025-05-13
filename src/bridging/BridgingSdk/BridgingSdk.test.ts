import { parseUnits } from '@ethersproject/units'
import { ALL_SUPPORTED_CHAINS, SupportedChainId, TargetChainId } from '../../chains'
import { BridgingSdk } from './BridgingSdk'
import { OrderKind } from '@cowprotocol/contracts'
import { MockBridgeProvider } from '../providers/mock/MockBridgeProvider'
import { mainnet } from '../../chains/details/mainnet'
import { optimism } from '../../chains/details/optimism'
import { sepolia } from '../../chains/details/sepolia'
import {
  AppDataInfo,
  OrderTypedData,
  QuoteAndPost,
  TradeParameters,
  TradingSdk,
  WithPartialTraderParams,
} from '../../trading'
import { BridgeCallDetails, BridgeQuoteResult, QuoteBridgeRequest } from '../types'
import { latest as latestAppData } from '@cowprotocol/app-data'
import {
  BuyTokenDestination,
  OrderBookApi,
  OrderQuoteResponse,
  QuoteAmountsAndCosts,
  SellTokenSource,
  SigningScheme,
} from '../../order-book'
import { QuoteResultsWithSigner } from '../../trading/getQuote'
import { UnsignedOrder } from '../../order-signing'
import { getSigner } from '../../common/utils/wallet'
import { assertIsBridgeQuoteAndPost, assertIsQuoteAndPost } from '../utils'
import { expectToEqual } from '../../test/utils'
import { EvmCall } from '../../common'

// Sell token: USDC (mainnet)
const sellTokenChainId = SupportedChainId.MAINNET
const sellTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const sellTokenDecimals = 6

// Intermediate token: COW (mainnet)
const intermediateToken = '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB' // COW in mainnet
const intermediateTokenDecimals = 18

// Buy token: WETH (base)
const buyTokenChainId = SupportedChainId.BASE
const buyTokenAddress = '0x4200000000000000000000000000000000000006'
const buyTokenDecimals = 18

// Amount: 100 USDC
const amount = parseUnits('100', 6).toBigInt()

// Signer
const pk = '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca'
const account = '0xc8C753ee51E8fC80E199AB297fB575634A1AC1D3'
const receiver = '0x79063d9173C09887d536924E2F6eADbaBAc099f5'
const signer = getSigner(pk)

// Receiver of SWAP (cow-shed)
const cowShedForAccount = '0x1111111111111111111111111111111111111111'

// Bridge quote timestamp/time to fill
const bridgeQuoteTimestamp = 1742906914061
const bridgeExpectedFillTimeSeconds = 100

// Bridge params:Sell USDC (mainnet) for WETH (base)
const quoteBridgeRequest: QuoteBridgeRequest = {
  kind: OrderKind.SELL,
  sellTokenChainId,
  sellTokenAddress,
  sellTokenDecimals,
  buyTokenChainId,
  buyTokenAddress,
  buyTokenDecimals,
  signer: pk,
  amount,
  appCode: 'BridgeSdk Test',
  account,
  receiver,
  partiallyFillable: false,
  slippageBps: 50,
}

// Response from Orderbook API
const orderQuoteResponse: OrderQuoteResponse = {
  quote: {
    sellToken: sellTokenAddress,
    buyToken: intermediateToken,
    receiver: cowShedForAccount,
    sellAmount: amount.toString(),
    buyAmount: parseUnits('100', intermediateTokenDecimals).toString(), // Lets assume CoW its at 1$ (then you get 100 COW for your 100 USDC)
    validTo: 1737468944,
    appData:
      '{"appCode":"test","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":50}},"version":"1.3.0"}',

    feeAmount: parseUnits('1', sellTokenDecimals).toString(), // 1 USDC
    kind: OrderKind.SELL,
    partiallyFillable: false,
    sellTokenBalance: SellTokenSource.ERC20,
    buyTokenBalance: BuyTokenDestination.ERC20,
    signingScheme: SigningScheme.EIP712,
  },
  from: '0xc8c753ee51e8fc80e199ab297fb575634a1ac1d3',
  expiration: '2025-01-21T14:07:44.176194885Z',
  id: 575498,
  verified: true,
}

// Swap costs
const amountsAndCosts: QuoteAmountsAndCosts = {
  isSell: true,
  afterNetworkCosts: {
    sellAmount: parseUnits('100', sellTokenDecimals).toBigInt(),
    buyAmount: parseUnits('100', buyTokenDecimals).toBigInt(),
  },
  afterPartnerFees: {
    sellAmount: parseUnits('100', sellTokenDecimals).toBigInt(),
    buyAmount: parseUnits('100', buyTokenDecimals).toBigInt(),
  },
  afterSlippage: {
    sellAmount: parseUnits('100', sellTokenDecimals).toBigInt(),
    buyAmount: parseUnits('100', buyTokenDecimals).toBigInt(),
  },

  costs: {
    networkFee: {
      amountInSellCurrency: parseUnits('100', sellTokenDecimals).toBigInt(),
      amountInBuyCurrency: parseUnits('100', buyTokenDecimals).toBigInt(),
    },
    partnerFee: {
      amount: parseUnits('100', sellTokenDecimals).toBigInt(),
      bps: 100,
    },
  },
  beforeNetworkCosts: {
    sellAmount: parseUnits('100', sellTokenDecimals).toBigInt(),
    buyAmount: parseUnits('100', buyTokenDecimals).toBigInt(),
  },
}

const bridgeQuoteResult: BridgeQuoteResult = {
  isSell: true,
  quoteTimestamp: bridgeQuoteTimestamp,
  expectedFillTimeSeconds: bridgeExpectedFillTimeSeconds,
  amountsAndCosts: {
    beforeFee: {
      sellAmount: parseUnits('100', sellTokenDecimals).toBigInt(),
      buyAmount: parseUnits('100', buyTokenDecimals).toBigInt(),
    },
    afterFee: {
      sellAmount: parseUnits('100', sellTokenDecimals).toBigInt(),
      buyAmount: parseUnits('100', buyTokenDecimals).toBigInt(),
    },
    afterSlippage: {
      sellAmount: parseUnits('100', sellTokenDecimals).toBigInt(),
      buyAmount: parseUnits('100', buyTokenDecimals).toBigInt(),
    },
    slippageBps: 50,
    costs: {
      bridgingFee: {
        feeBps: 100,
        amountInSellCurrency: parseUnits('100', sellTokenDecimals).toBigInt(),
        amountInBuyCurrency: parseUnits('100', buyTokenDecimals).toBigInt(),
      },
    },
  },
  fees: {
    bridgeFee: 50000n,
    destinationGasFee: 50000n,
  },
  limits: {
    minDeposit: 1000000n,
    maxDeposit: 1000000000000n,
  },
}

const unsignedBridgeCall: EvmCall = {
  to: '0x0000000000000000000000000000000000000000',
  data: '0x2',
  value: BigInt(2),
}

const postHook: latestAppData.CoWHook = {
  target: '0x0000000000000000000000000000000000000000',
  callData: '0x2',
  gasLimit: '0x2',
  dappId: 'MockBridgeProvider',
}

const bridgeCallDetails: BridgeCallDetails = {
  unsignedBridgeCall,
  preAuthorizedBridgingHook: {
    postHook: postHook,
    recipient: cowShedForAccount,
  },
}

const fullAppData =
  '{"appCode":"test","metadata":{"hooks":{"post":[{"callData":"0x2","dappId":"MockBridgeProvider","gasLimit":"0x2","target":"0x0000000000000000000000000000000000000000"}]}},"version":"1.3.0"}'
const appDataInfo: AppDataInfo = {
  fullAppData,
  appDataKeccak256: '0xb27139d9c9fb9d28b05d943628abad2303e50bb43c191db8c99ebb903f00f4a8',
  doc: {
    appCode: 'test',
    metadata: {
      hooks: {
        post: [postHook],
      },
    },
    version: '1.3.0',
  },
}

const tradeParameters: TradeParameters = {
  sellToken: sellTokenAddress,
  sellTokenDecimals: sellTokenDecimals,
  buyToken: intermediateToken,
  buyTokenDecimals: buyTokenDecimals,
  amount: amount.toString(),
  kind: OrderKind.SELL,
}

const orderToSign: UnsignedOrder = {
  sellToken: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  buyToken: intermediateToken,
  receiver: '0xc8c753ee51e8fc80e199ab297fb575634a1ac1d3',
  sellAmount: '1005456782512030400',
  buyAmount: '400000000000000000000',
  partiallyFillable: false,
  kind: OrderKind.SELL,
  validTo: 1737468944,
  appData: fullAppData,
  feeAmount: '1112955650440102',
}

const orderTypedData: OrderTypedData = {
  domain: {
    name: 'test',
    version: '1.3.0',
    chainId: 1,
    verifyingContract: '0x0000000000000000000000000000000000000000',
  },
  primaryType: 'Order',
  types: {},
  message: orderToSign,
}

describe('BridgingSdk', () => {
  let bridgingSdk: BridgingSdk
  let tradingSdk: TradingSdk
  let orderBookApi: OrderBookApi
  let quoteResult: QuoteResultsWithSigner

  const mockProvider = new MockBridgeProvider()
  mockProvider.getQuote = jest.fn().mockResolvedValue(bridgeQuoteResult)
  mockProvider.getUnsignedBridgeCall = jest.fn().mockResolvedValue(bridgeCallDetails.unsignedBridgeCall)
  mockProvider.getSignedHook = jest.fn().mockResolvedValue(bridgeCallDetails.preAuthorizedBridgingHook)

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    orderBookApi = {
      context: {
        chainId: SupportedChainId.GNOSIS_CHAIN,
      },
      getQuote: jest.fn().mockResolvedValue(orderQuoteResponse),
      sendOrder: jest.fn().mockResolvedValue('0x01'),
    } as unknown as OrderBookApi

    tradingSdk = new TradingSdk({}, { orderBookApi })
    quoteResult = {
      orderBookApi,
      result: {
        tradeParameters,
        orderToSign,
        amountsAndCosts,
        appDataInfo,
        quoteResponse: orderQuoteResponse,
        orderTypedData,
        signer,
      },
    }
    tradingSdk.getQuoteResults = jest.fn().mockResolvedValue(quoteResult)

    bridgingSdk = new BridgingSdk({
      providers: [mockProvider],
      orderBookApi: new OrderBookApi(),
      getErc20Decimals: async (_: TargetChainId, tokenAddress: string) => {
        if (tokenAddress !== intermediateToken) {
          throw new Error('This mock its supposed to be used for intermediate token')
        }

        return intermediateTokenDecimals
      },
      tradingSdk,
    })
  })

  describe('getProviders', () => {
    it('returns the providers', () => {
      const providers = bridgingSdk.getProviders()
      expect(providers).toEqual([mockProvider])
    })
  })

  describe('getSourceNetworks', () => {
    it('no networks are supported', async () => {
      const networks = await bridgingSdk.getSourceNetworks()
      expect(networks).toEqual(ALL_SUPPORTED_CHAINS)
    })
  })
  describe('getTargetNetworks', () => {
    it('no networks are supported', async () => {
      mockProvider.getNetworks = jest.fn().mockResolvedValue([])

      const networks = await bridgingSdk.getTargetNetworks()
      expect(mockProvider.getNetworks).toHaveBeenCalled()
      expect(networks).toEqual([])
    })

    it('list of supported networks', async () => {
      const expectedNetworks = [mainnet, optimism, sepolia]
      mockProvider.getNetworks = jest.fn().mockResolvedValue(expectedNetworks)

      const networks = await bridgingSdk.getTargetNetworks()
      expect(mockProvider.getNetworks).toHaveBeenCalled()
      expect(networks).toEqual(expectedNetworks)
    })

    it('errors buble up', async () => {
      mockProvider.getNetworks = jest.fn().mockRejectedValue(new Error("don't ask for networks"))

      await expect(bridgingSdk.getTargetNetworks()).rejects.toThrow("don't ask for networks")
    })
  })

  describe('getQuote', () => {
    it('cross-chain swap', async () => {
      const quote = await bridgingSdk.getQuote(quoteBridgeRequest)

      assertIsBridgeQuoteAndPost(quote)
      const { bridge, swap, postSwapOrderFromQuote } = quote

      expect(tradingSdk.getQuoteResults).toHaveBeenCalled()

      // Verify postSwapOrderFromQuote
      expect(postSwapOrderFromQuote).toBeDefined()

      // Verify swap result
      expectToEqual(swap.tradeParameters, tradeParameters)
      expectToEqual(swap.quoteResponse, orderQuoteResponse)
      expectToEqual(swap.orderTypedData, orderTypedData)
      expectToEqual(swap.orderToSign, orderToSign)
      expectToEqual(swap.appDataInfo, appDataInfo)
      expectToEqual(swap.amountsAndCosts, amountsAndCosts)

      // Verify basic bridge info
      expectToEqual(bridge.providerInfo, new MockBridgeProvider().info)
      expectToEqual(bridge.quoteTimestamp, bridgeQuoteTimestamp)
      expectToEqual(bridge.expectedFillTimeSeconds, bridgeExpectedFillTimeSeconds)

      expect(bridge.isSell).toEqual(true)
      expectToEqual(bridge.tradeParameters, {
        ...quoteBridgeRequest,
        sellTokenAddress: intermediateToken, // The sell token of the bridging should be the intermediate token
        sellTokenDecimals: intermediateTokenDecimals,
        amount: parseUnits('100', intermediateTokenDecimals).toString(),
      })

      // Verify amounts and costs
      const { amountsAndCosts: swapAmountsAndCosts } = swap
      expectToEqual(swapAmountsAndCosts.isSell, amountsAndCosts.isSell)
      expectToEqual(swapAmountsAndCosts.beforeNetworkCosts, amountsAndCosts.beforeNetworkCosts)
      expectToEqual(swapAmountsAndCosts.afterNetworkCosts, amountsAndCosts.afterNetworkCosts)
      expectToEqual(swapAmountsAndCosts.afterPartnerFees, amountsAndCosts.afterPartnerFees)
      expectToEqual(swapAmountsAndCosts.afterSlippage, amountsAndCosts.afterSlippage)
      expectToEqual(swapAmountsAndCosts.costs, amountsAndCosts.costs)

      // Verify bridge call details
      expectToEqual(bridge.bridgeCallDetails.preAuthorizedBridgingHook, bridgeCallDetails.preAuthorizedBridgingHook)
      expectToEqual(bridge.bridgeCallDetails.unsignedBridgeCall, bridgeCallDetails.unsignedBridgeCall)

      // Verify postSwapOrderFromQuote
      expect(postSwapOrderFromQuote).toBeDefined()
    })

    it('single-chain swap', async () => {
      const mainnetDai = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
      const mainnetDaiDecimals = 18

      const justBridgeParams: QuoteBridgeRequest = {
        ...quoteBridgeRequest,

        buyTokenChainId: SupportedChainId.MAINNET,
        buyTokenAddress: mainnetDai,
        buyTokenDecimals: mainnetDaiDecimals,
      }

      const { sellTokenAddress, buyTokenAddress, amount, ...rest } = justBridgeParams
      const tradeParameters: WithPartialTraderParams<TradeParameters> = {
        ...rest,
        sellToken: sellTokenAddress,
        buyToken: buyTokenAddress,
        amount: amount.toString(),
        chainId: SupportedChainId.MAINNET,
      }

      const singleChainQuoteResult: QuoteAndPost = {
        quoteResults: {
          tradeParameters,
          amountsAndCosts,
          orderToSign,
          quoteResponse: orderQuoteResponse,
          appDataInfo,
          orderTypedData,
        },
        postSwapOrderFromQuote: () =>
          Promise.resolve({
            orderId: '0x01',
            signingScheme: SigningScheme.EIP712,
            signature: '0x02',
            orderToSign,
          }),
      }
      tradingSdk.getQuote = jest.fn().mockResolvedValue(singleChainQuoteResult)

      // When asking for a quote to the bridging sdk
      const quote = await bridgingSdk.getQuote(justBridgeParams)

      // We get a single-chain quote
      assertIsQuoteAndPost(quote)
      const { quoteResults, postSwapOrderFromQuote } = quote

      // Verify the bridging SDK detegates to the trading sdk
      expect(tradingSdk.getQuote).toHaveBeenCalledWith(tradeParameters, undefined)

      // Verify the results matches expected results
      expect(quoteResults.amountsAndCosts).toEqual(amountsAndCosts)
      expect(quoteResults.tradeParameters).toEqual(tradeParameters)
      expect(quoteResults.orderToSign).toEqual(orderToSign)
      expect(quoteResults.quoteResponse).toEqual(orderQuoteResponse)
      expect(quoteResults.appDataInfo).toEqual(appDataInfo)
      expect(quoteResults.orderTypedData).toEqual(orderTypedData)

      // Verify postSwapOrderFromQuote
      expect(postSwapOrderFromQuote).toBeDefined()
    })
  })
})
