import { Nullish } from '../types'
import { ChainId, getChainInfo, isEvmChain, isSupportedChain, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'
import { AddressKey, BtcAddressKey, EvmAddressKey, isBtcAddress, isEvmAddress } from './address'

interface TokenLike {
  chainId: ChainId
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
  chainId: ChainId
}

export type TokenId = `${ChainId}:${AddressKey}`

export function getTokenId(token: TokenIdentifier): TokenId {
  const addressKey = isEvmAddress(token.address)
    ? getEvmAddressKey(token.address)
    : getBtcAddressKey(token.address)
  return `${token.chainId}:${addressKey}` as TokenId
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
  if (!isEvmChain(token.chainId) || !isSupportedChain(token.chainId)) {
    return false
  }
  return areAddressesEqual(WRAPPED_NATIVE_CURRENCIES[token.chainId]?.address, token.address)
}
