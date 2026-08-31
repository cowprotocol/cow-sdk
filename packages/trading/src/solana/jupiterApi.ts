const JUPITER_ORDER_ENDPOINT = 'https://ultra-api.jup.ag/order'
const DEFAULT_CLIENT_PLATFORM = 'cowswap'

export interface JupiterOrderRequest {
  inputMint: string
  outputMint: string
  amount: string
  swapMode: 'ExactIn' | 'ExactOut'
  clientPlatform?: string
}

/**
 * Fields of Jupiter's `/order` response this SDK actually reads. Jupiter's own swap transaction/execute
 * flow (`transaction`, `requestId`) is deliberately not modeled here — quotes are sourced from Jupiter,
 * but orders are posted through the CoW Protocol settlement program, never through Jupiter's `/execute`.
 */
export interface JupiterOrderResponse {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  swapMode: 'ExactIn' | 'ExactOut'
  slippageBps: number
}

interface JupiterErrorResponse {
  error: string
}

/** Client for Jupiter's public quote API. Quote-only: never used to submit or execute a swap. */
export class JupiterAPI {
  async getOrder(request: JupiterOrderRequest): Promise<JupiterOrderResponse> {
    const params = new URLSearchParams({
      inputMint: request.inputMint,
      outputMint: request.outputMint,
      amount: request.amount,
      swapMode: request.swapMode,
      clientPlatform: request.clientPlatform ?? DEFAULT_CLIENT_PLATFORM,
    })

    const response = await fetch(`${JUPITER_ORDER_ENDPOINT}?${params.toString()}`)

    let body: unknown
    try {
      body = await response.json()
    } catch {
      throw new Error(`Jupiter quote request failed (${response.status})`)
    }

    if (!response.ok) {
      const message = isJupiterErrorResponse(body) ? body.error : `Jupiter quote request failed (${response.status})`
      throw new Error(message)
    }

    return body as JupiterOrderResponse
  }
}

function isJupiterErrorResponse(body: unknown): body is JupiterErrorResponse {
  return typeof body === 'object' && body !== null && typeof (body as JupiterErrorResponse).error === 'string'
}
