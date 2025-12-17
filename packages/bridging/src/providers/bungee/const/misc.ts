import { BungeeTxDataBytesIndicesType } from '../types'

export const HOOK_DAPP_BRIDGE_PROVIDER_PREFIX = 'cow-sdk://bridging/providers'

/**
 * Mapping of indices of different fields in the calldata for different bridges
 * Considers the full SocketGateway calldata eg. calldata that goes via SocketGateway.fallback()
 * 0x + routeId (4bytes) + function selector (4bytes) + function input params
 */
export const BungeeTxDataBytesIndices: BungeeTxDataBytesIndicesType = {
  across: {
    // bridgeERC20To
    ['0x792ebcb9'.toLowerCase()]: {
      inputAmount: {
        bytes_startIndex: 8, // first 8 bytes are the routeId, followed by the function selector
        bytes_length: 32, // first 32 bytes of the params are the amount
        bytesString_startIndex: 2 + 8 * 2, // first two characters are 0x and 8 bytes = 16 chars for the amount
        bytesString_length: 32 * 2, // 32 bytes = 64 chars for the amount
      },
      outputAmount: {
        bytes_startIndex: 488, // outputAmount is part of the AcrossBridgeData struct in SocketGateway AcrossV3 impl
        bytes_length: 32, // 32 bytes of amount
        bytesString_startIndex: 2 + 488 * 2, // first two characters are 0x and 484 bytes = 968 chars for the amount
        bytesString_length: 32 * 2, // 32 bytes = 64 chars for the amount
      },
    },
    // bridgeNativeTo
    ['0xe421f352'.toLowerCase()]: {
      inputAmount: {
        bytes_startIndex: 8, // first 8 bytes are the routeId, followed by the function selector
        bytes_length: 32, // first 32 bytes of the params are the amount
        bytesString_startIndex: 2 + 8 * 2, // first two characters are 0x and 8 bytes = 16 chars for the amount
        bytesString_length: 32 * 2, // 32 bytes = 64 chars for the amount
      },
      outputAmount: {
        bytes_startIndex: 392, // outputAmount is part of the AcrossBridgeData struct in SocketGateway AcrossV3 impl
        bytes_length: 32, // 32 bytes of amount
        bytesString_startIndex: 2 + 392 * 2, // first two characters are 0x and 484 bytes = 968 chars for the amount
        bytesString_length: 32 * 2, // 32 bytes = 64 chars for the amount
      },
    },
  },
  cctp: {
    // bridgeERC20To
    ['0xb7dfe9d0'.toLowerCase()]: {
      inputAmount: {
        bytes_startIndex: 8, // first 8 bytes are the routeId, followed by the function selector
        bytes_length: 32, // first 32 bytes of the params are the amount
        bytesString_startIndex: 2 + 8 * 2, // first two characters are 0x and 8 bytes = 16 chars for the amount
        bytesString_length: 32 * 2, // 32 bytes = 64 chars for the amount
      },
    },
  },
  'gnosis-native-bridge': {
    // bridgeERC20To (amount is 5th param -> 8 + 4*32 = 136)
    ['0x3bf5c228'.toLowerCase()]: {
      inputAmount: {
        bytes_startIndex: 136, // first 136 bytes are the routeId, followed by the function selector
        bytes_length: 32, // first 32 bytes of the params are the amount
        bytesString_startIndex: 2 + 8 * 2, // first two characters are 0x and 8 bytes = 16 chars for the amount
        bytesString_length: 32 * 2, // 32 bytes = 64 chars for the amount
      },
    },
    // bridgeNativeTo (amount is 4th param -> 8 + 3*32 = 104)
    ['0xfcb23eb0'.toLowerCase()]: {
      inputAmount: {
        bytes_startIndex: 104, // first 104 bytes are the routeId, followed by the function selector
        bytes_length: 32, // first 32 bytes of the params are the amount
        bytesString_startIndex: 2 + 8 * 2, // first two characters are 0x and 8 bytes = 16 chars for the amount
        bytesString_length: 32 * 2, // 32 bytes = 64 chars for the amount
      },
    },
  },
}
