import { SupportedChainId } from '../../../chains'
import { parseUnits } from '@ethersproject/units'

import { BridgeCallDetails, BridgeQuoteResult, QuoteBridgeRequest } from '../../types'
import { OrderKind } from '@cowprotocol/contracts'
import {
  BuyTokenDestination,
  OrderQuoteResponse,
  QuoteAmountsAndCosts,
  SellTokenSource,
  SigningScheme,
} from '../../../order-book'
import { EvmCall } from '../../../common'
import { latest as latestAppData } from '@cowprotocol/app-data/dist/generatedTypes/latest'
import { AppDataInfo, OrderTypedData, TradeParameters } from '../../../trading'
import { UnsignedOrder } from '../../../order-signing'
import { Wallet } from '@ethersproject/wallet'
import { JsonRpcProvider } from '@ethersproject/providers'

// Sell token: USDC (mainnet)
const sellTokenChainId = SupportedChainId.MAINNET
const sellTokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const sellTokenDecimals = 6

// Intermediate token: COW (mainnet)
export const intermediateToken = '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB' // COW in mainnet
export const intermediateTokenDecimals = 18

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
export const mockSigner = new Wallet(pk, new JsonRpcProvider('https://sepolia.gateway.tenderly.co'))

mockSigner.sendTransaction = jest.fn().mockResolvedValue({ hash: '0x0005555' })

// Receiver of SWAP (cow-shed)
export const cowShedForAccount = '0x1111111111111111111111111111111111111111'

// Bridge quote timestamp/time to fill
export const bridgeQuoteTimestamp = 1742906914061
export const bridgeExpectedFillTimeSeconds = 100

// Bridge params:Sell USDC (mainnet) for WETH (base)
export const quoteBridgeRequest: QuoteBridgeRequest = {
  kind: OrderKind.SELL,
  sellTokenChainId,
  sellTokenAddress,
  sellTokenDecimals,
  buyTokenChainId,
  buyTokenAddress,
  buyTokenDecimals,
  signer: mockSigner,
  amount,
  appCode: 'BridgeSdk Test',
  account,
  receiver,
  partiallyFillable: false,
  slippageBps: 50,
}

// Response from Orderbook API
export const orderQuoteResponse: OrderQuoteResponse = {
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
export const amountsAndCosts: QuoteAmountsAndCosts = {
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

export const bridgeQuoteResult: BridgeQuoteResult = {
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
    bridgeFee: 150000000000000000n,
    destinationGasFee: 200000000000000000n,
  },
  limits: {
    minDeposit: 10000000000000000000n,
    maxDeposit: 50000000000000000000n,
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

export const bridgeCallDetails: BridgeCallDetails = {
  unsignedBridgeCall,
  preAuthorizedBridgingHook: {
    postHook: postHook,
    recipient: cowShedForAccount,
  },
}

const fullAppData =
  '{"appCode":"test","metadata":{"hooks":{"post":[{"callData":"0x2","dappId":"MockBridgeProvider","gasLimit":"0x2","target":"0x0000000000000000000000000000000000000000"}]}},"version":"1.3.0"}'

export const appDataInfo: AppDataInfo = {
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

export const tradeParameters: TradeParameters = {
  sellToken: sellTokenAddress,
  sellTokenDecimals: sellTokenDecimals,
  buyToken: intermediateToken,
  buyTokenDecimals: buyTokenDecimals,
  amount: amount.toString(),
  kind: OrderKind.SELL,
}

export const orderToSign: UnsignedOrder = {
  sellToken: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  buyToken: intermediateToken,
  receiver: '0xc8c753ee51e8fc80e199ab297fb575634a1ac1d3',
  sellAmount: '1005456782512030400',
  buyAmount: '400000000000000000000',
  partiallyFillable: false,
  kind: OrderKind.SELL,
  validTo: 1737468944,
  appData: '0xb27139d9c9fb9d28b05d943628abad2303e50bb43c191db8c99ebb903f00f4a8',
  feeAmount: '1112955650440102',
}

export const orderTypedData: OrderTypedData = {
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
