export interface SocketApiOptions {
  apiKey?: string
  affiliate?: string
  apiBaseUrl?: string
  includeProvider?: string[]
  excludeProvider?: string[]
}

export interface SocketToken {
  chainId: number
  address: string
  name?: string
  symbol?: string
  decimals: number
  logoURI?: string
  icon?: string
}

export interface SocketTokenListResponse {
  success: boolean
  statusCode: number
  result: Record<string, SocketToken[]>
  message?: string | null
}

export interface SocketQuoteRequest {
  userOps: 'deposit'
  originChainId: string
  destinationChainId: string
  inputToken: string
  inputAmount: string
  outputToken: string
  receiverAddress: string
  userAddress: string
  refundAddress: string
  slippage?: string
  includeProvider?: string
  excludeProvider?: string
  feeBps?: string
  feeTakerAddress?: string
  refuel?: 'true' | 'false'
}

export interface SocketQuoteRoute {
  userOp: 'deposit'
  quoteId: string
  expiresAt: number
  output: {
    token: SocketToken
    amount: string
    minAmountOut: string
    priceInUsd?: number
    valueInUsd?: number
  }
  estimatedTime?: number
  slippage?: number
  suggestedSlippage?: number
  routeTags?: string[]
  routeDetails?: {
    bridgeDetails?: {
      protocol?: {
        name?: string
        displayName?: string
        icon?: string
      }
      inputTokenAddress?: string
      outputTokenAddress?: string
      amountIn?: string
      amountOut?: string
      minAmountOut?: string
      slippage?: number
    } | null
    dexDetails?: unknown
    feeDetails?: unknown
  }
  deposit: {
    chainId: number
    token: SocketToken
    amount: string
    transferType: string
    depositAddress: string
    memo?: string | null
  }
  txData?: unknown
  gasFee?: {
    gasToken?: SocketToken
    gasLimit?: string
    gasPrice?: string
    estimatedFee?: string
    feeInUsd?: number
  }
  refundAddress?: string
  statusCheck?: {
    endpoint: string
    method: string
    intervalSec: number
    maxDurationSec: number
  }
}

export interface SocketQuoteResponse {
  success: boolean
  statusCode: number
  result: {
    originChainId: number
    destinationChainId: number
    userAddress: string
    receiverAddress: string
    input: {
      token: SocketToken
      amount: string
      priceInUsd?: number
      valueInUsd?: number
    }
    routes: SocketQuoteRoute[]
  }
  message?: string | null
}

export interface SocketStatusResponse {
  success: boolean
  statusCode: number
  result: SocketStatus
  message?: string | null
}

export interface SocketStatus {
  quoteId: string
  userOp: 'deposit' | 'tx' | string
  status: SocketStatusCode
  statusCode: SocketStatusCode
  origin?: {
    chainId: number
    status: SocketStatusCode
    txHash?: string | null
    timestamp?: number | null
    userAddress?: string
    input?: Array<{
      token: SocketToken
      amount: string
    }>
  }
  destination?: {
    chainId: number
    status: SocketStatusCode
    txHash?: string | null
    timestamp?: number | null
    receiverAddress?: string
    output?: Array<{
      token: SocketToken
      amount: string
      minAmountOut?: string
    }>
  }
  refund?: {
    refundAddress?: string
  } | null
}

export type SocketStatusCode = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'REFUNDED'
