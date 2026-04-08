import type { TokenInfo } from '@cowprotocol/sdk-config'

/** Minimal shape of GET /swap/approval JSON we consume. */
export type SwapApprovalApiResponse = {
  id: string
  inputToken: TokenInfo
  outputToken: TokenInfo
  inputAmount: string
  expectedOutputAmount: string
  minOutputAmount?: string
  expectedFillTime: number
  quoteExpiryTimestamp?: number
  swapTx: { data: string; to?: string; chainId?: number }
  steps: {
    bridge?: {
      outputAmount?: string
      fees?: {
        pct?: string
        amount?: string
        details?: {
          type?: string
          relayerCapital?: { pct: string; amount: string }
          destinationGas?: { pct: string; amount: string }
          lp?: { pct: string; amount: string }
        }
      }
    }
  }
}

/**
 * Decimal string for `2^256 - 1` (max uint256). Legacy `GET /suggested-fees` returned a structured
 * `limits` object (`minDeposit`, `maxDeposit`, instant/delay caps). `GET /swap/approval` does not expose
 * that same shape, so `toBridgeQuoteResult` uses `inputAmount` as `minDeposit` and this value as a
 * practical “no cap” upper bound for `limits.maxDeposit` to keep `BridgeQuoteResult.limits` populated.
 */
export const ACROSS_SWAP_APPROVAL_MAX_DEPOSIT_LIMIT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'

/**
 * Across encodes `quoteTimestamp`, `fillDeadline`, and `exclusivityDeadline` in fixed positions
 * inside `swapTx.data` (same layout the legacy `/suggested-fees` quote used for deposits).
 */
export function parseDepositTimingFromSwapTxData(data: string): {
  exclusiveRelayer: string
  quoteTimestamp: string
  fillDeadline: string
  exclusivityDeadline: string
} | null {
  const hex = data.startsWith('0x') ? data.slice(2) : data
  const body = hex.slice(8) // after 4-byte selector
  if (body.length < 11 * 64) {
    return null
  }

  const readWord = (i: number) => body.slice(i * 64, (i + 1) * 64)
  const wordToAddress = (w: string) => {
    const addr = w.slice(24)
    return `0x${addr.toLowerCase()}`
  }
  const wordToUintString = (w: string) => BigInt(`0x${w}`).toString()

  const quoteTimestamp = wordToUintString(readWord(8))
  const fillDeadline = wordToUintString(readWord(9))
  const exclusivityDeadline = wordToUintString(readWord(10))

  const tsNum = Number(quoteTimestamp)
  const fdNum = Number(fillDeadline)
  if (!Number.isFinite(tsNum) || !Number.isFinite(fdNum) || tsNum < 1_000_000_000 || fdNum < tsNum) {
    return null
  }

  return {
    exclusiveRelayer: wordToAddress(readWord(7)),
    quoteTimestamp,
    fillDeadline,
    exclusivityDeadline,
  }
}

export function isValidSwapApprovalResponse(response: unknown): response is SwapApprovalApiResponse {
  if (typeof response !== 'object' || response === null) {
    return false
  }
  const r = response as Record<string, unknown>
  if (typeof r.id !== 'string' || r.id.length === 0) {
    return false
  }
  if (!isValidTokenShape(r.inputToken) || !isValidTokenShape(r.outputToken)) {
    return false
  }
  if (typeof r.inputAmount !== 'string' || !/^\d+$/.test(r.inputAmount)) {
    return false
  }
  if (typeof r.expectedOutputAmount !== 'string' || !/^\d+$/.test(r.expectedOutputAmount)) {
    return false
  }
  if (typeof r.expectedFillTime !== 'number' || !Number.isFinite(r.expectedFillTime)) {
    return false
  }
  if (typeof r.swapTx !== 'object' || r.swapTx === null) {
    return false
  }
  const st = r.swapTx as Record<string, unknown>
  if (typeof st.data !== 'string' || !st.data.startsWith('0x') || st.data.length < 10) {
    return false
  }
  if (typeof r.steps !== 'object' || r.steps === null) {
    return false
  }
  const steps = r.steps as Record<string, unknown>
  if (typeof steps.bridge !== 'object' || steps.bridge === null) {
    return false
  }
  const bridge = steps.bridge as Record<string, unknown>
  if (typeof bridge.fees !== 'object' || bridge.fees === null) {
    return false
  }
  return true
}

function isValidTokenShape(t: unknown): t is TokenInfo {
  return (
    typeof t === 'object' &&
    t !== null &&
    'chainId' in t &&
    typeof (t as TokenInfo).chainId === 'number' &&
    'address' in t &&
    typeof (t as TokenInfo).address === 'string' &&
    'decimals' in t &&
    typeof (t as TokenInfo).decimals === 'number' &&
    'symbol' in t &&
    typeof (t as TokenInfo).symbol === 'string' &&
    'name' in t &&
    typeof (t as TokenInfo).name === 'string'
  )
}
