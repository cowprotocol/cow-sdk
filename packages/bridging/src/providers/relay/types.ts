// --- /currencies/v2 ---

export interface RelayCurrenciesRequest {
  chainIds?: number[]
  term?: string
  address?: string
  verified?: boolean
  limit?: number
  depositAddressOnly?: boolean
}

export interface RelayCurrency {
  chainId: number
  address: string
  symbol: string
  name: string
  decimals: number
  metadata?: {
    logoURI?: string
    verified?: boolean
    isNative?: boolean
  }
}

// --- /quote/v2 ---

export interface RelayQuoteRequest {
  user: string
  recipient?: string
  originChainId: number
  destinationChainId: number
  originCurrency: string
  destinationCurrency: string
  amount: string
  tradeType: 'EXACT_INPUT' | 'EXACT_OUTPUT' | 'EXPECTED_OUTPUT'
  useDepositAddress: boolean
  strict?: boolean
  refundTo?: string
  slippageTolerance?: string
  referrer?: string
  appFees?: Array<{ recipient: string; fee: string }>
}

export interface RelayQuoteResponse {
  steps: RelayStep[]
  fees: RelayFees
  details: RelayQuoteDetails
  protocol?: RelayProtocol
}

export interface RelayStep {
  id: string
  action: string
  description: string
  kind: string
  requestId: string
  depositAddress?: string
  items: RelayStepItem[]
}

export interface RelayStepItem {
  status: string
  data: {
    from: string
    to: string
    data: string
    value: string
    chainId: number
  }
  check?: {
    endpoint: string
    method: string
  }
}

export interface RelayCurrencyAmount {
  currency: RelayCurrency
  amount: string
  amountFormatted: string
  amountUsd: string
  minimumAmount?: string
}

export interface RelayFees {
  /** Origin chain gas fee */
  gas: RelayCurrencyAmount
  /** Total relayer fee (capital + gas + service) */
  relayer: RelayCurrencyAmount
  /** Destination chain gas fee */
  relayerGas: RelayCurrencyAmount
  /** Relayer service fee */
  relayerService: RelayCurrencyAmount
  /** App fee (if configured) */
  app?: RelayCurrencyAmount
}

export interface RelayQuoteDetails {
  operation: string
  sender: string
  recipient: string
  currencyIn: RelayCurrencyAmount
  currencyOut: RelayCurrencyAmount
  rate: string
  timeEstimate: number
  slippageTolerance?: {
    origin?: { usd: string; value: string; percent: string }
    destination?: { usd: string; value: string; percent: string }
  }
}

export interface RelayProtocol {
  v2?: {
    orderId?: string
    orderData?: unknown
  }
}

// --- /intents/status/v3 ---

export interface RelayStatusResponse {
  status: string
  details?: string
  inTxHashes?: string[]
  txHashes?: string[]
  updatedAt?: number
  originChainId?: number
  destinationChainId?: number
}

// --- /requests/v2 ---

export interface RelayRequestsResponse {
  requests: RelayRequest[]
  continuation?: string
}

export interface RelayRequest {
  id: string
  status: string
  user: string
  recipient: string
  createdAt?: string
  updatedAt?: string
  data: {
    fees: { gas: string; fixed: string; price: string }
    feesUsd: { gas: string; fixed: string; price: string }
    inTxs: RelayTx[]
    outTxs: RelayTx[]
    currency: string
    price?: string
    metadata?: {
      currencyIn?: RelayCurrencyAmount
      currencyOut?: RelayCurrencyAmount
      sender?: string
      recipient?: string
      rate?: string
    }
  }
}

/** Best-effort type derived from observed API responses */
export interface RelayTx {
  hash: string
  chainId: number
  timestamp: number
  data: {
    from: string
    to: string
    value: string
    data?: string
  }
}
