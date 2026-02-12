import { Nullish } from '../types'
import { getChainInfo, isSupportedChain, SupportedEvmChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'
import { AddressKey, BtcAddressKey, EvmAddressKey, isBtcAddress, isEvmAddress } from './address'

interface TokenLike {
  chainId: number
  address: string
}

export function getEvmAddressKey(address: string): EvmAddressKey {
  return `${address.toLowerCase()}` as EvmAddressKey
}

export function getBtcAddressKey(address: string): BtcAddressKey {
  return address
}

// Legacy function name for backward compatibility
/** @deprecated Use getEvmAddressKey instead */
export function getTokenAddressKey(address: string): EvmAddressKey {
  return getEvmAddressKey(address)
}

export interface TokenIdentifier {
  address: string
  chainId: number
}

export type TokenId = `${number}:${AddressKey}`

export function getTokenId(token: TokenIdentifier): TokenId {
  const addressKey = isEvmAddress(token.address)
    ? getEvmAddressKey(token.address)
    : getBtcAddressKey(token.address)
  return `${token.chainId}:${addressKey}`
}

export function areTokensEqual(a: TokenLike | undefined | null, b: TokenLike | undefined | null): boolean {
  if (!a || !b) return false

  return getTokenId(a) === getTokenId(b)
}

export function areAddressesEqual(a: Nullish<string>, b: Nullish<string>): boolean {
  if (!a || !b) return false

  const aIsEvm = isEvmAddress(a)
  const bIsEvm = isEvmAddress(b)

  if (aIsEvm && bIsEvm) {
    return getEvmAddressKey(a) === getEvmAddressKey(b)
  }

  const aIsBtc = isBtcAddress(a)
  const bIsBtc = isBtcAddress(b)

  if (aIsBtc && bIsBtc) {
    return a === b
  }

  return false
}

export function isNativeToken(token: TokenLike): boolean {
  if (isSupportedChain(token.chainId)) {
    return areAddressesEqual(getChainInfo(token.chainId)?.nativeCurrency.address, token.address)
  }

  return false
}

export function isWrappedNativeToken(token: TokenLike): boolean {
  return areAddressesEqual(WRAPPED_NATIVE_CURRENCIES[token.chainId as SupportedEvmChainId]?.address, token.address)
}
