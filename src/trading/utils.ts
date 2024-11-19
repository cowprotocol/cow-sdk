import { AccountAddress, LimitTradeParameters, PrivateKey, TradeParameters } from './types'
import { OrderQuoteResponse } from '../order-book'
import { ETH_ADDRESS } from '../common'
import { ethers, Signer } from 'ethers'
import { type ExternalProvider, Web3Provider } from '@ethersproject/providers'

export function swapParamsToLimitOrderParams(
  params: TradeParameters,
  { quote: { sellAmount, buyAmount }, id }: OrderQuoteResponse
): LimitTradeParameters {
  // In this SDK we always use Optimal quotes which are always have id
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { ...params, sellAmount, buyAmount, quoteId: id! }
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
