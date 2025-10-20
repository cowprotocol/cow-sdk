import { AdditionalTargetChainId, SupportedChainId, TargetChainId } from '@cowprotocol/sdk-config'

const BUNGEE_COWSWAP_LIB_ADDRESS = '0x75b6ba5fcab20848ca00f132d253638fea82e598'
export const BungeeCowswapLibAddresses: Record<TargetChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedChainId.GNOSIS_CHAIN]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedChainId.ARBITRUM_ONE]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedChainId.BASE]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedChainId.AVALANCHE]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedChainId.POLYGON]: BUNGEE_COWSWAP_LIB_ADDRESS,
  [SupportedChainId.LENS]: undefined, // TODO: confirm
  [SupportedChainId.BNB]: undefined, // TODO: confirm
  [SupportedChainId.LINEA]: undefined, // TODO: confirm
  [SupportedChainId.PLASMA]: undefined, // TODO: confirm
  [SupportedChainId.SEPOLIA]: undefined,
  [AdditionalTargetChainId.OPTIMISM]: BUNGEE_COWSWAP_LIB_ADDRESS,
}

const SOCKET_VERIFIER_ADDRESS = '0xa27A3f5A96DF7D8Be26EE2790999860C00eb688D'
export const SocketVerifierAddresses: Record<TargetChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: SOCKET_VERIFIER_ADDRESS,
  [SupportedChainId.GNOSIS_CHAIN]: SOCKET_VERIFIER_ADDRESS,
  [SupportedChainId.ARBITRUM_ONE]: SOCKET_VERIFIER_ADDRESS,
  [SupportedChainId.BASE]: SOCKET_VERIFIER_ADDRESS,
  [SupportedChainId.AVALANCHE]: SOCKET_VERIFIER_ADDRESS,
  [SupportedChainId.POLYGON]: SOCKET_VERIFIER_ADDRESS,
  [SupportedChainId.LENS]: undefined, // TODO: confirm
  [SupportedChainId.BNB]: undefined, // TODO: confirm
  [SupportedChainId.LINEA]: undefined, // TODO: confirm
  [SupportedChainId.PLASMA]: undefined, // TODO: confirm
  [SupportedChainId.SEPOLIA]: undefined,
  [AdditionalTargetChainId.OPTIMISM]: SOCKET_VERIFIER_ADDRESS,
}

const BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS = '0xD06a673fe1fa27B1b9E5BA0be980AB15Dbce85cc'
export const BungeeApproveAndBridgeV1Addresses: Record<TargetChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedChainId.GNOSIS_CHAIN]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedChainId.ARBITRUM_ONE]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedChainId.BASE]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedChainId.AVALANCHE]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedChainId.POLYGON]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
  [SupportedChainId.LENS]: undefined, // TODO: confirm
  [SupportedChainId.BNB]: undefined, // TODO: confirm
  [SupportedChainId.LINEA]: undefined, // TODO: confirm
  [SupportedChainId.PLASMA]: undefined, // TODO: confirm
  [SupportedChainId.SEPOLIA]: undefined,
  [AdditionalTargetChainId.OPTIMISM]: BUNGEE_APPROVE_AND_BRIDGE_V1_ADDRESS,
}
