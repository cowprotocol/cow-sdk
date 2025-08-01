import { getGlobalAdapter } from '@cowprotocol/sdk-common'
import { GetErc20Decimals } from '../types'
import { TargetChainId } from '@cowprotocol/sdk-config'

const ERC20_DECIMALS_ABI = ['function decimals() external view returns (uint8)'] as const

export function factoryGetErc20Decimals(): GetErc20Decimals {
  return (_chainId: TargetChainId, tokenAddress: string) => {
    const adapter = getGlobalAdapter()
    const contract = adapter.getContract(tokenAddress, ERC20_DECIMALS_ABI)
    return contract.decimals()
  }
}
