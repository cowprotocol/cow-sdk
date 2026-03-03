import { Nullish } from '../types'
import {
  ADDITIONAL_WRAPPED_NATIVE_CURRENCIES,
  AdditionalTargetChainId,
  getChainInfo,
  SupportedChainId,
  TargetChainId,
  TokenInfo,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/sdk-config'
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
  return areAddressesEqual(getChainInfo(token.chainId)?.nativeCurrency.address, token.address)
}

export function getWrappedNativeToken(chainId: TargetChainId): TokenInfo | undefined {
  return (
    WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId] ||
    ADDITIONAL_WRAPPED_NATIVE_CURRENCIES[chainId as AdditionalTargetChainId]
  )
}

export function isWrappedNativeToken(token: TokenLike): boolean {
  const wrappedNativeToken = getWrappedNativeToken(token.chainId)

  if (!wrappedNativeToken) return false

  return areAddressesEqual(wrappedNativeToken.address, token.address)
}
