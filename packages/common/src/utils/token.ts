import { Nullish } from '../types'
import { getChainInfo, isSupportedChain, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'
import { AddressKey, getAddressKey } from './address'

interface TokenLike {
  chainId: number
  address: string
}

export interface TokenIdentifier {
  address: string
  chainId: number
}

export type TokenId = `${number}:${AddressKey}`

export function getTokenId(token: TokenIdentifier): TokenId {
  return `${token.chainId}:${getAddressKey(token.address)}`
}

export function areTokensEqual(a: TokenLike | undefined | null, b: TokenLike | undefined | null): boolean {
  if (!a || !b) return false

  return getTokenId(a) === getTokenId(b)
}

export function areAddressesEqual(a: Nullish<string>, b: Nullish<string>): boolean {
  if (a && b) {
    return getAddressKey(a) === getAddressKey(b)
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
  return areAddressesEqual(WRAPPED_NATIVE_CURRENCIES[token.chainId as SupportedChainId]?.address, token.address)
}
