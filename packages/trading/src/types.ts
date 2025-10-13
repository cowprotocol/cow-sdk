import type {
  AppDataParams,
  cowAppDataLatestScheme as latest,
  LatestAppDataDocVersion,
} from '@cowprotocol/sdk-app-data'
import {
  AppData,
  AppDataHash,
  OrderKind,
  OrderParameters,
  OrderQuoteRequest,
  OrderQuoteResponse,
  QuoteAmountsAndCosts,
  type Signature,
  SigningScheme,
  TokenAmount,
} from '@cowprotocol/sdk-order-book'
import type { AccountAddress, SignerLike } from '@cowprotocol/sdk-common'
import type { ORDER_PRIMARY_TYPE, UnsignedOrder } from '@cowprotocol/sdk-order-signing'
import type { SupportedChainId, CowEnv } from '@cowprotocol/sdk-config'

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

  /**
   * Slippage in basis points.
   * If not provided, it will use AUTO slippage, which would suggest a slippage based on the quote.
   */
  slippageBps?: latest.SlippageBips
  receiver?: OrderParameters['receiver']
  validFor?: OrderParameters['validTo']
  /**
   * Exact validTo timestamp in seconds since epoch.
   * If provided, this will be used instead of calculating from validFor.
   */
  validTo?: OrderParameters['validTo']
  partnerFee?: latest.PartnerFee
}

/**
 * Information about the trader.
 */
export interface TraderParameters {
  chainId: SupportedChainId
  appCode: latest.AppCode
  signer?: SignerLike
  env?: CowEnv
}

export type QuoterParameters = Omit<TraderParameters, 'signer'> & { account: AccountAddress }

export interface SlippageToleranceResponse {
  slippageBps: number | null
}

export interface SlippageToleranceRequest {
  chainId: SupportedChainId
  sellToken: OrderParameters['sellToken']
  buyToken: OrderParameters['buyToken']
  sellAmount?: bigint
  buyAmount?: bigint
}

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

/**
 * When postSwapOrderFromQuote() is called, it will execute provided callback corresponding to signing order
 */
export interface SigningStepManager {
  beforeBridgingSign?(): Promise<void> | void
  afterBridgingSign?(): Promise<void> | void
  beforeOrderSign?(): Promise<void> | void
  afterOrderSign?(): Promise<void> | void
  onBridgingSignError?(): void
  onOrderSignError?(): void
}

export interface SwapAdvancedSettings extends LimitOrderAdvancedSettings {
  // In special case, when you want to fetch quote with a different signer
  quoteSigner?: SignerLike
  /**
   * An optional callback to use custom logic for slippage suggestion
   */
  getSlippageSuggestion?(request: SlippageToleranceRequest): Promise<SlippageToleranceResponse>
}

export interface LimitOrderAdvancedSettings {
  // TODO: rename to TradeParamsOverride
  quoteRequest?: Partial<Omit<OrderQuoteRequest, 'kind'> & { validTo: number }>
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
   * The suggested slippage based on the quote.
   *
   */
  suggestedSlippageBps: number

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
  appDataInfo: TradingAppDataInfo

  /**
   * EIP-712 typed data for the order ready to be signed.
   */
  orderTypedData: OrderTypedData
}

export interface QuoteResultsSerialized extends Omit<QuoteResults, 'amountsAndCosts'> {
  amountsAndCosts: QuoteAmountsAndCosts<string>
}

export interface OrderPostingResult {
  orderId: string
  txHash?: string
  signingScheme: SigningScheme
  signature: Signature
  orderToSign: UnsignedOrder
}

export interface QuoteAndPost {
  quoteResults: QuoteResults

  postSwapOrderFromQuote(
    advancedSettings?: SwapAdvancedSettings,
    signingStepManager?: SigningStepManager,
  ): Promise<OrderPostingResult>
}

export type AppDataRootSchema = latest.AppDataRootSchema

export interface BuildAppDataParams {
  appCode: latest.AppCode
  slippageBps: latest.SlippageBips
  orderClass: latest.OrderClass['orderClass']
  partnerFee?: latest.PartnerFee
}

/**
 * Information about the app-data for trading operations, including the JSON document and the keccak256 hash of the full document.
 *
 * See https://github.com/cowprotocol/app-data
 */
export interface TradingAppDataInfo {
  doc: LatestAppDataDocVersion
  fullAppData: AppData
  appDataKeccak256: AppDataHash
}

/**
 * A standard Ethereum transaction object
 */
export interface TradingTransactionParams {
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
