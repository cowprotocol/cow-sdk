import { normalizeOrder, Timestamp, HashLike, OrderBalance } from './order'
import { encodeSignatureData } from './settlement'
import { BigIntish, areAddressesEqual, getGlobalAdapter } from '@cowprotocol/sdk-common'
import { Order, OrderKind, Signature, SigningScheme } from './types'

export enum Environment {
  Dev,
  Prod,
}

export const LIMIT_CONCURRENT_REQUESTS = 5

const PARTNER_PROD_BASE_URL = 'https://partners.cow.fi'
const PARTNER_DEV_BASE_URL = 'https://partners.barn.cow.fi'

export function apiUrl(environment: Environment, network: string, apiKey?: string): string {
  let baseUrl: string
  switch (environment) {
    case Environment.Dev:
      baseUrl = apiKey ? PARTNER_DEV_BASE_URL : 'https://barn.api.cow.fi'
      break
    case Environment.Prod:
      baseUrl = apiKey ? PARTNER_PROD_BASE_URL : 'https://api.cow.fi'
      break
    default:
      throw new Error('Invalid environment')
  }
  return `${baseUrl}/${network}`
}

export interface ApiCall {
  baseUrl: string
  apiKey?: string
}

export interface EstimateTradeAmountQuery {
  sellToken: string
  buyToken: string
  kind: OrderKind
  amount: BigIntish
}
export interface PlaceOrderQuery {
  order: Order
  signature: Signature
  from?: string
}
export interface GetExecutedSellAmountQuery {
  uid: string
}

export type SellAmountBeforeFee = {
  kind: OrderKind.SELL
  sellAmountBeforeFee: BigIntish
}

export type SellAmountAfterFee = {
  kind: OrderKind.SELL
  sellAmountAfterFee: BigIntish
}

export type BuyAmountAfterFee = {
  kind: OrderKind.BUY
  buyAmountAfterFee: BigIntish
}

export type QuoteQuery = CommonQuoteQuery & (SellAmountBeforeFee | SellAmountAfterFee | BuyAmountAfterFee)

export interface CommonQuoteQuery {
  sellToken: string
  buyToken: string
  receiver?: string
  validTo?: Timestamp
  appData?: HashLike
  partiallyFillable?: boolean
  sellTokenBalance?: OrderBalance
  buyTokenBalance?: OrderBalance
  from: string
  priceQuality?: QuotePriceQuality
}

export enum QuotePriceQuality {
  FAST = 'fast',
  OPTIMAL = 'optimal',
}

export interface OrderDetailResponse {
  // Other fields are omitted until needed
  executedSellAmount: string
}
export interface GetQuoteResponse {
  quote: Order
  from: string
  expiration: Timestamp
  id?: number
}

export interface ApiError {
  errorType: string
  description: string
}
export interface CallError extends Error {
  apiError?: ApiError
}

export enum GetQuoteErrorType {
  SellAmountDoesNotCoverFee = 'SellAmountDoesNotCoverFee',
  NoLiquidity = 'NoLiquidity',
  // other errors are added when necessary
}

function apiKind(kind: OrderKind): string {
  switch (kind) {
    case OrderKind.SELL:
      return 'sell'
    case OrderKind.BUY:
      return 'buy'
    default:
      throw new Error(`Unsupported kind ${kind}`)
  }
}

function apiSigningScheme(scheme: SigningScheme): string {
  switch (scheme) {
    case SigningScheme.EIP712:
      return 'eip712'
    case SigningScheme.ETHSIGN:
      return 'ethsign'
    case SigningScheme.EIP1271:
      return 'eip1271'
    case SigningScheme.PRESIGN:
      return 'presign'
    default:
      throw new Error(`Unsupported signing scheme ${scheme}`)
  }
}

async function call<T>(
  route: string,
  baseUrl: string,
  init?: RequestInit,
  apiKey?: string,
): Promise<T> {
  const url = `${baseUrl}/api/v1/${route}`
  const headers: Record<string, string> = {
    ...((init?.headers as Record<string, string>) ?? {}),
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
  }
  const response = await fetch(url, { ...init, headers })
  const body = await response.text()
  if (!response.ok) {
    const error: CallError = new Error(
      `Calling "${url} ${JSON.stringify(init)} failed with ${response.status}: ${body}`,
    )
    try {
      error.apiError = JSON.parse(body)
    } catch {
      // no api error
    }
    throw error
  }
  return JSON.parse(body)
}

async function estimateTradeAmount({
  sellToken,
  buyToken,
  kind,
  amount,
  baseUrl,
  apiKey,
}: EstimateTradeAmountQuery & ApiCall): Promise<BigIntish> {
  const side: BuyAmountAfterFee | SellAmountAfterFee =
    kind == OrderKind.SELL
      ? {
          kind: OrderKind.SELL,
          sellAmountAfterFee: amount,
        }
      : {
          kind: OrderKind.BUY,
          buyAmountAfterFee: amount,
        }
  const { quote } = await getQuote(
    { baseUrl, apiKey },
    {
      from: '0x0000000000000000000000000000000000000000',
      sellToken,
      buyToken,
      priceQuality: QuotePriceQuality.FAST,
      ...side,
    },
  )
  // The services return the quote token used for the price. The quote token
  // is checked to make sure that the returned price meets our expectations.
  if (!areAddressesEqual(quote.buyToken, buyToken)) {
    throw new Error(
      `Price returned for sell token ${sellToken} uses an incorrect quote token (${quote.buyToken} instead of ${buyToken})`,
    )
  }
  const estimatedAmount = kind == OrderKind.SELL ? quote.buyAmount : quote.sellAmount
  return getGlobalAdapter().utils.toBigIntish(estimatedAmount)
}

async function placeOrder({
  order,
  signature,
  baseUrl,
  from,
  apiKey,
}: PlaceOrderQuery & ApiCall): Promise<string> {
  const normalizedOrder = normalizeOrder(order)
  const adapter = getGlobalAdapter()
  return await call(
    'orders',
    baseUrl,
    {
    method: 'post',
    body: JSON.stringify({
      sellToken: normalizedOrder.sellToken,
      buyToken: normalizedOrder.buyToken,
      sellAmount: String(adapter.utils.toBigIntish(normalizedOrder.sellAmount)),
      buyAmount: String(adapter.utils.toBigIntish(normalizedOrder.buyAmount)),
      validTo: normalizedOrder.validTo,
      appData: normalizedOrder.appData,
      feeAmount: String(adapter.utils.toBigIntish(normalizedOrder.feeAmount)),
      kind: apiKind(order.kind),
      partiallyFillable: normalizedOrder.partiallyFillable,
      signature: encodeSignatureData(signature),
      signingScheme: apiSigningScheme(signature.scheme),
      receiver: normalizedOrder.receiver,
      from,
    }),
    headers: { 'Content-Type': 'application/json' },
  },
    apiKey,
  )
}

async function getExecutedSellAmount({
  uid,
  baseUrl,
  apiKey,
}: GetExecutedSellAmountQuery & ApiCall): Promise<BigIntish> {
  const response: OrderDetailResponse = await call(`orders/${uid}`, baseUrl, undefined, apiKey)
  return getGlobalAdapter().utils.toBigIntish(response.executedSellAmount)
}

async function getQuote(
  { baseUrl, apiKey }: ApiCall,
  quote: QuoteQuery,
): Promise<GetQuoteResponse> {
  // Convert BigNumber into JSON strings (native serialisation is a hex object)
  if ((<SellAmountBeforeFee>quote).sellAmountBeforeFee) {
    ;(<SellAmountBeforeFee>quote).sellAmountBeforeFee = String((<SellAmountBeforeFee>quote).sellAmountBeforeFee)
  }
  if ((<SellAmountAfterFee>quote).sellAmountAfterFee) {
    ;(<SellAmountAfterFee>quote).sellAmountAfterFee = String((<SellAmountAfterFee>quote).sellAmountAfterFee)
  }
  if ((<BuyAmountAfterFee>quote).buyAmountAfterFee) {
    ;(<BuyAmountAfterFee>quote).buyAmountAfterFee = String((<BuyAmountAfterFee>quote).buyAmountAfterFee)
  }
  return call(
    'quote',
    baseUrl,
    {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    },
    apiKey,
  )
}

export class Api {
  network: string
  baseUrl: string
  apiKey?: string

  constructor(network: string, baseUrlOrEnv: string | Environment, apiKey?: string) {
    this.network = network
    this.apiKey = apiKey
    if (typeof baseUrlOrEnv === 'string') {
      this.baseUrl = baseUrlOrEnv
    } else {
      this.baseUrl = apiUrl(baseUrlOrEnv, network, apiKey)
    }
  }

  private apiCallParams() {
    return { network: this.network, baseUrl: this.baseUrl, apiKey: this.apiKey }
  }

  async estimateTradeAmount(query: EstimateTradeAmountQuery): Promise<BigIntish> {
    return estimateTradeAmount({ ...this.apiCallParams(), ...query })
  }
  async placeOrder(query: PlaceOrderQuery): Promise<string> {
    return placeOrder({ ...this.apiCallParams(), ...query })
  }
  async getExecutedSellAmount(query: GetExecutedSellAmountQuery): Promise<BigIntish> {
    return getExecutedSellAmount({ ...this.apiCallParams(), ...query })
  }
  async getQuote(query: QuoteQuery): Promise<GetQuoteResponse> {
    return getQuote(this.apiCallParams(), query)
  }
}
