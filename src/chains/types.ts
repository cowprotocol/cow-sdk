import { TokenInfo } from '../common/types/tokens'

/**
 * Supported chains and their `chainId` for the SDK.
 *
 * A supported chain, is a chain where CoW Protocol is deployed, so you can sell tokens from there.
 *
 * @enum
 */
export enum SupportedChainId {
  MAINNET = 1,
  GNOSIS_CHAIN = 100,
  ARBITRUM_ONE = 42161,
  BASE = 8453,
  POLYGON = 137,
  AVALANCHE = 43114,
  SEPOLIA = 11155111,
}

/**
 * Chains where you can buy tokens using the bridge functionality. This enum contains chains that are not already included in the SupportedChainId enum.
 */
export enum AdditionalTargetChainId {
  OPTIMISM = 10,
}

/**
 * Chains where you can buy tokens using the bridge functionality.
 *
 * This enum contains all the supported chains and some additional ones supported by the different bridges.
 */
export type TargetChainId = SupportedChainId | AdditionalTargetChainId

/**
 * The chain id of the chain.
 *
 * TODO: Should we generalize it even more to allow non-EVM chains? We should probably revisit also the chain interface, and some other types.
 */
export type ChainId = number

export interface ThemedImage {
  light: string
  dark: string
}

export interface WebUrl {
  url: string
  name: string
}

export type ChainRpcUrls = {
  http: readonly string[]
  webSocket?: readonly string[]
}

export type ChainContract = {
  address: string
  blockCreated?: number | undefined
}

export type ChainContracts = {
  multicall3?: ChainContract
  ensRegistry?: ChainContract
  ensUniversalResolver?: ChainContract
  universalSignatureVerifier?: ChainContract
}

/**
 * A chain on the network.
 *
 * Probably we could use the viem chain definition, I think multicall3, and ensRegistry and the types defined there can be handy. But for now we are using a simplified version.
 *
 * For a list of chains, see: https://github.com/wevm/viem/tree/main/src/chains/definitions
 */
export interface ChainInfo {
  /**
   * The chain id.
   */
  readonly id: ChainId

  /**
   * Label of the chain. Field used for display purposes.
   */
  readonly label: string

  /**
   * Native currency of the chain.
   */
  readonly nativeCurrency: TokenInfo

  /**
   * ERC-3770 address prefix
   *
   * See https://eips.ethereum.org/EIPS/eip-3770
   */
  readonly addressPrefix: string

  /**
   * Whether the chain is a testnet.
   */
  readonly isTestnet: boolean

  /**
   * Contracts of the chain.
   */
  readonly contracts: ChainContracts

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
   * RPC URLs of the chain.
   */
  readonly rpcUrls: {
    [key: string]: ChainRpcUrls
    default: ChainRpcUrls
  }
}
