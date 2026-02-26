import { TokenInfo } from '../types/tokens'

/**
 * All EVM chains supported by CoW Protocol or available for bridging
 * */
export enum EvmChains {
  MAINNET = 1,
  BNB = 56,
  GNOSIS_CHAIN = 100,
  POLYGON = 137,
  LENS = 232,
  BASE = 8453,
  PLASMA = 9745,
  ARBITRUM_ONE = 42161,
  AVALANCHE = 43114,
  INK = 57073,
  LINEA = 59144,
  SEPOLIA = 11155111,
  OPTIMISM = 10,
}

/**
 * All non-EVM available chains that are available for bridging only
 * */
export enum NonEvmChains {
  BITCOIN = 1000000000,
  SOLANA = 501,
}

/**
 * Use this when you need to reference chain IDs like SupportedChainId.MAINNET
 * it's a union of all the EvmChains that supported directly by CoW Protocol.
 */
export const SupportedChainId = {
  MAINNET: EvmChains.MAINNET,
  BNB: EvmChains.BNB,
  GNOSIS_CHAIN: EvmChains.GNOSIS_CHAIN,
  POLYGON: EvmChains.POLYGON,
  LENS: EvmChains.LENS,
  BASE: EvmChains.BASE,
  PLASMA: EvmChains.PLASMA,
  ARBITRUM_ONE: EvmChains.ARBITRUM_ONE,
  AVALANCHE: EvmChains.AVALANCHE,
  INK: EvmChains.INK,
  LINEA: EvmChains.LINEA,
  SEPOLIA: EvmChains.SEPOLIA,
} as const

/**
 * Supported chains and their `chainId` for the SDK.
 * A supported chain, is a chain where CoW Protocol is deployed, so you can sell tokens from there.
 *
 */
export type SupportedChainId = (typeof SupportedChainId)[keyof typeof SupportedChainId]

/**
 * Chains where you can buy tokens using the bridge functionality. These chains are not supported by CoW Protocol
 */
export const AdditionalTargetChainId = {
  OPTIMISM: EvmChains.OPTIMISM,
  BITCOIN: NonEvmChains.BITCOIN,
  SOLANA: NonEvmChains.SOLANA,
} as const

/**
 * Chains where you can buy tokens using the bridge functionality. This enum contains chains that are not already included in the SupportedEvmChainId enum.
 */
export type AdditionalTargetChainId = (typeof AdditionalTargetChainId)[keyof typeof AdditionalTargetChainId]

/**
 * This enum contains all the supported chains and some additional ones supported by the different bridges.
 */
export type TargetChainId = EvmChains | NonEvmChains

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
