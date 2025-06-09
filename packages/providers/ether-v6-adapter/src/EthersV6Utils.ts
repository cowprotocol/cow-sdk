import { AdapterUtils } from '@cowprotocol/sdk-common'
import { BytesLike, toUtf8Bytes, keccak256, getBytes } from 'ethers'

export class EthersV6Utils implements AdapterUtils {
  toUtf8Bytes(text: string): Uint8Array {
    return toUtf8Bytes(text)
  }

  keccak256(data: BytesLike): string {
    return keccak256(this.toEthersBytesLike(data))
  }

  // Helper method to convert our BytesLike to ethers BytesLike
  private toEthersBytesLike(data: BytesLike): BytesLike {
    if (typeof data === 'string') {
      if (data.startsWith('0x')) {
        return data
      }
      return toUtf8Bytes(data)
    } else if (data instanceof Uint8Array) {
      return data
    } else {
      throw new Error('Unsupported data type for conversion to BytesLike')
    }
  }

  arrayify(hexString: string): Uint8Array {
    return getBytes(hexString)
  }
}
