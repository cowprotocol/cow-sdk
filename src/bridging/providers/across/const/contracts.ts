import { AdditionalTargetChainId, SupportedChainId, TargetChainId } from '../../../../chains'

export const ACROSS_SPOOK_CONTRACT_ADDRESSES: Record<TargetChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: '0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5',
  [SupportedChainId.ARBITRUM_ONE]: '0xe35e9842fceaca96570b734083f4a58e8f7c5f2a',
  [SupportedChainId.BASE]: '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64',
  [SupportedChainId.SEPOLIA]: '0x5ef6C01E11889d86803e0B23e3cB3F9E9d97B662',

  // Not supported chains
  // TODO: This first integration is a draft, some of this chains might be supported, so we will need to update here as we iterate on the provider
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
  [AdditionalTargetChainId.POLYGON]: undefined,
  [AdditionalTargetChainId.OPTIMISM]: undefined,
}

export const ACROSS_MATH_CONTRACT_ADDRESSES: Record<TargetChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: '0xf2ae6728b6f146556977Af0A68bFbf5bADA22863',
  [SupportedChainId.ARBITRUM_ONE]: '0x5771A4b4029832e79a75De7B485E5fBbec28848f',
  [SupportedChainId.BASE]: '0xd4e943dc6ddc885f6229ce33c2e3dfe402a12c81',

  // Not supported chains
  // TODO: This first integration is a draft, some of this chains might be supported, so we will need to update here as we iterate on the provider
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
  [SupportedChainId.SEPOLIA]: undefined,
  [AdditionalTargetChainId.POLYGON]: undefined,
  [AdditionalTargetChainId.OPTIMISM]: undefined,
}
