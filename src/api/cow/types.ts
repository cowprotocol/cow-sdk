import { GetQuoteResponse, OrderKind } from '@cowprotocol/contracts'
import { StrictUnion } from 'utilities'
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

type WithOwner = {
  owner: string
}

type WithOrderId = {
  orderId: string
}

export type GetTradesParams = StrictUnion<WithOwner | WithOrderId> & PaginationParams

export type ProfileData = {
  totalTrades: number
  totalReferrals: number
  tradeVolumeUsd: number
  referralVolumeUsd: number
  lastUpdated: string
}

export interface QuoteParams {
  quoteParams: FeeQuoteParams
  fetchFee: boolean
  previousFee?: FeeInformation
  isPriceRefresh: boolean
}

export interface FeeInformation {
  expirationDate: string
  amount: string
}

export interface PriceInformation {
  token: string
  amount: string | null
  quoteId?: number
}

// GetQuoteResponse from @cowprotocol/contracts types Timestamp and BigNumberish
// do not play well with our existing methods, using string instead
export type SimpleGetQuoteResponse = Pick<GetQuoteResponse, 'from'> & {
  // We need to map BigNumberIsh and Timestamp to what we use: string
  quote: Omit<GetQuoteResponse['quote'], 'sellAmount' | 'buyAmount' | 'feeAmount' | 'validTo'> & {
    sellAmount: string
    buyAmount: string
    validTo: string
    feeAmount: string
  }
  expiration: string
  id: number | null
}

export type FeeQuoteParams = Pick<OrderMetaData, 'sellToken' | 'buyToken' | 'kind'> & {
  amount: string
  userAddress?: string | null
  receiver?: string | null
  validTo: number
}

export type PriceQuoteParams = Omit<FeeQuoteParams, 'sellToken' | 'buyToken'> & {
  baseToken: string
  quoteToken: string
}

export type Options = {
  chainId?: ChainId
  isDevEnvironment?: boolean
  requestOptions?: RequestInit
  apiUrlGetterParams?: unknown[]
}
