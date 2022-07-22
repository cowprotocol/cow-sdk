import {
  createAppDataDoc,
  createQuoteMetadata,
  createReferrerMetadata,
  latest,
  getAppDataSchema,
  validateAppDataDoc,
} from '@cowprotocol/app-data'
import log from 'loglevel'
import { Context } from '../../utils/context'
import { getSerializedCID, loadIpfsFromCid } from '../../utils/appData'
import { calculateIpfsCidV0, pinJSONToIPFS } from '../../utils/ipfs'
import { AnyAppDataDocVersion, LatestAppDataDocVersion, IpfsHashInfo, GenerateAppDataDocParams } from './types'
import { CowError } from '../../utils/common'

const DEFAULT_APP_CODE = 'CowSwap'

export class MetadataApi {
  context: Context

  constructor(context: Context) {
    this.context = context
  }

  /**
   * Creates an appDataDoc with the latest version format
   *
   * Without params creates a default minimum appData doc
   * Optionally creates metadata docs
   */
  generateAppDataDoc(params?: GenerateAppDataDocParams): LatestAppDataDocVersion {
    const { appDataParams, metadataParams } = params || {}
    const { referrerParams, quoteParams } = metadataParams || {}

    const metadata: latest.Metadata = {}
    if (referrerParams) {
      metadata.referrer = createReferrerMetadata(referrerParams)
    }
    if (quoteParams) {
      metadata.quote = createQuoteMetadata(quoteParams)
    }

    const appCode = appDataParams?.appCode || DEFAULT_APP_CODE
    return createAppDataDoc({ ...appDataParams, appCode, metadata })
  }

  /**
   * Wrapper around @cowprotocol/app-data getAppDataSchema
   *
   * Returns the appData schema for given version, if any
   * Throws CowError when version doesn't exist
   */
  async getAppDataSchema(version: string): Promise<AnyAppDataDocVersion> {
    try {
      return await getAppDataSchema(version)
    } catch (e) {
      // Wrapping @cowprotocol/app-data Error into CowError
      const error = e as Error
      throw new CowError(error.message)
    }
  }

  /**
   * Wrapper around @cowprotocol/app-data validateAppDataDoc
   *
   * Validates given doc against the doc's own version
   */
  async validateAppDataDoc(appDataDoc: AnyAppDataDocVersion): ReturnType<typeof validateAppDataDoc> {
    try {
      return await validateAppDataDoc(appDataDoc)
    } catch (e) {
      // Wrapping @cowprotocol/app-data Error into CowError
      const error = e as Error
      throw new CowError(error.message)
    }
  }

  async decodeAppData(hash: string): Promise<void | AnyAppDataDocVersion> {
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
  async calculateAppDataHash(appData: AnyAppDataDocVersion): Promise<IpfsHashInfo | void> {
    const validation = await this.validateAppDataDoc(appData)
    if (!validation?.success) {
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

  async uploadMetadataDocToIpfs(appDataDoc: AnyAppDataDocVersion): Promise<string | void> {
    const { IpfsHash } = await pinJSONToIPFS(appDataDoc, this.context.ipfs)
    return this.cidToAppDataHex(IpfsHash)
  }
}
