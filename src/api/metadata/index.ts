import log from 'loglevel'
import { Context } from '../../utils/context'
import { getSerializedCID, loadIpfsFromCid } from '../../utils/appData'
import { AppDataDoc } from './types'
import { CowError } from '../../utils/common'

export class MetadataApi {
  context: Context

  constructor(context: Context) {
    this.context = context
  }

  async decodeAppData(hash: string): Promise<void | AppDataDoc> {
    try {
      const cidV0 = await getSerializedCID(hash)
      if (!cidV0) throw new CowError('Error getting serialized CID')
      return await loadIpfsFromCid(cidV0)
    } catch (error) {
      log.error('Error decoding AppData:', error)
      throw new CowError('Error decoding AppData: ' + error)
    }
  }

  async cidToAppDataHex(ipfsHash: string): Promise<string | void> {
    const { CID } = await import('multiformats/cid')

    const { digest } = CID.parse(ipfsHash).multihash
    return `0x${Buffer.from(digest).toString('hex')}`
  }

  async appDataHexToCid(hash: string): Promise<string | void> {
    const cidV0 = await getSerializedCID(hash)
    if (!cidV0) throw new CowError('Error getting serialized CID')
    return cidV0
  }
}
