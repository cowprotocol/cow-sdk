import { OrderKind } from '@cowprotocol/contracts'

interface Market<T = string> {
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

export function getCanonicalMarket<T>({ sellToken, buyToken, kind }: CanonicalMarketParams<T>): Market<T> {
  // TODO: Implement smarter logic https://github.com/cowprotocol/explorer/issues/9

  // Not big reasoning on my selection of what is base and what is quote (important thing in this PR is just to do a consistent selection)
  // The used reasoning is:
  //    - If I sell apples, the quote is EUR (buy token)
  //    - If I buy apples, the quote is EUR (sell token)
  if (kind === OrderKind.SELL) {
    return {
      baseToken: sellToken,
      quoteToken: buyToken,
    }
  } else {
    return {
      baseToken: buyToken,
      quoteToken: sellToken,
    }
  }
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
