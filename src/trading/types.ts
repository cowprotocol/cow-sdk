import type { AppDataParams, latest, LatestAppDataDocVersion } from '@cowprotocol/app-data'
import {
  AppData,
  AppDataHash,
  OrderKind,
  OrderParameters,
  OrderQuoteRequest,
  OrderQuoteResponse,
  QuoteAmountsAndCosts,
  TokenAmount,
} from '../order-book'
import type { AccountAddress, CowEnv, SignerLike, SupportedChainId } from '../common'
import type { UnsignedOrder } from '../order-signing'

export const ORDER_PRIMARY_TYPE = 'Order' as const

/**
 * EIP-712 typed data domain.
 */
interface TypedDataDomain {
  name: string
  version: string
  chainId: number
  verifyingContract: string
}

/**
 * EIP-712 typed data field.
 */
interface TypedDataField {
  name: string
  type: string
}

/**
 * EIP-712 typed data for an order.
 */
export interface OrderTypedData {
  domain: TypedDataDomain
  primaryType: typeof ORDER_PRIMARY_TYPE
  types: Record<string, TypedDataField[]>
  message: UnsignedOrder
}

/**
 * Minimal set of parameters to create a trade.
 */
export interface TradeBaseParameters {
  kind: OrderKind
  sellToken: OrderParameters['sellToken']
  sellTokenDecimals: number
  buyToken: OrderParameters['buyToken']
  buyTokenDecimals: number
  amount: TokenAmount
}

/**
 * Optional parameters to create a trade.
 */
export interface TradeOptionalParameters {
  env?: CowEnv
  partiallyFillable?: OrderParameters['partiallyFillable']
  slippageBps?: latest.SlippageBips
  receiver?: OrderParameters['receiver']
  validFor?: OrderParameters['validTo']
  partnerFee?: latest.PartnerFee
}

/**
 * Information about the trader.
 */
export interface TraderParameters {
  chainId: SupportedChainId
  appCode: latest.AppCode
  signer: SignerLike
}

export type QuoterParameters = Omit<TraderParameters, 'signer'> & { account: AccountAddress }

/**
 * Trade type, assets, amounts, and optional parameters.
 */
export interface TradeParameters extends TradeBaseParameters, TradeOptionalParameters {}

export interface SwapParameters extends TradeParameters, TraderParameters {}

export interface LimitTradeParameters extends Omit<TradeParameters, 'amount'> {
  sellAmount: OrderParameters['sellAmount']
  buyAmount: OrderParameters['buyAmount']
  /**
   * Id of the quote to be used for the limit order.
   */
  quoteId?: number
  validTo?: OrderParameters['validTo']
}

export interface LimitTradeParametersFromQuote extends LimitTradeParameters {
  quoteId: number
}

export interface LimitOrderParameters extends TraderParameters, LimitTradeParameters {}

export interface SwapAdvancedSettings {
  quoteRequest?: Partial<Omit<OrderQuoteRequest, 'kind'>>
  appData?: AppDataParams
}

export interface LimitOrderAdvancedSettings {
  appData?: AppDataParams
}

/**
 * Exhaustive set of data which includes information about trade, quote, order, "app-data", and more.
 * This data is used to create a trade, sign an order, and post it to the order book.
 */
export interface QuoteResults {
  tradeParameters: TradeParameters
  amountsAndCosts: QuoteAmountsAndCosts
  orderToSign: UnsignedOrder
  quoteResponse: OrderQuoteResponse
  appDataInfo: AppDataInfo
  orderTypedData: OrderTypedData
}

export interface QuoteResultsSerialized extends Omit<QuoteResults, 'amountsAndCosts'> {
  amountsAndCosts: QuoteAmountsAndCosts<string>
}

export interface QuoteAndPost {
  quoteResults: QuoteResults

  postSwapOrderFromQuote(): Promise<string>
}

export type AppDataRootSchema = latest.AppDataRootSchema

export interface BuildAppDataParams {
  appCode: latest.AppCode
  slippageBps: latest.SlippageBips
  orderClass: latest.OrderClass['orderClass']
  partnerFee?: latest.PartnerFee
}

/**
 * https://github.com/cowprotocol/app-data
 */
export interface AppDataInfo {
  doc: LatestAppDataDocVersion
  fullAppData: AppData
  appDataKeccak256: AppDataHash
}

/**
 * A standard Ethereum transaction object
 */
export interface TransactionParams {
  data: string
  gasLimit: string
  to: string
  value: string
}
