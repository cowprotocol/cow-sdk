import { fromHexString } from './common'
import { DEFAULT_IPFS_READ_URI } from '../constants'
import { AnyAppDataDocVersion } from '../types'

export async function getSerializedCID(hash: string): Promise<void | string> {
  const cidVersion = 0x1 //cidv1
  const codec = 0x70 //dag-pb
  const type = 0x12 //sha2-256
  const length = 32 //256 bits
  const _hash = hash.replace(/(^0x)/, '')

  const hexHash = fromHexString(_hash)

  if (!hexHash) return

  const uint8array = Uint8Array.from([cidVersion, codec, type, length, ...hexHash])
  const { CID } = await import('multiformats/cid')
  return CID.decode(uint8array).toV0().toString()
}

export async function loadIpfsFromCid(cid: string, ipfsUri = DEFAULT_IPFS_READ_URI): Promise<AnyAppDataDocVersion> {
  const { default: fetch } = await import('cross-fetch')
  const response = await fetch(`${ipfsUri}/${cid}`)

  return await response.json()
}
