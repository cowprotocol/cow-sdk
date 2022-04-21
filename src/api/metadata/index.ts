import log from 'loglevel'
import { Context } from '../../utils/context'
import { getSerializedCID, loadIpfsFromCid } from '../../utils/appData'
import { pinJSONToIPFS } from '../../utils/ipfs'
import { AppDataDoc, MetadataDoc } from './types'
import { CowError } from '../../utils/common'

const DEFAULT_APP_CODE = 'CowSwap'

export class MetadataApi {
  context: Context

  constructor(context: Context) {
    this.context = context
  }

  generateAppDataDoc(metadata: MetadataDoc = {}): AppDataDoc {
    return {
      version: '0.1.0',
      appCode: DEFAULT_APP_CODE,
      metadata: {
        ...metadata,
      },
    }
  }

  async decodeAppData(hash: string): Promise<void | AppDataDoc> {
    try {
      const cidV0 = await getSerializedCID(hash)
      if (!cidV0) throw new CowError('Error getting serialized CID')
      return loadIpfsFromCid(cidV0)
    } catch (e) {
      const error = e as Error
      log.error('Error decoding AppData:', error)
      throw new CowError('Error decoding AppData: ' + error.message)
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

  async uploadMetadataDocToIpfs(appDataDoc: AppDataDoc): Promise<string | void> {
    const { apiKey, apiSecret } = this.context.ipfs
    if (!apiKey || !apiSecret) {
      throw new CowError('You need to pass IPFS api credentials.')
    }
    const { IpfsHash } = await pinJSONToIPFS(appDataDoc, this.context.ipfs)
    return this.cidToAppDataHex(IpfsHash)
  }
}
