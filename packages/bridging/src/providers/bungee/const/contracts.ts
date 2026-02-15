import { AdditionalEvmTargetChainId, SupportedEvmChainId, TargetEvmChainId } from '@cowprotocol/sdk-config'

const BUNGEE_COWSWAP_LIB_ADDRESS = '0x75b6ba5fcab20848ca00f132d253638fea82e598'
export const BungeeCowswapLibAddresses: Record<TargetEvmChainId, string | undefined> = {
  [SupportedEvmChainId.MAINNET]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedEvmChainId.GNOSIS_CHAIN]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedEvmChainId.ARBITRUM_ONE]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedEvmChainId.BASE]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedEvmChainId.AVALANCHE]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedEvmChainId.POLYGON]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedEvmChainId.LENS]: undefined, // TODO: confirm
  [SupportedEvmChainId.BNB]: undefined, // TODO: confirm
  [SupportedEvmChainId.LINEA]: undefined, // TODO: confirm
  [SupportedEvmChainId.PLASMA]: undefined, // TODO: confirm
  [SupportedEvmChainId.INK]: undefined, // TODO: confirm
  [SupportedEvmChainId.SEPOLIA]: undefined,
  [AdditionalEvmTargetChainId.OPTIMISM]: BUNGEE_COWSWAP_LIB_ADDRESS,
}

const SOCKET_VERIFIER_ADDRESS = '0xa27A3f5A96DF7D8Be26EE2790999860C00eb688D'
export const SocketVerifierAddresses: Record<TargetEvmChainId, string | undefined> = {
  [SupportedEvmChainId.MAINNET]: SOCKET_VERIFIER_ADDRESS,
  [SupportedEvmChainId.GNOSIS_CHAIN]: SOCKET_VERIFIER_ADDRESS,
  [SupportedEvmChainId.ARBITRUM_ONE]: SOCKET_VERIFIER_ADDRESS,
  [SupportedEvmChainId.BASE]: SOCKET_VERIFIER_ADDRESS,
  [SupportedEvmChainId.AVALANCHE]: SOCKET_VERIFIER_ADDRESS,
  [SupportedEvmChainId.POLYGON]: SOCKET_VERIFIER_ADDRESS,
  [SupportedEvmChainId.LENS]: undefined, // TODO: confirm
  [SupportedEvmChainId.BNB]: undefined, // TODO: confirm
  [SupportedEvmChainId.LINEA]: undefined, // TODO: confirm
  [SupportedEvmChainId.PLASMA]: undefined, // TODO: confirm
  [SupportedEvmChainId.INK]: undefined, // TODO: confirm
  [SupportedEvmChainId.SEPOLIA]: undefined,
  [AdditionalEvmTargetChainId.OPTIMISM]: SOCKET_VERIFIER_ADDRESS,
}

const BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS = '0xD06a673fe1fa27B1b9E5BA0be980AB15Dbce85cc'
export const BungeeApproveAndBridgeV1Addresses: Record<TargetEvmChainId, string | undefined> = {
  [SupportedEvmChainId.MAINNET]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedEvmChainId.GNOSIS_CHAIN]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedEvmChainId.ARBITRUM_ONE]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedEvmChainId.BASE]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedEvmChainId.AVALANCHE]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedEvmChainId.POLYGON]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedEvmChainId.LENS]: undefined, // TODO: confirm
  [SupportedEvmChainId.BNB]: undefined, // TODO: confirm
  [SupportedEvmChainId.LINEA]: undefined, // TODO: confirm
  [SupportedEvmChainId.PLASMA]: undefined, // TODO: confirm
  [SupportedEvmChainId.INK]: undefined, // TODO: confirm
  [SupportedEvmChainId.SEPOLIA]: undefined,
  [AdditionalEvmTargetChainId.OPTIMISM]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
}
