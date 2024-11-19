import { latest, LatestAppDataDocVersion, AppDataParams } from '@cowprotocol/app-data'
import { Address, OrderQuoteRequest, OrderKind } from '../order-book'
import type { Signer } from '@ethersproject/abstract-signer'
import { CowEnv, SupportedChainId } from '../common'
import { QuoteResults } from './getQuote'
import type { ExternalProvider } from '@ethersproject/providers'

export type PrivateKey = string // 64 characters
export type AccountAddress = `0x${string}` // 42 characters

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
