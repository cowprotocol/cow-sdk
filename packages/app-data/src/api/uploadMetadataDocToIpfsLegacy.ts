import { AnyAppDataDocVersion } from '../generatedTypes'

import { Ipfs } from '../types'
import { DEFAULT_IPFS_WRITE_URI, MetaDataError } from '../consts'
import { extractDigest } from '../utils/ipfs'
import { stringifyDeterministic } from '../utils/stringify'

export interface IpfsUploadResult {
  appData: string
  cid: string
}

/**
 * Uploads a appDocument to IPFS
 *
 * @deprecated Pinata IPFS automatically pins the uploaded document using some implicity encoding and hashing algorithm. This method is not used anymore to make it more explicit these parameters and therefore less depednent on the default impleemntation of Pinata
 *
 * @param appDataDoc Document to upload
 * @param ipfsConfig keys to access the IPFS API
 *
 * @returns the IPFS CID v0 of the content
 */
export async function uploadMetadataDocToIpfsLegacy(
  appDataDoc: AnyAppDataDocVersion,
  ipfsConfig: Ipfs
): Promise<IpfsUploadResult | void> {
  const { IpfsHash: cid } = await _pinJsonInPinataIpfs(appDataDoc, ipfsConfig)

  return {
    appData: await extractDigest(cid),
    cid,
  }
}

type PinataPinResponse = {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

export async function _pinJsonInPinataIpfs(
  file: unknown,
  { writeUri = DEFAULT_IPFS_WRITE_URI, pinataApiKey = '', pinataApiSecret = '' }: Ipfs
): Promise<PinataPinResponse> {
  const { default: fetch } = await import('cross-fetch')

  if (!pinataApiKey || !pinataApiSecret) {
    throw new MetaDataError('You need to pass IPFS api credentials.')
  }

  const body = await stringifyDeterministic({
    pinataContent: file,
    pinataMetadata: { name: 'appData' },
  })

  const pinataUrl = `${writeUri}/pinning/pinJSONToIPFS`
  const response = await fetch(pinataUrl, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataApiSecret,
    },
  })

  const data = await response.json()

  if (response.status !== 200) {
    throw new Error(data.error.details || data.error)
  }

  return data
}
