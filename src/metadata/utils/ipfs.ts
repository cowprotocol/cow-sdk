import { CowError } from '../../common/cow-error'
import { AnyAppDataDocVersion } from '../types'
import { DEFAULT_IPFS_WRITE_URI } from '../../common/ipfs'

type PinataPinResponse = {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

export interface Ipfs {
  uri?: string
  writeUri?: string
  readUri?: string
  pinataApiKey?: string
  pinataApiSecret?: string
}

export async function pinJSONToIPFS(
  file: unknown,
  { writeUri = DEFAULT_IPFS_WRITE_URI, pinataApiKey = '', pinataApiSecret = '' }: Ipfs
): Promise<PinataPinResponse> {
  const { default: fetch } = await import('cross-fetch')

  if (!pinataApiKey || !pinataApiSecret) {
    throw new CowError('You need to pass IPFS api credentials.')
  }

  const body = JSON.stringify({
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

export async function calculateIpfsCidV0(doc: AnyAppDataDocVersion): Promise<string> {
  const docString = JSON.stringify(doc)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { of } = await import('ipfs-only-hash')
  return of(docString, { cidVersion: 0 })
}