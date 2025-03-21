import { Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import { Signer } from '@ethersproject/abstract-signer'
import { GetErc20Decimals } from '../types'
import { TargetChainId } from '../../chains'

const ERC20_DECIMALS_OF_ABI = ['function decimals() external view returns (uint8)'] as const

export function factoryGetErc20Decimals(provider: Signer | Provider): GetErc20Decimals {
  return (_chainId: TargetChainId, tokenAddress: string) => {
    const contract = new Contract(tokenAddress, ERC20_DECIMALS_OF_ABI, provider)
    return contract.decimals()
  }
}
