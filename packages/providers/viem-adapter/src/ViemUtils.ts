import { AdapterUtils } from '@cowprotocol/sdk-common'
import { Hex, stringToBytes, keccak256, hexToBytes } from 'viem'

export class ViemUtils implements AdapterUtils {
  toUtf8Bytes(text: string): Uint8Array {
    return stringToBytes(text)
  }

  keccak256(data: Hex): string {
    return keccak256(data)
  }

  arrayify(hexString: string): Uint8Array {
    return hexToBytes(hexString as Hex)
  }
}
