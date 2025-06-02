import { AdditionalTargetChainId, SupportedChainId, TargetChainId } from 'src/chains'

// TODO deploy on all chains
export const BungeeCowswapLibAddresses: Record<TargetChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: undefined,
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
  [SupportedChainId.ARBITRUM_ONE]: '0x73eb30778f7e3958bfd974d10c0be559c2c65e22',
  [SupportedChainId.BASE]: undefined,
  [SupportedChainId.AVALANCHE]: undefined,
  [SupportedChainId.POLYGON]: undefined,
  [SupportedChainId.SEPOLIA]: undefined,
  [AdditionalTargetChainId.OPTIMISM]: undefined,
}

// TODO deploy on all chains
export const SocketVerifierAddresses: Record<TargetChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: undefined,
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
  [SupportedChainId.ARBITRUM_ONE]: '0x69D9f76e4cbE81044FE16C399387b12e4DBF27B1',
  [SupportedChainId.BASE]: undefined,
  [SupportedChainId.AVALANCHE]: undefined,
  [SupportedChainId.POLYGON]: undefined,
  [SupportedChainId.SEPOLIA]: undefined,
  [AdditionalTargetChainId.OPTIMISM]: undefined,
}
