import { latest, LatestAppDataDocVersion } from '@cowprotocol/app-data'
import type { Address, SupportedChainId, CowEnv } from '../../../src'

export interface SwapParameters {
  privateKey: string
  chainId: SupportedChainId
  from: string
  sellToken: Address
  sellTokenDecimals: number
  buyToken: Address
  buyTokenDecimals: number
  amount: string
  kind: 'sell' | 'buy'
  partiallyFillable?: boolean
  receiver?: string
  deadline?: number
  slippageBps?: number
  validTo?: number
}

export type AppDataOrderClass = latest.OrderClass['orderClass']

export type AppDataHooks = latest.OrderInteractionHooks

export type AppDataWidget = latest.Widget

export type AppDataPartnerFee = latest.PartnerFee

export type AppDataRootSchema = latest.AppDataRootSchema

export interface UtmParams {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
}

export interface BuildAppDataParams {
  appCode: string
  environment?: string
  chainId: SupportedChainId
  slippageBps: number
  orderClass: AppDataOrderClass
  referrerAccount?: string
  utm: UtmParams | undefined
  hooks?: AppDataHooks
  widget?: AppDataWidget
  partnerFee?: AppDataPartnerFee
  replacedOrderUid?: string
}

export interface AppDataInfo {
  doc: LatestAppDataDocVersion
  fullAppData: string
  appDataKeccak256: string
  env?: CowEnv
}
