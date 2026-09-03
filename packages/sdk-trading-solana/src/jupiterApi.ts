/**
 * For testing purposes only! Not for production!
 */
const JUPITER_ORDER_ENDPOINT = 'https://ultra-api.jup.ag/order'
const DEFAULT_CLIENT_PLATFORM = 'cowswap'
/** Upper bound on how long we wait for Jupiter's response (headers + body) before aborting. */
const QUOTE_TIMEOUT_MS = 10_000
const UNSIGNED_INTEGER_PATTERN = /^\d+$/

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
  requestId: string
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

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), QUOTE_TIMEOUT_MS)

    try {
      const response = await fetch(`${JUPITER_ORDER_ENDPOINT}?${params.toString()}`, { signal: controller.signal })

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

      if (!isJupiterOrderResponse(body, request)) {
        throw new Error('Jupiter quote response is malformed or does not match the requested pair')
      }

      return body
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

function isJupiterErrorResponse(body: unknown): body is JupiterErrorResponse {
  return typeof body === 'object' && body !== null && typeof (body as JupiterErrorResponse).error === 'string'
}

/** Validates the fields this SDK actually reads, and that the echoed pair/mode match what was requested —
 * `getSolanaQuote` uses `inAmount`/`outAmount` to encode the on-chain settlement intent, so a mismatched
 * or malformed response must not silently flow through. */
function isJupiterOrderResponse(body: unknown, request: JupiterOrderRequest): body is JupiterOrderResponse {
  if (typeof body !== 'object' || body === null) return false

  const candidate = body as Partial<JupiterOrderResponse>

  return (
    candidate.inputMint === request.inputMint &&
    candidate.outputMint === request.outputMint &&
    candidate.swapMode === request.swapMode &&
    typeof candidate.inAmount === 'string' &&
    UNSIGNED_INTEGER_PATTERN.test(candidate.inAmount) &&
    typeof candidate.outAmount === 'string' &&
    UNSIGNED_INTEGER_PATTERN.test(candidate.outAmount) &&
    typeof candidate.slippageBps === 'number' &&
    Number.isFinite(candidate.slippageBps)
  )
}
