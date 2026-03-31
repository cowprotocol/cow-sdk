import { Nullish } from '../types'
import {
  ADDITIONAL_WRAPPED_NATIVE_CURRENCIES,
  AdditionalTargetChainId,
  ChainId,
  getChainInfo,
  SupportedChainId,
  TargetChainId,
  TokenInfo,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/sdk-config'
import { AddressKey, getAddressKey, getEvmAddressKey, isEvmAddress } from './address'

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

  // sol and btc addresses are already in the correct format
  return a === b
}

export function isNativeToken(token: TokenLike): boolean {
  const chainInfo = getChainInfo(token.chainId)
  return areAddressesEqual(chainInfo?.nativeCurrency.address, token.address)
}

export function getWrappedNativeToken(chainId: TargetChainId): TokenInfo | undefined {
  return (
    WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId] ||
    ADDITIONAL_WRAPPED_NATIVE_CURRENCIES[chainId as AdditionalTargetChainId]
  )
}

export function isWrappedNativeToken(token: TokenLike): boolean {
  const wrappedNativeToken = getWrappedNativeToken(token.chainId as TargetChainId)

  if (!wrappedNativeToken) return false

  return areAddressesEqual(wrappedNativeToken.address, token.address)
}
