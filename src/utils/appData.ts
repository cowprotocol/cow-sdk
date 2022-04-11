import Ajv, { ErrorObject, ValidateFunction } from 'ajv'
import { fromHexString } from './common'
import { DEFAULT_IPFS_GATEWAY_URI } from '../constants'
import { AppDataDoc } from '../types'

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

export async function loadIpfsFromCid(cid: string, ipfsUri = DEFAULT_IPFS_GATEWAY_URI): Promise<AppDataDoc> {
  const { default: fetch } = await import('cross-fetch')
  const response = await fetch(`${ipfsUri}/${cid}`)

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
