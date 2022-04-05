import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { SupportedChainId as ChainId } from '../../constants/chains'
import { OrderCancellation, SigningSchemeValue } from '../../utils/sign'

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
 * where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string
export type ApiOrderStatus = 'fulfilled' | 'expired' | 'cancelled' | 'presignaturePending' | 'open'

export interface OrderMetaData {
  creationDate: string
  owner: string
  uid: OrderID
  availableBalance: string
  executedBuyAmount: string
  executedSellAmount: string
  executedSellAmountBeforeFees: string
  executedFeeAmount: string
  invalidated: false
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  validTo: number
  appData: number
  feeAmount: string
  kind: OrderKind
  partiallyFillable: false
  signature: string
  signingScheme: SigningSchemeValue
  status: ApiOrderStatus
  receiver: string
}

export interface TradeMetaData {
  blockNumber: number
  logIndex: number
  orderUid: OrderID
  owner: string
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  sellAmountBeforeFees: string
  txHash: string
}

export interface UnsupportedToken {
  [token: string]: {
    address: string
    dateAdded: number
  }
}

export type PaginationParams = {
  limit?: number
  offset?: number
}

export type OrderCancellationParams = {
  chainId: ChainId
  cancellation: OrderCancellation
  owner: string
}

export type GetOrdersParams = {
  owner: string
} & PaginationParams

export type GetTradesParams = {
  owner: string
} & PaginationParams

export type ProfileData = {
  totalTrades: number
  totalReferrals: number
  tradeVolumeUsd: number
  referralVolumeUsd: number
  lastUpdated: string
}
