import { OrderKind } from '@cowprotocol/contracts'
import { SupportedChainId as ChainId } from '../constants/chains'
import { NATIVE, WRAPPED_NATIVE_TOKEN } from '../constants/tokens'

export function toErc20Address(tokenAddress: string, chainId: ChainId): string {
  let checkedAddress = tokenAddress

  if (tokenAddress === NATIVE[chainId]) {
    checkedAddress = WRAPPED_NATIVE_TOKEN[chainId].address
  }

  return checkedAddress
}

export interface Market<T = string> {
  baseToken: T
  quoteToken: T
}

export interface CanonicalMarketParams<T> {
  sellToken: T
  buyToken: T
  kind: OrderKind
}

export interface TokensFromMarketParams<T> extends Market<T> {
  kind: OrderKind
}

export function getTokensFromMarket<T>({
  quoteToken,
  baseToken,
  kind,
}: TokensFromMarketParams<T>): Omit<CanonicalMarketParams<T>, 'kind'> {
  if (kind === OrderKind.SELL) {
    return {
      sellToken: baseToken,
      buyToken: quoteToken,
    }
  } else {
    return {
      buyToken: baseToken,
      sellToken: quoteToken,
    }
  }
}
