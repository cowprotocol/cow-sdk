import { AdditionalTargetChainId, SupportedChainId, TargetChainId } from '@cowprotocol/sdk-config'

// Old: Shasha's PR:
/*
export const ACROSS_SPOKE_POOL_CONTRACT_ADDRESSES: Record<TargetChainId, string | undefined> = {
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
  // https://docs.across.to/reference/contract-addresses/bnb-smart-chain
  [SupportedChainId.BNB]: '0x4e8E101924eDE233C13e2D8622DC8aED2872d505',
  // https://docs.across.to/reference/contract-addresses/linea-chain-id-59144
  [SupportedChainId.LINEA]: '0x7E63A5f1a8F0B4d0934B2f2327DAED3F6bb2ee75',
  // https://docs.across.to/reference/contract-addresses/plasma
  [SupportedChainId.PLASMA]: '0x50039fAEfebef707cFD94D6d462fE6D10B39207a',
  // https://docs.across.to/reference/contract-addresses/ink-chain-id-57073
  [SupportedChainId.INK]: '0xeF684C38F94F48775959ECf2012D7E864ffb9dd4',
  // https://docs.across.to/reference/contract-addresses/optimism-chain-id-10
  [AdditionalTargetChainId.OPTIMISM]: '0x6f26Bf09B1C792e3228e5467807a900A503c0281',

  // Not supported chains
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
  [SupportedChainId.AVALANCHE]: undefined,
  [AdditionalTargetChainId.BITCOIN]: undefined,
  [AdditionalTargetChainId.SOLANA]: undefined,
}
*/

// See https://docs.across.to/chains-and-contracts
export const ACROSS_SPOKE_POOL_CONTRACT_ADDRESSES: Record<TargetChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: '0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5',
  [SupportedChainId.ARBITRUM_ONE]: '0xe35e9842fceaCA96570B734083f4a58e8F7C5f2A',
  [SupportedChainId.BASE]: '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64',
  [SupportedChainId.SEPOLIA]: '0x5ef6C01E11889d86803e0B23e3cB3F9E9d97B662',
  [SupportedChainId.POLYGON]: '0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096',
  [SupportedChainId.BNB]: '0x4e8E101924eDE233C13e2D8622DC8aED2872d505',
  [SupportedChainId.LINEA]: '0x7E63A5f1a8F0B4d0934B2f2327DAED3F6bb2ee75',
  [SupportedChainId.PLASMA]: '0x50039fAEfebef707cFD94D6d462fE6D10B39207a',
  [SupportedChainId.INK]: '0xeF684C38F94F48775959ECf2012D7E864ffb9dd4',
  [AdditionalTargetChainId.OPTIMISM]: '0x6f26Bf09B1C792e3228e5467807a900A503c0281',

  // Not supported chains
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
  [SupportedChainId.AVALANCHE]: undefined,
  [AdditionalTargetChainId.BITCOIN]: undefined,
  [AdditionalTargetChainId.SOLANA]: undefined,
}

// Old: Shasha's PR:
/*
export const ACROSS_SPOKE_POOL_PERIPHERY_CONTRACT_ADDRESSES: Record<TargetChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: '0x89415a82d909a7238d69094C3Dd1dCC1aCbDa85C',
  [SupportedChainId.ARBITRUM_ONE]: '0x89415a82d909a7238d69094C3Dd1dCC1aCbDa85C',
  [SupportedChainId.BASE]: '0x89415a82d909a7238d69094C3Dd1dCC1aCbDa85C',
  [SupportedChainId.BNB]: '0x89415a82d909a7238d69094C3Dd1dCC1aCbDa85C',
  [SupportedChainId.POLYGON]: '0x89415a82d909a7238d69094C3Dd1dCC1aCbDa85C',
  [SupportedChainId.LENS]: '0x8A8cA9c4112c67b7Dae7dF7E89EA45D592362107',
  [AdditionalTargetChainId.OPTIMISM]: '0x89415a82d909a7238d69094C3Dd1dCC1aCbDa85C',
  [SupportedChainId.LINEA]: '0xE0BCff426509723B18D6b2f0D8F4602d143bE3e0',
  [SupportedChainId.PLASMA]: '0xF1BF00D947267Da5cC63f8c8A60568c59FA31bCb',
  [SupportedChainId.INK]: '0x89415a82d909a7238d69094C3Dd1dCC1aCbDa85C',

  // Not supported chains
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
  [SupportedChainId.SEPOLIA]: undefined,
  [SupportedChainId.AVALANCHE]: undefined,
  [AdditionalTargetChainId.BITCOIN]: undefined,
  [AdditionalTargetChainId.SOLANA]: undefined,
}
*/

// See https://docs.across.to/chains-and-contracts
export const ACROSS_SPOKE_POOL_PERIPHERY_CONTRACT_ADDRESSES: Record<TargetChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: '0x10D8b8DaA26d307489803e10477De69C0492B610',
  [SupportedChainId.ARBITRUM_ONE]: '0x10D8b8DaA26d307489803e10477De69C0492B610',
  [SupportedChainId.BASE]: '0x10D8b8DaA26d307489803e10477De69C0492B610',
  [SupportedChainId.BNB]: '0x10D8b8DaA26d307489803e10477De69C0492B610',
  [SupportedChainId.POLYGON]: '0x10D8b8DaA26d307489803e10477De69C0492B610',
  [AdditionalTargetChainId.OPTIMISM]: '0x10D8b8DaA26d307489803e10477De69C0492B610',
  [SupportedChainId.LINEA]: '0x10D8b8DaA26d307489803e10477De69C0492B610',
  [SupportedChainId.PLASMA]: '0x10D8b8DaA26d307489803e10477De69C0492B610',
  [SupportedChainId.INK]: '0x10D8b8DaA26d307489803e10477De69C0492B610',

  // Not supported chains
  [SupportedChainId.GNOSIS_CHAIN]: undefined,
  [SupportedChainId.SEPOLIA]: '0x10D8b8DaA26d307489803e10477De69C0492B610',
  [SupportedChainId.AVALANCHE]: undefined,
  [AdditionalTargetChainId.BITCOIN]: undefined,
  [AdditionalTargetChainId.SOLANA]: undefined,
}
