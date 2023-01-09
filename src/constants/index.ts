import contractNetworks from '@cowprotocol/contracts/networks.json'
import { ALL_SUPPORTED_CHAIN_IDS } from './chains'

const { GPv2Settlement } = (
  typeof contractNetworks === 'string' ? JSON.parse(contractNetworks as unknown as string) : contractNetworks
) as typeof contractNetworks

export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS = ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, string>>(
  (acc, chainId) => ({
    ...acc,
    [chainId]: GPv2Settlement[chainId].address,
  }),
  {}
)

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const DEFAULT_APP_DATA_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const DEFAULT_IPFS_READ_URI = 'https://gnosis.mypinata.cloud/ipfs'
export const DEFAULT_IPFS_WRITE_URI = 'https://api.pinata.cloud'
