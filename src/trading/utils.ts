import { AccountAddress, LimitTradeParameters, PrivateKey, TradeParameters } from './types'
import { QuoteAmountsAndCosts } from '../order-book'
import { ETH_ADDRESS } from '../common'
import { ethers, Signer } from 'ethers'
import { type ExternalProvider, Web3Provider } from '@ethersproject/providers'

export function swapParamsToLimitOrderParams(
  params: TradeParameters,
  quoteId: number,
  amounts: QuoteAmountsAndCosts
): LimitTradeParameters {
  return {
    ...params,
    sellAmount: amounts.afterSlippage.sellAmount.toString(),
    buyAmount: amounts.afterSlippage.buyAmount.toString(),
    quoteId,
  }
}

export function getIsEthFlowOrder(params: { sellToken: string }): boolean {
  return params.sellToken.toLowerCase() === ETH_ADDRESS.toLowerCase()
}

export function getSigner(signer: Signer | ExternalProvider | PrivateKey): Signer {
  if (typeof signer === 'string') return new ethers.Wallet(signer)

  if ('request' in signer || 'send' in signer) {
    const provider = new Web3Provider(signer)

    return provider.getSigner()
  }

  return signer as Signer
}

export function isAccountAddress(address: any): address is AccountAddress {
  return typeof address === 'string' && /^0x[0-9a-fA-F]{40}$/.test(address)
}

export function mapQuoteAmountsAndCosts<T, R>(
  value: QuoteAmountsAndCosts<T>,
  mapper: (value: T) => R
): QuoteAmountsAndCosts<R> {
  const {
    costs: { networkFee, partnerFee },
  } = value

  function serializeAmounts(value: { sellAmount: T; buyAmount: T }): { sellAmount: R; buyAmount: R } {
    return {
      sellAmount: mapper(value.sellAmount),
      buyAmount: mapper(value.buyAmount),
    }
  }

  return {
    ...value,
    costs: {
      ...value.costs,
      networkFee: {
        ...networkFee,
        amountInSellCurrency: mapper(networkFee.amountInSellCurrency),
        amountInBuyCurrency: mapper(networkFee.amountInBuyCurrency),
      },
      partnerFee: {
        ...partnerFee,
        amount: mapper(partnerFee.amount),
      },
    },
    beforeNetworkCosts: serializeAmounts(value.beforeNetworkCosts),
    afterNetworkCosts: serializeAmounts(value.afterNetworkCosts),
    afterPartnerFees: serializeAmounts(value.afterPartnerFees),
    afterSlippage: serializeAmounts(value.afterSlippage),
  }
}
