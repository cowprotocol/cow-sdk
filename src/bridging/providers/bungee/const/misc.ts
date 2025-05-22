import { BungeeTxDataBytesIndicesType } from '../types'

export const HOOK_DAPP_BRIDGE_PROVIDER_PREFIX = 'cow-sdk://bridging/providers'

export const BungeeTxDataBytesIndices: BungeeTxDataBytesIndicesType = {
  across: {
    inputAmount: {
      bytes_startIndex: 4, // first 4 bytes are the function selector
      bytes_length: 32, // first 32 bytes of the params are the amount
      bytesString_startIndex: 2 + 4 * 2, // first two characters are 0x and 4 bytes = 8 chars for the amount
      bytesString_length: 32 * 2, // 32 bytes = 64 chars for the amount
    },
    outputAmount: {
      bytes_startIndex: 484, // outputAmount is part of the AcrossBridgeData struct in SocketGateway AcrossV3 impl
      bytes_length: 32, // 32 bytes of amount
      bytesString_startIndex: 2 + 484 * 2, // first two characters are 0x and 484 bytes = 968 chars for the amount
      bytesString_length: 32 * 2, // 32 bytes = 64 chars for the amount
    },
  },
  cctp: {
    inputAmount: {
      bytes_startIndex: 4, // first 4 bytes are the function selector
      bytes_length: 32, // first 32 bytes of the params are the amount
      bytesString_startIndex: 2 + 4 * 2, // first two characters are 0x and 4 bytes = 8 chars for the amount
      bytesString_length: 32 * 2, // 32 bytes = 64 chars for the amount
    },
  },
}
