import Ajv, { ErrorObject, ValidateFunction } from 'ajv'
import CID from 'cids'
import fetch from 'cross-fetch'
import multihashes from 'multihashes'
import { fromHexString } from './common'
import { DEFAULT_IPFS_URI } from '../constants'

let validate: ValidateFunction | undefined
let ajv: Ajv

interface ValidationResult {
  result: boolean
  errors?: ErrorObject[]
}

async function getValidator(): Promise<{ ajv: Ajv; validate: ValidateFunction }> {
  if (!ajv) {
    ajv = new Ajv()
  }

  if (!validate) {
    const appDataSchema = await import('../schemas/appData.schema.json')
    validate = ajv.compile(appDataSchema)
  }

  return { ajv, validate }
}

function buildCidInstance(hash: string) {
  const cidVersion = 0x1 //.toString(16) //cidv1
  const codec = 0x70 //.toString(16) //dag-pb
  const type = 0x12 //.toString(16) //sha2-256
  const length = 32 //.toString(16) //256 bits
  const _hash = hash.replace(/(^0x)/, '')

  const hexHash = fromHexString(_hash)

  if (!hexHash) return

  const uint8array = Uint8Array.from([cidVersion, codec, type, length, ...hexHash])

  return new CID(uint8array)
}

async function loadIpfsFromCid(cid: string) {
  const response = await fetch(`${DEFAULT_IPFS_URI}/${cid}`)

  return await response.json()
}

export async function validateAppDataDocument(appDataDocument: unknown): Promise<ValidationResult> {
  const { ajv, validate } = await getValidator()
  const result = !!validate(appDataDocument)

  return {
    result,
    errors: ajv.errors ?? undefined,
  }
}

export async function decodeAppData(hash: string) {
  const cid = buildCidInstance(hash)
  if (!cid) return
  let cidV0
  try {
    cidV0 = cid.toV0().toString()
  } catch (e) {
    console.error(`Not able to extract CIDv0 from hash '${hash}'`, e)
    return
  }

  try {
    return await loadIpfsFromCid(cidV0)
  } catch (e) {
    console.error(`Failed to fetch data from IPFS for CIDv0 ${cidV0} (hash ${hash})`, e)
  }
}

export function decodeMultihash(ipfsHash: string): string {
  const { digest } = multihashes.decode(new CID(ipfsHash).multihash)
  return `0x${Buffer.from(digest).toString('hex')}`
}
