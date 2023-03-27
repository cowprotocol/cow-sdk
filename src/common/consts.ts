import { SupportedChainId } from './chains'
import contractNetworks from '@cowprotocol/contracts/networks.json'

const { GPv2Settlement } = JSON.parse(contractNetworks as unknown as string) as typeof contractNetworks

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.GOERLI,
  SupportedChainId.GNOSIS_CHAIN,
]

export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS = ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, string>>(
  (acc, chainId) => ({
    ...acc,
    [chainId]: GPv2Settlement[chainId].address,
  }),
  {}
)
