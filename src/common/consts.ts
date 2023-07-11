import { SupportedChainId } from './chains'
import contractNetworks from '@cowprotocol/contracts/networks.json'

const { GPv2Settlement } = JSON.parse(contractNetworks as unknown as string) as typeof contractNetworks

export const BUY_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const EXTENSIBLE_FALLBACK_HANDLER = '0x4e305935b14627eA57CBDbCfF57e81fd9F240403'
export const COMPOSABLE_COW = '0xF487887DA5a4b4e3eC114FDAd97dc0F785d72738'

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

/**
 * An object containing the addresses of the `ExtensibleFallbackHandler` contracts for each supported chain.
 */
export const EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS = ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, string>>(
  (acc, chainId) => ({
    ...acc,
    [chainId]: EXTENSIBLE_FALLBACK_HANDLER,
  }),
  {}
)

/**
 * An object containing the addresses of the `ComposableCow` contracts for each supported chain.
 */
export const COMPOSABLE_COW_CONTRACT_ADDRESS = ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, string>>(
  (acc, chainId) => ({
    ...acc,
    [chainId]: COMPOSABLE_COW,
  }),
  {}
)
