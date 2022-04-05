import { SupportedChainId as ChainId } from '../constants/chains'
import { NATIVE, WRAPPED_NATIVE_TOKEN } from '../constants/tokens'

export function toErc20Address(tokenAddress: string, chainId: ChainId): string {
  let checkedAddress = tokenAddress

  if (tokenAddress === NATIVE[chainId]) {
    checkedAddress = WRAPPED_NATIVE_TOKEN[chainId].address
  }

  return checkedAddress
}
