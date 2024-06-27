import { latest, LatestAppDataDocVersion, AppDataParams } from '@cowprotocol/app-data'
import { Address, OrderQuoteRequest, OrderKind } from '../order-book'
import type { Signer } from '@ethersproject/abstract-signer'
import { CowEnv, SupportedChainId } from '../common'

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
}

export interface TraderParameters {
  chainId: SupportedChainId
  signer: Signer | string
  appCode: string
}

export interface TradeParameters extends TradeBaseParameters, TradeOptionalParameters {}

export interface SwapParameters extends TraderParameters, TradeParameters {}

export interface LimitOrderParameters extends TraderParameters, Omit<TradeParameters, 'amount'> {
  sellAmount: string
  buyAmount: string
  validTo?: number
  quoteId?: number
}

export interface SwapAdvancedSettings {
  quoteRequest?: Partial<Omit<OrderQuoteRequest, 'kind'>>
  appData?: AppDataParams
}

export interface LimitOrderAdvancedSettings {
  appData?: AppDataParams
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
