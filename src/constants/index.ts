import { GPv2Settlement } from '@gnosis.pm/gp-v2-contracts/networks.json'
import { SupportedChainId as ChainId } from './chains'

export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<number, string>> = {
  [ChainId.MAINNET]: GPv2Settlement[ChainId.MAINNET].address,
  [ChainId.RINKEBY]: GPv2Settlement[ChainId.RINKEBY].address,
  [ChainId.GNOSIS_CHAIN]: GPv2Settlement[ChainId.GNOSIS_CHAIN].address,
}
