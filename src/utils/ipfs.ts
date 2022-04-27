import { CowError } from './common'
import { Ipfs } from './context'

type PinataPinResponse = {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

export async function pinJSONToIPFS(
  file: any,
  { uri, pinataApiKey = '', pinataApiSecret = '' }: Ipfs
): Promise<PinataPinResponse> {
  const { default: fetch } = await import('cross-fetch')

  if (!pinataApiKey || !pinataApiSecret) {
    throw new CowError('You need to pass IPFS api credentials.')
  }

  const body = JSON.stringify({
    pinataContent: file,
    pinataMetadata: { name: 'appData-affiliate' },
  })

  const pinataUrl = `${uri}/pinning/pinJSONToIPFS`

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
