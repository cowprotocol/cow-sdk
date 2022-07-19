import contractNetworks from '@cowprotocol/contracts/networks.json' assert { type: 'json' }
import { SupportedChainId as ChainId } from './chains'

const { GPv2Settlement } = contractNetworks

export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<number, string>> = {
  [ChainId.MAINNET]: GPv2Settlement[ChainId.MAINNET].address,
  [ChainId.RINKEBY]: GPv2Settlement[ChainId.RINKEBY].address,
  [ChainId.GOERLI]: GPv2Settlement[ChainId.GOERLI].address,
  [ChainId.GNOSIS_CHAIN]: GPv2Settlement[ChainId.GNOSIS_CHAIN].address,
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const DEFAULT_APP_DATA_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const DEFAULT_IPFS_READ_URI = 'https://gnosis.mypinata.cloud/ipfs'
export const DEFAULT_IPFS_WRITE_URI = 'https://api.pinata.cloud'
