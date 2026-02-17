import { Nullish } from '../types'
import { ChainId, getChainInfo, isSupportedChain, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'
import { AddressKey, getAddressKey, getEvmAddressKey, isBtcAddress, isEvmAddress } from './address'

interface TokenLike {
  chainId: ChainId
  address: string
}

export interface TokenIdentifier {
  address: string
  chainId: ChainId
}

export type TokenId = `${ChainId}:${AddressKey}`

export function getTokenId(token: TokenIdentifier): TokenId {
  const addressKey = getAddressKey(token.address)
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
  return areAddressesEqual(WRAPPED_NATIVE_CURRENCIES[token.chainId]?.address, token.address)
}
