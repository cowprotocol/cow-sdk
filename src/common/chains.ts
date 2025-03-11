import { NATIVE_CURRENCY_ADDRESS, TokenInfo, WRAPPED_NATIVE_CURRENCIES } from './tokens'

/**
 * Supported chains and their `chainId` for the SDK.
 * @enum
 */
export enum SupportedChainId {
  MAINNET = 1,
  GNOSIS_CHAIN = 100,
  ARBITRUM_ONE = 42161,
  BASE = 8453,
  SEPOLIA = 11155111,
}

/**
 * The chain id of the chain.
 *
 * TODO: Should we generalize it even more to allow non-EVM chains? We should probably revisit also the chain interface, and some other types.
 */
export type ChainId = number

export interface WebUrl {
  url: string
  name: string
}

export type ChainRpcUrls = {
  http: readonly string[]
  webSocket?: readonly string[] | undefined
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
   * Name of the chain as defined in
   */
  readonly name: string

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
  readonly logo: { light: string; dark: string }

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

// TODO: Not use a reference from CoW Swap repo in the sdk repo.
const CHAIN_ASSETS = 'https://raw.githubusercontent.com/cowprotocol/cowswap/refs/heads/develop/libs/assets/src/cow-swap'

export const baseNativeCurrency: Omit<TokenInfo, 'chainId'> = {
  address: NATIVE_CURRENCY_ADDRESS,
  decimals: 18,
  name: 'Ether',
  symbol: 'ETH',
}

export const EthereumLogo = `${CHAIN_ASSETS}/network-mainnet-logo.svg`
const GnosisChainLogo = `${CHAIN_ASSETS}/network-gnosis-chain-logo.svg`
const ArbitrumOneLogoLight = `${CHAIN_ASSETS}/network-arbitrum-one-logo-blue.svg`
const ArbitrumOneLogoDark = `${CHAIN_ASSETS}/network-arbitrum-one-logo-white.svg`
const BaseLogo = `${CHAIN_ASSETS}/network-base-logo.svg`
const SepoliaLogo = `${CHAIN_ASSETS}/network-sepolia-logo.svg`
/**
 * Mainnet chain info.
 *
 * See also https://github.com/wevm/viem/blob/main/src/chains/definitions/mainnet.ts
 */
export const mainnet: ChainInfo = {
  id: SupportedChainId.MAINNET,
  name: 'mainnet',
  label: 'Ethereum',
  nativeCurrency: {
    ...baseNativeCurrency,
    chainId: SupportedChainId.MAINNET,
  },
  addressPrefix: 'eth',
  isTestnet: false,
  contracts: {
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensUniversalResolver: {
      address: '0xce01f8eee7E479C928F8919abD53E553a36CeF67',
      blockCreated: 19_258_213,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14_353_601,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://eth.merkle.io'],
    },
  },
  color: '#62688F',
  logo: { light: EthereumLogo, dark: EthereumLogo },

  website: {
    name: 'Ethereum',
    url: 'https://ethereum.org',
  },
  docs: {
    name: 'Ethereum Docs',
    url: 'https://ethereum.org/en/developers/docs',
  },
  blockExplorer: {
    name: 'Etherscan',
    url: 'https://etherscan.io',
  },
}

/**
 * Gnosis chain chain info.
 *
 * See also https://github.com/wevm/viem/blob/main/src/chains/definitions/gnosis.ts
 */
export const gnosisChain: ChainInfo = {
  id: SupportedChainId.GNOSIS_CHAIN,
  name: 'gnosis_chain',
  label: 'Gnosis Chain',
  nativeCurrency: {
    ...baseNativeCurrency,
    chainId: SupportedChainId.GNOSIS_CHAIN,
    name: 'xDAI',
    symbol: 'xDAI',
  },
  addressPrefix: 'gno',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 21022491,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.gnosischain.com'],
      webSocket: ['wss://rpc.gnosischain.com/wss'],
    },
  },
  color: '#07795B',
  logo: { light: GnosisChainLogo, dark: GnosisChainLogo },

  website: {
    name: 'Gnosis Chain',
    url: 'https://www.gnosischain.com',
  },
  docs: {
    name: 'Gnosis Chain Docs',
    url: 'https://docs.gnosischain.com',
  },
  blockExplorer: {
    name: 'Gnosisscan',
    url: 'https://gnosisscan.io',
  },
  bridges: [
    {
      name: 'Gnosis Chain Bridge',
      url: 'https://bridge.gnosischain.com',
    },
  ],
}

/**
 * Arbitrum chain info.
 *
 * See also https://github.com/wevm/viem/blob/main/src/chains/definitions/arbitrum.ts
 */
export const arbitrumOne: ChainInfo = {
  id: SupportedChainId.ARBITRUM_ONE,
  name: 'arbitrum_one',
  label: 'Arbitrum One',
  nativeCurrency: {
    ...baseNativeCurrency,
    chainId: SupportedChainId.ARBITRUM_ONE,
  },
  addressPrefix: 'arb1',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 7654707,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://arb1.arbitrum.io/rpc'],
    },
  },
  color: '#1B4ADD',
  logo: { light: ArbitrumOneLogoLight, dark: ArbitrumOneLogoDark },

  website: {
    name: 'Arbitrum',
    url: 'https://arbitrum.io',
  },
  docs: {
    name: 'Arbitrum Docs',
    url: 'https://docs.arbitrum.io',
  },
  blockExplorer: {
    name: 'Arbiscan',
    url: 'https://arbiscan.io',
  },
  bridges: [
    {
      name: 'Arbitrum Bridge',
      url: 'https://bridge.arbitrum.io',
    },
  ],
}

/**
 * Base chain info.
 *
 * See also https://github.com/wevm/viem/blob/main/src/chains/definitions/base.ts
 */
export const base: ChainInfo = {
  id: SupportedChainId.BASE,
  name: 'base',
  label: 'Base',
  nativeCurrency: {
    ...baseNativeCurrency,
    chainId: SupportedChainId.BASE,
  },
  addressPrefix: 'base',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 5022,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
  },
  color: '#0052FF',
  logo: { light: BaseLogo, dark: BaseLogo },

  website: {
    name: 'Sepolia resources',
    url: 'https://sepolia.dev',
  },
  docs: {
    name: 'Sepolia resources',
    url: 'https://sepolia.dev',
  },
  blockExplorer: {
    name: 'BaseScan',
    url: 'https://basescan.org',
  },
  bridges: [
    {
      name: 'Superchain Bridges',
      url: 'https://bridge.base.org/deposit',
    },
  ],
}

/**
 * Sepolia chain info.
 *
 * See also https://github.com/wevm/viem/blob/main/src/chains/definitions/sepolia.ts
 */
export const sepolia: ChainInfo = {
  id: SupportedChainId.SEPOLIA,
  name: 'sepolia',
  label: 'Sepolia',
  nativeCurrency: WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SEPOLIA],
  addressPrefix: 'sep',
  isTestnet: true,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 751532,
    },
    ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
    ensUniversalResolver: {
      address: '0xc8Af999e38273D658BE1b921b88A9Ddf005769cC',
      blockCreated: 5_317_080,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.drpc.org'],
    },
  },
  color: '#C12FF2',
  logo: { light: SepoliaLogo, dark: SepoliaLogo },

  website: {
    name: 'Ethereum',
    url: 'https://ethereum.org',
  },
  docs: {
    name: 'Sepolia Docs',
    url: 'https://docs.cow.fi',
  },
  blockExplorer: {
    name: 'Etherscan',
    url: 'https://sepolia.etherscan.io',
  },
  bridges: [
    {
      name: 'Gnosis Chain Bridge',
      url: 'https://bridge.gnosischain.com',
    },
  ],
}

/**
 * Details of all supported chains.
 */
export const ALL_SUPPORTED_CHAINS_MAP: Record<ChainId, ChainInfo> = {
  [SupportedChainId.MAINNET]: mainnet,
  [SupportedChainId.GNOSIS_CHAIN]: gnosisChain,
  [SupportedChainId.ARBITRUM_ONE]: arbitrumOne,
  [SupportedChainId.BASE]: base,
  [SupportedChainId.SEPOLIA]: sepolia,
}

/**
 * All supported chains.
 */
export const ALL_SUPPORTED_CHAINS = Object.values(ALL_SUPPORTED_CHAINS_MAP)

/**
 * The list of supported chains.
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = ALL_SUPPORTED_CHAINS.map(
  (chain) => chain.id
) as SupportedChainId[]
