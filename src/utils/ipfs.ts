import { Ipfs } from './context'

type PinataPinResponse = {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

export async function pinJSONToIPFS(file: any, { uri, apiKey = '', apiSecret = '' }: Ipfs): Promise<PinataPinResponse> {
  const body = JSON.stringify({
    pinataContent: file,
    pinataMetadata: { name: 'appData-affiliate' },
  })

  const pinataUrl = `${uri}/pinning/pinJSONToIPFS`

  const headers = new Headers({
    'Content-Type': 'application/json',
    pinata_api_key: apiKey,
    pinata_secret_api_key: apiSecret,
  })

  const request = new Request(pinataUrl, {
    method: 'POST',
    headers,
    body,
  })

  const response = await fetch(request)
  const data = await response.json()

  if (response.status !== 200) {
    throw new Error(data.error.details || data.error)
  }

  return data
}
