import { TokenInfo } from '../types/tokens'

/**
 * Supported chains and their `chainId` for the SDK.
 *
 * A supported chain, is a chain where CoW Protocol is deployed, so you can sell tokens from there.
 *
 * @enum
 */
export enum SupportedEvmChainId {
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
}

export enum SupportedSolanaChainId {
  MAINNET = 'solana'
}

export enum SupportedBitcoinChainId {
  MAINNET = 'bitcoin'
}

/**
 * Chains where you can buy tokens using the bridge functionality. This enum contains chains that are not already included in the SupportedChainId enum.
 */
export enum AdditionalEvmTargetChainId {
  OPTIMISM = 10,
}

export const ALL_CHAINS_MAP = {
  ...SupportedEvmChainId,
  ...AdditionalEvmTargetChainId,
  ...SupportedSolanaChainId,
  ...SupportedBitcoinChainId,
} as const

/**
 *
 */
export type TargetEvmChainId = SupportedEvmChainId | AdditionalEvmTargetChainId

export type TargetChainId = (typeof ALL_CHAINS_MAP)[keyof typeof ALL_CHAINS_MAP]

/**
 * The chain id of the chain.
 * Can be a number for EVM chains or a string for non-EVM chains (e.g., Bitcoin, Solana).
 */
export type ChainId = number | string

export type HttpsString = `https://${string}`
export type WssString = `wss://${string}`
export type Address = `0x${string}`;

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
   * EIP155 label of the chain. Field used for connecting to MetaMask.
   */
  readonly eip155Label: string

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

  /**
   * Whether the chain is zkSync based.
   */
  readonly isZkSync?: boolean

  /**
   * Whether the chain is under development.
   * A chain might show up already as a supported chain, but still be under development (not all features are ready,
   * related services running, contracts deployed, etc).
   */
  readonly isUnderDevelopment?: boolean
}
