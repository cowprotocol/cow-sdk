import { SupportedChainId } from '../constants/chains'
import { PriceQuoteParams } from '../types'
import { toErc20Address } from './tokens'

export function getValidParams(params: PriceQuoteParams & { chainId: SupportedChainId }) {
  const { baseToken: baseTokenAux, quoteToken: quoteTokenAux, chainId } = params
  const baseToken = toErc20Address(baseTokenAux, chainId)
  const quoteToken = toErc20Address(quoteTokenAux, chainId)

  return { ...params, baseToken, quoteToken }
}
