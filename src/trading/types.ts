import type { AppDataParams, latest, LatestAppDataDocVersion } from '@cowprotocol/app-data'
import {
  AppData,
  AppDataHash,
  OrderKind,
  OrderParameters,
  OrderQuoteRequest,
  OrderQuoteResponse,
  QuoteAmountsAndCosts,
  SigningScheme,
  TokenAmount,
} from '../order-book'
import type { AccountAddress, CowEnv, SignerLike } from '../common'
import type { UnsignedOrder } from '../order-signing'
import type { SupportedChainId } from '../chains'

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
  owner?: AccountAddress
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
  additionalParams?: PostTradeAdditionalParams
}

export interface LimitOrderAdvancedSettings {
  appData?: AppDataParams
  additionalParams?: PostTradeAdditionalParams
}

/**
 * Quote information for the CoW Protocol order, including information about the trade, quote, order, "app-data", and more.
 *
 * This data is used to create a trade, sign an order, and post it to the order book.
 */
export interface QuoteResults {
  /**
   * Information about the trade, including the kind of order, the owner, the sell and buy tokens, and the amount.
   */
  tradeParameters: TradeParameters

  /**
   * Details about costs and amounts, costs and fees of a quote.
   */
  amountsAndCosts: QuoteAmountsAndCosts

  /**
   * Information about the order to be signed.
   *
   * For signining, please use orderTypedData (EIP-712 typed data, which also includes the unsigned order)
   */
  orderToSign: UnsignedOrder

  /**
   * Information about the quote response from the order book API.
   */
  quoteResponse: OrderQuoteResponse

  /**
   * Information about the app-data, including the JSON document and the keccak256 hash of the full document.
   */
  appDataInfo: AppDataInfo

  /**
   * EIP-712 typed data for the order ready to be signed.
   */
  orderTypedData: OrderTypedData
}

export interface QuoteResultsSerialized extends Omit<QuoteResults, 'amountsAndCosts'> {
  amountsAndCosts: QuoteAmountsAndCosts<string>
}

export interface QuoteAndPost {
  quoteResults: QuoteResults

  postSwapOrderFromQuote(advancedSettings?: SwapAdvancedSettings): Promise<string>
}

export type AppDataRootSchema = latest.AppDataRootSchema

export interface BuildAppDataParams {
  appCode: latest.AppCode
  slippageBps: latest.SlippageBips
  orderClass: latest.OrderClass['orderClass']
  partnerFee?: latest.PartnerFee
}

/**
 * Information about the app-data, including the JSON document and the keccak256 hash of the full document.
 *
 * See https://github.com/cowprotocol/app-data
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

export interface EthFlowOrderExistsCallback {
  (orderId: string, orderDigest: string): Promise<boolean>
}

/**
 * Additional parameters for posting orders.
 * In most of the cases you don't need to use them.
 */
export interface PostTradeAdditionalParams {
  /**
   * Selling native token orders are special, because they are created from smart-contract,
   * and their validTo is always the same.
   * Because of that, you might get the same orderId when trying to create an order with the same parameters
   * The callback is needed to check if there is already an order with the same orderId
   *
   * @see https://github.com/cowprotocol/ethflowcontract/blob/main/src/libraries/EthFlowOrder.sol#L90
   */
  checkEthFlowOrderExists?: EthFlowOrderExistsCallback
  /**
   * Cost of executing the order onchain.
   * The value is used in getQuoteAmountsAndCosts in order to calculate proper amounts
   */
  networkCostsAmount?: string
  /**
   * By default, is EIP712 for EOA wallets.
   * You might need other types of signing, for example PRESIGN when sign order via Smart Contract wallets.
   */
  signingScheme?: SigningScheme
}
