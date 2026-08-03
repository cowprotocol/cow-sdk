import { getGlobalAdapter } from '@cowprotocol/sdk-common'
import { MetaDataError } from '../consts'
import { AnyAppDataDocVersion } from '../generatedTypes'
import { AppDataInfo } from '../types'
import { extractDigest } from '../utils/ipfs'
import { stringifyDeterministic } from '../utils/stringify'
import { appDataHexToCid } from './appDataHexToCid'
import { validateAppDataDoc } from './validateAppDataDoc'

/**
 * Calculate the app-data information (cid, appDataHex, appDataContent).
 *
 * - appDataContent is the exact string with the pre-image that gets hashed using keccak to get the appDataHex
 * - appDataHex is the hex used for the bytes32 struct field appData in the CoW order
 * - cid is the appDataHex re-encoded as a CIDv1 (raw codec, keccak-256), derived locally
 */
export async function getAppDataInfo(appData: AnyAppDataDocVersion): Promise<AppDataInfo>

/**
 * Calculate the app-data information (cid, appDataHex, appDataContent).
 *
 * - appDataContent is the exact string with the pre-image that gets hashed using keccak to get the appDataHex
 * - appDataHex is the hex used for the bytes32 struct field appData in the CoW order
 * - cid is the appDataHex re-encoded as a CIDv1 (raw codec, keccak-256), derived locally
 */
export async function getAppDataInfo(fullAppData: string): Promise<AppDataInfo | undefined>

/**
 * Calculate the app-data information (cid, appDataHex, appDataContent).
 *
 * - appDataContent is the exact string with the pre-image that gets hashed using keccak to get the appDataHex
 * - appDataHex is the hex used for the bytes32 struct field appData in the CoW order
 * - cid is the appDataHex re-encoded as a CIDv1 (raw codec, keccak-256), derived locally
 */
export async function getAppDataInfo(appDataAux: AnyAppDataDocVersion | string): Promise<AppDataInfo> {
  return _appDataToCidAux(appDataAux, _appDataToCid)
}

export async function _appDataToCidAux(
  appDataAux: AnyAppDataDocVersion | string,
  deriveCid: (fullAppData: string) => Promise<string>,
): Promise<AppDataInfo> {
  const [appDataDoc, fullAppData] =
    typeof appDataAux === 'string'
      ? [JSON.parse(appDataAux), appDataAux]
      : [appDataAux, await stringifyDeterministic(appDataAux as Record<string, unknown>)]

  const validation = await validateAppDataDoc(appDataDoc)

  if (!validation?.success) {
    throw new MetaDataError(`Invalid appData provided: ${validation?.errors}`)
  }

  try {
    const cid = await deriveCid(fullAppData)
    const appDataHex = await extractDigest(cid)

    if (!appDataHex) {
      throw new MetaDataError(`Could not extract appDataHex from calculated cid ${cid}`)
    }

    return { cid, appDataHex, appDataContent: fullAppData }
  } catch (e) {
    const error = e as MetaDataError
    console.error('Failed to calculate appDataHex', error)
    throw new MetaDataError(`Failed to calculate appDataHex: ${error.message}`)
  }
}

/**
 * Derive the CID v1 from the full appData JSON content
 *
 * @param fullAppDataJson string with the full AppData in JSON format. It is a string to make the hashing deterministic (do not rely on stringification of objects)
 * @returns the CID v1 of the content
 */
async function _appDataToCid(fullAppDataJson: string): Promise<string> {
  const adapter = getGlobalAdapter()
  const appDataHex = adapter.utils.keccak256(adapter.utils.toUtf8Bytes(fullAppDataJson))
  return appDataHexToCid(appDataHex)
}
