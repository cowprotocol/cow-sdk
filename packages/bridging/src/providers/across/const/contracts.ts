import { AdditionalTargetChainId, SupportedChainId, TargetChainId } from '@cowprotocol/sdk-config'

export const ACROSS_SPOOK_CONTRACT_ADDRESSES: Record<TargetChainId, string | undefined> = {
  // https://docs.across.to/reference/contract-addresses/mainnet-chain-id-1
  [SupportedChainId.MAINNET]: '0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5',
  // https://docs.across.to/reference/contract-addresses/arbitrum-chain-id-42161-1
  [SupportedChainId.ARBITRUM_ONE]: '0xe35e9842fceaca96570b734083f4a58e8f7c5f2a',
  // https://docs.across.to/reference/contract-addresses/base-chain-id-8453
  [SupportedChainId.BASE]: '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64',
  // // https://docs.across.to/reference/contract-addresses/mainnet-chain-id-1
  [SupportedChainId.SEPOLIA]: '0x5ef6C01E11889d86803e0B23e3cB3F9E9d97B662',
  // https://docs.across.to/reference/contract-addresses/polygon-chain-id-137
  [SupportedChainId.POLYGON]: '0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096',
  // https://docs.across.to/reference/contract-addresses/lens-chain-id-232
  [SupportedChainId.LENS]: '0xe7cb3e167e7475dE1331Cf6E0CEb187654619E12',
  // https://docs.across.to/reference/contract-addresses/bnb-smart-chain
  [SupportedChainId.BNB]: '0x4e8E101924eDE233C13e2D8622DC8aED2872d505',
  // https://docs.across.to/reference/contract-addresses/linea-chain-id-59144
  [SupportedChainId.LINEA]: '0xE0BCff426509723B18D6b2f0D8F4602d143bE3e0',
  // https://docs.across.to/reference/contract-addresses/plasma
  [SupportedChainId.PLASMA]: '0x50039fAEfebef707cFD94D6d462fE6D10B39207a',

  // Not supported chains
  // TODO: This first integration is a draft, some of this chains might be supported, so we will need to update here as we iterate on the provider
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
  [SupportedChainId.AVALANCHE]: undefined,
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
  [SupportedChainId.POLYGON]: undefined,
  [AdditionalTargetChainId.OPTIMISM]: undefined,
  [SupportedChainId.AVALANCHE]: undefined,
  [SupportedChainId.LENS]: undefined, // TODO: confirm
  [SupportedChainId.BNB]: undefined, // TODO: confirm
  [SupportedChainId.LINEA]: undefined, // TODO: confirm
  [SupportedChainId.PLASMA]: undefined, // TODO: confirm
}
