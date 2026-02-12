import { AdditionalTargetChainId, SupportedEvmChainId, TargetEvmChainId } from '@cowprotocol/sdk-config'

// See https://docs.across.to/reference/contract-addresses

export const ACROSS_SPOOK_CONTRACT_ADDRESSES: Record<TargetEvmChainId, string | undefined> = {
  // https://docs.across.to/reference/contract-addresses/mainnet-chain-id-1
  [SupportedEvmChainId.MAINNET]: '0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5',
  // https://docs.across.to/reference/contract-addresses/arbitrum-chain-id-42161-1
  [SupportedEvmChainId.ARBITRUM_ONE]: '0xe35e9842fceaca96570b734083f4a58e8f7c5f2a',
  // https://docs.across.to/reference/contract-addresses/base-chain-id-8453
  [SupportedEvmChainId.BASE]: '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64',
  // // https://docs.across.to/reference/contract-addresses/mainnet-chain-id-1
  [SupportedEvmChainId.SEPOLIA]: '0x5ef6C01E11889d86803e0B23e3cB3F9E9d97B662',
  // https://docs.across.to/reference/contract-addresses/polygon-chain-id-137
  [SupportedEvmChainId.POLYGON]: '0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096',
  // https://docs.across.to/reference/contract-addresses/lens-chain
  [SupportedEvmChainId.LENS]: '0xb234cA484866c811d0e6D3318866F583781ED045',
  // https://docs.across.to/reference/contract-addresses/bnb-smart-chain
  [SupportedEvmChainId.BNB]: '0x4e8E101924eDE233C13e2D8622DC8aED2872d505',
  // https://docs.across.to/reference/contract-addresses/linea-chain-id-59144
  [SupportedEvmChainId.LINEA]: '0x7E63A5f1a8F0B4d0934B2f2327DAED3F6bb2ee75',
  // https://docs.across.to/reference/contract-addresses/plasma
  [SupportedEvmChainId.PLASMA]: '0x50039fAEfebef707cFD94D6d462fE6D10B39207a',
  // https://docs.across.to/reference/contract-addresses/ink-chain-id-57073
  [SupportedEvmChainId.INK]: '0xeF684C38F94F48775959ECf2012D7E864ffb9dd4',
  // https://docs.across.to/reference/contract-addresses/optimism-chain-id-10
  [AdditionalTargetChainId.OPTIMISM]: '0x6f26Bf09B1C792e3228e5467807a900A503c0281',

  // Not supported chains
  // TODO: This first integration is a draft, some of this chains might be supported, so we will need to update here as we iterate on the provider
  [SupportedEvmChainId.GNOSIS_CHAIN]: undefined,
  [SupportedEvmChainId.AVALANCHE]: undefined,
}

export const ACROSS_MATH_CONTRACT_ADDRESSES: Record<TargetEvmChainId, string | undefined> = {
  [SupportedEvmChainId.MAINNET]: '0xf2ae6728b6f146556977Af0A68bFbf5bADA22863',
  [SupportedEvmChainId.ARBITRUM_ONE]: '0x5771A4b4029832e79a75De7B485E5fBbec28848f',
  [SupportedEvmChainId.BASE]: '0xd4e943dc6ddc885f6229ce33c2e3dfe402a12c81',

  // Not supported chains
  // TODO: This first integration is a draft, some of this chains might be supported, so we will need to update here as we iterate on the provider
  [SupportedEvmChainId.GNOSIS_CHAIN]: undefined,
  [SupportedEvmChainId.SEPOLIA]: undefined,
  [SupportedEvmChainId.POLYGON]: undefined,
  [AdditionalTargetChainId.OPTIMISM]: undefined,
  [SupportedEvmChainId.AVALANCHE]: undefined,
  [SupportedEvmChainId.LENS]: undefined, // TODO: confirm
  [SupportedEvmChainId.BNB]: undefined, // TODO: confirm
  [SupportedEvmChainId.LINEA]: undefined, // TODO: confirm
  [SupportedEvmChainId.PLASMA]: undefined, // TODO: confirm
  [SupportedEvmChainId.INK]: undefined, // TODO: confirm
}
