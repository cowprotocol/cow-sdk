import { OrderKind, SupportedChainId, SwapParameters, TradeParameters } from '../../../src'
import { TOKENS } from './tokens'

interface FormState {
  privateKey: string
  chainId: string
  sellToken: string
  buyToken: string
  amount: string
  slippageBps: string
  kind: 'sell' | 'buy'
}

export const getFormState = (): FormState => {
  return Object.fromEntries(new FormData(document.getElementById('form') as HTMLFormElement)) as unknown as FormState
}

export const getTradeParameters = (): TradeParameters => {
  const {
    slippageBps: _slippageBps,
    chainId: _chainId,
    sellToken: _sellToken,
    buyToken: _buyToken,
    amount: _amount,
    kind,
  } = getFormState()

  const chainId: SupportedChainId = +_chainId
  const isSell = kind === 'sell'
  const sellToken = TOKENS[chainId].find((t) => t.address === _sellToken)
  const buyToken = TOKENS[chainId].find((t) => t.address === _buyToken)
  const amount = BigInt(_amount) * BigInt(10 ** (isSell ? sellToken.decimals : buyToken.decimals))
  const slippageBps = _slippageBps ? +_slippageBps : undefined

  return {
    sellToken: sellToken.address,
    sellTokenDecimals: sellToken.decimals,
    buyToken: buyToken.address,
    buyTokenDecimals: buyToken.decimals,
    amount: amount.toString(),
    slippageBps,
    kind: isSell ? OrderKind.SELL : OrderKind.BUY,
  }
}
