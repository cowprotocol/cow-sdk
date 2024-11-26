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

const DECIMALS_SHIFT = 6

/**
 * This function converts input amount to the correct number of decimals.
 * For example, if the input amount is 1.23 and the token has 18 decimals,
 * the result will be 1230000000000000000.
 * Since this is a simplified example, we only allow input amounts with maximum 6 decimals.
 */
const adjustDecimals = (amount: number, decimals: number) => {
  const multiplicator = decimals > DECIMALS_SHIFT ? DECIMALS_SHIFT : 0

  return BigInt(amount * 10 ** multiplicator) * BigInt(10 ** (decimals - multiplicator))
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
  const decimals = isSell ? sellToken.decimals : buyToken.decimals
  const amount = adjustDecimals(+_amount, decimals)
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
