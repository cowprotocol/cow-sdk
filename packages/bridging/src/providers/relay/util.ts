import { ETH_ADDRESS } from '@cowprotocol/sdk-config'
import type { TokenInfo } from '@cowprotocol/sdk-config'

import type { RelayCurrency, RelayFees, RelayQuoteDetails } from './types'

const RELAY_NATIVE_ADDRESS = '0x0000000000000000000000000000000000000000'

export function computeSlippageBps(details: RelayQuoteDetails): number {
  // Primary path: use pre-computed slippage from Relay response
  const destPercent = details.slippageTolerance?.destination?.percent
  if (destPercent != null) {
    return Math.round(parseFloat(destPercent) * 100)
  }

  // Fallback: compute from USD values
  const inUsd = Number(details.currencyIn.amountUsd)
  const outUsd = Number(details.currencyOut.amountUsd)

  if (inUsd <= 0) return 0

  const slippage = 1 - outUsd / inUsd
  return Math.max(0, Math.trunc(slippage * 10_000))
}

export function computeFeeBps(details: RelayQuoteDetails, fees: RelayFees): number {
  const inUsd = Number(details.currencyIn.amountUsd)
  const feeUsd = Number(fees.relayer.amountUsd)

  if (inUsd <= 0) return 0

  return Math.trunc((feeUsd / inUsd) * 10_000)
}

export function computeFeeInBuyCurrency(fees: RelayFees, details: RelayQuoteDetails): bigint {
  const inAmount = BigInt(details.currencyIn.amount)
  if (inAmount === 0n) return 0n

  const feeAmount = BigInt(fees.relayer.amount)
  const buyAmount = BigInt(details.currencyOut.amount)
  return (feeAmount * buyAmount) / inAmount
}

export function mapRelayCurrencyToTokenInfo(currency: RelayCurrency): TokenInfo {
  return {
    chainId: currency.chainId,
    address: currency.address === RELAY_NATIVE_ADDRESS ? ETH_ADDRESS : currency.address,
    symbol: currency.symbol,
    name: currency.name,
    decimals: currency.decimals,
  }
}

/**
 * Convert CoW SDK ETH_ADDRESS to Relay native address format.
 * Relay uses 0x0000...0000 for native tokens, CoW uses 0xEeee...EEeE.
 */
export function toRelayAddress(address: string): string {
  return address.toLowerCase() === ETH_ADDRESS.toLowerCase() ? RELAY_NATIVE_ADDRESS : address
}

/**
 * Convert Relay native address to CoW SDK ETH_ADDRESS format.
 */
export function fromRelayAddress(address: string): string {
  return address.toLowerCase() === RELAY_NATIVE_ADDRESS ? ETH_ADDRESS : address
}
