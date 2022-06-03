import log from 'loglevel'
import { Context } from '../../utils/context'
import { getSerializedCID, loadIpfsFromCid, validateAppDataDocument } from '../../utils/appData'
import { calculateIpfsCidV0, pinJSONToIPFS } from '../../utils/ipfs'
import { AppDataDoc, IpfsHashInfo, MetadataDoc } from './types'
import { CowError } from '../../utils/common'

const DEFAULT_APP_CODE = 'CowSwap'
const DEFAULT_APP_VERSION = '0.3.0'

export class MetadataApi {
  context: Context

  constructor(context: Context) {
    this.context = context
  }

  generateAppDataDoc(metadata: MetadataDoc = {}, appCode: string = DEFAULT_APP_CODE): AppDataDoc {
    return {
      version: DEFAULT_APP_VERSION,
      appCode,
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
      const error = e as CowError
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

  /**
   * Calculates appDataHash WITHOUT publishing file to IPFS
   *
   * This method is intended to quickly generate the appDataHash independent
   * of IPFS upload/pinning
   * The hash is deterministic thus uploading it to IPFS will give you the same
   * result
   *
   * WARNING!
   * One important caveat is that - like `uploadMetadataDocToIpfs` method - the
   * calculation is done with a stringified file without a new line at the end.
   * That means that you will get different results if the file is uploaded
   * directly as a file. For example:
   *
   * Consider the content `hello world`.
   *
   * Using IPFS's cli tool to updload a file with the contents above
   * (`ipfs add file`), it'll have the line ending and result in this CIDv0:
   * QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o
   *
   * While using this method - and `uploadMetadataDocToIpfs` - will give you
   * this CIDv0:
   * Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD
   *
   * @param appData
   */
  async calculateAppDataHash(appData: AppDataDoc): Promise<IpfsHashInfo | void> {
    const validation = await validateAppDataDocument(appData)
    if (!validation?.result) {
      throw new CowError('Invalid appData provided', validation?.errors)
    }

    try {
      const cidV0 = await calculateIpfsCidV0(appData)
      const appDataHash = await this.cidToAppDataHex(cidV0)

      if (!appDataHash) {
        throw new CowError(`Could not extract appDataHash from calculated cidV0 ${cidV0}`)
      }

      return { cidV0, appDataHash }
    } catch (e) {
      const error = e as CowError
      throw new CowError('Failed to calculate appDataHash', error.message)
    }
  }

  async uploadMetadataDocToIpfs(appDataDoc: AppDataDoc): Promise<string | void> {
    const { IpfsHash } = await pinJSONToIPFS(appDataDoc, this.context.ipfs)
    return this.cidToAppDataHex(IpfsHash)
  }
}
