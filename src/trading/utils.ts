import { LimitOrderParameters, SwapParameters, TraderParameters } from './types'
import { OrderQuoteResponse } from '../order-book'
import { ETH_ADDRESS } from '../common'
import { ethers, Signer } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'

export function swapParamsToLimitOrderParams(
  params: SwapParameters,
  { quote: { sellAmount, buyAmount }, id }: OrderQuoteResponse
): LimitOrderParameters {
  // In this SDK we always use Optimal quotes which are always have id
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { ...params, sellAmount, buyAmount, quoteId: id! }
}

export function getIsEthFlowOrder(params: { sellToken: string }): boolean {
  return params.sellToken.toLowerCase() === ETH_ADDRESS.toLowerCase()
}

export function getSigner(signer: TraderParameters['signer']): Signer {
  if (typeof signer === 'string') return new ethers.Wallet(signer)

  if ('request' in signer || 'send' in signer) {
    const provider = new Web3Provider(signer)

    return provider.getSigner()
  }

  return signer as Signer
}
