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
 * - cid is the IPFS identifier of the appDataHex. If the document is in IPFS it can be found using this identifier.
 */
export async function getAppDataInfo(appData: AnyAppDataDocVersion): Promise<AppDataInfo>

/**
 * Calculate the app-data information (cid, appDataHex, appDataContent).
 *
 * - appDataContent is the exact string with the pre-image that gets hashed using keccak to get the appDataHex
 * - appDataHex is the hex used for the bytes32 struct field appData in the CoW order
 * - cid is the IPFS identifier of the appDataHex. If the document is in IPFS it can be found using this identifier.
 */
export async function getAppDataInfo(fullAppData: string): Promise<AppDataInfo | undefined>

/**
 * Calculate the app-data information (cid, appDataHex, appDataContent).
 *
 * - appDataContent is the exact string with the pre-image that gets hashed using keccak to get the appDataHex
 * - appDataHex is the hex used for the bytes32 struct field appData in the CoW order
 * - cid is the IPFS identifier of the appDataHex. If the document is in IPFS it can be found using this identifier.
 */
export async function getAppDataInfo(appDataAux: AnyAppDataDocVersion | string): Promise<AppDataInfo> {
  return _appDataToCidAux(appDataAux, _appDataToCid)
}

/**
 * Gets the appDataInfo using the legacy method (IPFS CID has different hashing algorithm, this hashing algorithm is not used anymore by CoW Protocol)
 *
 *
 * @deprecated Please use getAppDataInfo instead
 *
 * @param appData JSON document which will be stringified in a deterministic way to calculate the IPFS hash
 */
export async function getAppDataInfoLegacy(appData: AnyAppDataDocVersion): Promise<AppDataInfo | undefined>

/**
 * Calculates appDataHex without publishing file to IPFS
 *
 * This method is intended to quickly generate the appDataHex independent
 * of IPFS upload/pinning
 *
 * @deprecated Please use getAppDataInfo instead
 *
 * @param fullAppData JSON string with the full appData document
 */
export async function getAppDataInfoLegacy(fullAppData: string): Promise<AppDataInfo | undefined>

/**
 * Gets the appDataInfo using the legacy method (IPFS CID has different hashing algorithm, this hashing algorithm is not used anymore by CoW Protocol)
 *
 * @deprecated @deprecated Please use getAppDataInfo instead
 *
 * @param appDataAux
 * @returns
 */
export async function getAppDataInfoLegacy(
  appDataAux: AnyAppDataDocVersion | string,
): Promise<AppDataInfo | undefined> {
  // For the legacy-mode we use plain JSON.stringify to maintain backwards compatibility, however this is not a good idea to do since JSON.stringify. Better specify the doc as a fullAppData string or use stringifyDeterministic
  const fullAppData = JSON.stringify(appDataAux)
  return _appDataToCidAux(fullAppData, _appDataToCidLegacy)
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
 * Derive the IPFS CID v0 from the full appData JSON content
 *
 * @param fullAppDataJson string with the full AppData in JSON format. It is a string to make the hashing deterministic (do not rely on stringification of objects)
 * @returns the IPFS CID v0 of the content
 */
async function _appDataToCid(fullAppDataJson: string): Promise<string> {
  const adapter = getGlobalAdapter()
  const appDataHex = adapter.utils.keccak256(adapter.utils.toUtf8Bytes(fullAppDataJson))
  return appDataHexToCid(appDataHex)
}

/**
 * Derive CID using legacy method
 *
 * @param doc App data document or JSON string
 * @returns IPFS CID
 */
export async function _appDataToCidLegacy(doc: AnyAppDataDocVersion | string): Promise<string> {
  const fullAppData = typeof doc === 'string' ? doc : await stringifyDeterministic(doc as Record<string, unknown>)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { of } = await import('ipfs-only-hash')
  return of(fullAppData, { cidVersion: 0 })
}
