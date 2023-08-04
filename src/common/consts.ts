import { SupportedChainId } from './chains'
import contractNetworks from '@cowprotocol/contracts/networks.json'

const { GPv2Settlement } = JSON.parse(contractNetworks as unknown as string) as typeof contractNetworks

export const BUY_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

/**
 * The list of supported chains.
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.GOERLI,
  SupportedChainId.GNOSIS_CHAIN,
]

/**
 * An object containing the addresses of the CoW Protocol settlement contracts for each supported chain.
 */
export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS = ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, string>>(
  (acc, chainId) => ({
    ...acc,
    [chainId]: GPv2Settlement[chainId].address,
  }),
  {}
)
