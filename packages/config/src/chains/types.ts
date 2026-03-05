import { TokenInfo } from '../types/tokens'


// list of networks ids, it's necessary to define fields for a few different enums
// ts doesn't allow narrowing types for enums:
// export enum SupportedChainId {
//   MAINNET = EvmChains.MAINNET,
// }
//
// we can't use an object as const due to different behavior for:
// export const SupportedChainId = {
//   MAINNET: EvmChains.MAINNET,
//   ... etc
// } as const
// and
// export enum SupportedChainId {
//   MAINNET = MAINNET_ID,
//   ... etc
// }
// example:
// let chainId = 1
// chainId in SupportedChainId - will work differently for both
// chainId in SupportedChainId (SupportedChainId as enum) - true
// chainId in SupportedChainId (SupportedChainId as const) - false, due to there is no 1 as a key in the object
//
const MAINNET_ID = 1
const BNB_ID = 56
const GNOSIS_CHAIN_ID = 100
const POLYGON_ID = 137
const LENS_ID = 232
const BASE_ID = 8453
const PLASMA_ID = 9745
const ARBITRUM_ONE_ID = 42161
const AVALANCHE_ID = 43114
const INK_ID = 57073
const LINEA_ID = 59144
const SEPOLIA_ID = 11155111
const OPTIMISM_ID = 10
// it's not a standard solution, we set up our specific id as an our internal convention
const BITCOIN_ID = 1000000000
const SOLANA_ID = 1000000001

/**
 * All EVM chains supported by CoW Protocol or available for bridging
 * */
export enum EvmChains {
  MAINNET = MAINNET_ID,
  BNB = BNB_ID,
  GNOSIS_CHAIN = GNOSIS_CHAIN_ID,
  POLYGON = POLYGON_ID,
  LENS = LENS_ID,
  BASE = BASE_ID,
  PLASMA = PLASMA_ID,
  ARBITRUM_ONE = ARBITRUM_ONE_ID,
  AVALANCHE = AVALANCHE_ID,
  INK = INK_ID,
  LINEA = LINEA_ID,
  SEPOLIA = SEPOLIA_ID,
  OPTIMISM = OPTIMISM_ID,
}

/**
 * All non-EVM available chains that are available for bridging only
 * */
export enum NonEvmChains {
  BITCOIN = BITCOIN_ID,
  SOLANA = SOLANA_ID,
}

/**
 * All EVM chains supported directly by CoW Protocol (where you can sell tokens from).
 * Subset of EvmChains — excludes bridge-only chains like OPTIMISM.
 */
export enum SupportedChainId {
  MAINNET = MAINNET_ID,
  BNB = BNB_ID,
  GNOSIS_CHAIN = GNOSIS_CHAIN_ID,
  POLYGON = POLYGON_ID,
  LENS = LENS_ID,
  BASE = BASE_ID,
  PLASMA = PLASMA_ID,
  ARBITRUM_ONE = ARBITRUM_ONE_ID,
  AVALANCHE = AVALANCHE_ID,
  INK = INK_ID,
  LINEA = LINEA_ID,
  SEPOLIA = SEPOLIA_ID,
}

/**
 * Chains where you can buy tokens using the bridge functionality.
 * These chains are not supported by CoW Protocol directly.
 */
export enum AdditionalTargetChainId {
  OPTIMISM = OPTIMISM_ID,
  BITCOIN = BITCOIN_ID,
  SOLANA = SOLANA_ID,
}

/**
 * This enum contains all the supported chains and some additional ones supported by the different bridges.
 */
export type TargetChainId = SupportedChainId | AdditionalTargetChainId

/**
 * The chain id of the chain.
 */
export type ChainId = number

export type HttpsString = `https://${string}`
export type WssString = `wss://${string}`
export type Address = `0x${string}`

export interface ThemedImage {
  light: string
  dark: string
}

export interface WebUrl {
  url: HttpsString
  name: string
}

export type ChainRpcUrls = {
  http: readonly HttpsString[]
  webSocket?: readonly WssString[]
}

export type ChainContract = {
  address: Address
  blockCreated?: number | undefined
}

export type ChainContracts = {
  multicall3?: ChainContract
  ensRegistry?: ChainContract
  ensUniversalResolver?: ChainContract
  universalSignatureVerifier?: ChainContract
}

/**
 * Base properties shared by all chain types.
 */
type BaseChainInfo = {
  /**
   * Label of the chain. Field used for display purposes.
   */
  readonly label: string

  /**
   * ERC-3770 address prefix
   *
   * See https://eips.ethereum.org/EIPS/eip-3770
   */
  readonly addressPrefix: string

  /**
   * Native currency of the chain (must have a non-empty address).
   */
  readonly nativeCurrency: TokenInfo

  /**
   * Whether the chain is a testnet.
   */
  readonly isTestnet: boolean

  /**
   * Main color of the chain, used for presentation purposes.
   */
  readonly color: string

  /**
   * Logo of the chain.
   */
  readonly logo: ThemedImage

  /**
   * Documentation of the chain.
   */
  readonly docs: WebUrl

  /**
   * Website of the chain.
   */
  readonly website: WebUrl

  /**
   * Block explorer of the chain.
   */
  readonly blockExplorer: WebUrl

  /**
   * Bridges of the chain.
   */
  readonly bridges?: WebUrl[]

  /**
   * Whether the chain is under development.
   * A chain might show up already as a supported chain, but still be under development (not all features are ready,
   * related services running, contracts deployed, etc).
   */
  readonly isUnderDevelopment?: boolean

  /**
   * Whether the chain is deprecated (no new trading).
   * The chain remains in the SDK regardless for history and Explorer.
   */
  readonly isDeprecated?: boolean
}

/**
 * Chain info for EVM chains.
 * EVM chains have native currency with an address and RPC URLs.
 */
export interface EvmChainInfo extends BaseChainInfo {
  /**
   * The chain id (must be a number for EVM chains).
   */
  readonly id: ChainId

  /**
   * EIP155 label of the chain. Field used for connecting to MetaMask.
   */
  readonly eip155Label: string

  /**
   * Contracts of the chain.
   */
  readonly contracts: ChainContracts

  /**
   * RPC URLs of the chain (must have actual URLs).
   */
  readonly rpcUrls: {
    [key: string]: ChainRpcUrls
    default: ChainRpcUrls
  }

  /**
   * Whether the chain is zkSync based.
   */
  readonly isZkSync?: boolean
}

/**
 * Chain info for non-EVM chains.
 * Non-EVM chains don't have native currency addresses or RPC URLs.
 */
export interface NonEvmChainInfo extends BaseChainInfo {
  /**
   * The chain id for non-EVM chains.
   */
  readonly id: ChainId

  /**
   * Native currency of the chain (address is empty string for non-EVM chains).
   */
  readonly nativeCurrency: TokenInfo
}

/**
 * A chain on the network.
 *
 * This is a union type that can be either an EVM chain or a non-EVM chain.
 * Use type guards like `isEvmChain()` to narrow the type.
 *
 * Probably we could use the viem chain definition, I think multicall3, and ensRegistry and the types defined there can be handy. But for now we are using a simplified version.
 *
 * For a list of chains, see: https://github.com/wevm/viem/tree/main/src/chains/definitions
 */
export type ChainInfo = EvmChainInfo | NonEvmChainInfo
