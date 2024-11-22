import type { AppDataParams, latest, LatestAppDataDocVersion } from '@cowprotocol/app-data'
import type { Address, OrderKind, OrderQuoteRequest, OrderQuoteResponse, QuoteAmountsAndCosts } from '../order-book'
import type { Signer } from '@ethersproject/abstract-signer'
import type { CowEnv, SupportedChainId } from '../common'
import type { ExternalProvider } from '@ethersproject/providers'
import type { UnsignedOrder } from '../order-signing'

export type PrivateKey = string // 64 characters
export type AccountAddress = `0x${string}` // 42 characters

export const ORDER_PRIMARY_TYPE = 'Order' as const

interface TypedDataDomain {
  name: string
  version: string
  chainId: number
  verifyingContract: string
}

interface TypedDataField {
  name: string
  type: string
}

export interface OrderTypedData {
  domain: TypedDataDomain
  primaryType: typeof ORDER_PRIMARY_TYPE
  types: {
    Order: TypedDataField[]
  }
  message: UnsignedOrder
}

export interface TradeBaseParameters {
  kind: OrderKind
  sellToken: Address
  sellTokenDecimals: number
  buyToken: Address
  buyTokenDecimals: number
  amount: string
}

export interface TradeOptionalParameters {
  env?: CowEnv
  partiallyFillable?: boolean
  slippageBps?: number
  receiver?: string
  validFor?: number
  partnerFee?: latest.PartnerFee
}

export interface TraderParameters {
  chainId: SupportedChainId
  appCode: string
  signer: Signer | ExternalProvider | PrivateKey
}

export type QuoterParameters = Omit<TraderParameters, 'signer'> & { account: AccountAddress }

export interface TradeParameters extends TradeBaseParameters, TradeOptionalParameters {}

export interface SwapParameters extends TradeParameters, TraderParameters {}

export interface LimitTradeParameters extends Omit<TradeParameters, 'amount'> {
  sellAmount: string
  buyAmount: string
  quoteId: number
  validTo?: number
}

export interface LimitOrderParameters extends TraderParameters, LimitTradeParameters {}

export interface SwapAdvancedSettings {
  quoteRequest?: Partial<Omit<OrderQuoteRequest, 'kind'>>
  appData?: AppDataParams
}

export interface LimitOrderAdvancedSettings {
  appData?: AppDataParams
}

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

export type AppDataOrderClass = latest.OrderClass['orderClass']

export type AppDataRootSchema = latest.AppDataRootSchema

export interface BuildAppDataParams {
  appCode: string
  slippageBps: number
  orderClass: AppDataOrderClass
}

export interface AppDataInfo {
  doc: LatestAppDataDocVersion
  fullAppData: string
  appDataKeccak256: string
  env?: CowEnv
}
