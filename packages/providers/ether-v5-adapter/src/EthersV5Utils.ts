import { AdapterUtils } from '@cowprotocol/sdk-common'
import { BytesLike, ethers } from 'ethers'

export class EthersV5Utils implements AdapterUtils {
  toUtf8Bytes(text: string): Uint8Array {
    return ethers.utils.toUtf8Bytes(text)
  }

  keccak256(data: BytesLike) {
    return ethers.utils.keccak256(data)
  }

  arrayify(hexString: string): Uint8Array {
    return ethers.utils.arrayify(hexString)
  }
}
