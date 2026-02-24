import { Nullish } from '../types'
import { ChainId, getChainInfo, isEvmChain, isNonEvmChain, isSupportedChain, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'
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
  const chainInfo = getChainInfo(token.chainId)
  if (!chainInfo) {
    return false
  }

  // For EVM chains, check if the token address matches the native currency address
  if (isEvmChain(chainInfo.id)) {
    if ('address' in chainInfo.nativeCurrency) {
      return areAddressesEqual(chainInfo.nativeCurrency.address, token.address)
    }
    return false
  }

  // For non-EVM chains, if there's no address (empty string), it's the native token
  if (isNonEvmChain(chainInfo.id)) {
    return token.address === '' // todo need to adjust token definition type
  }

  return false
}

export function isWrappedNativeToken(token: TokenLike): boolean {
  if (!isEvmChain(token.chainId) || !isSupportedChain(token.chainId)) {
    return false
  }
  return areAddressesEqual(WRAPPED_NATIVE_CURRENCIES[token.chainId]?.address, token.address)
}
