import { AbstractProviderAdapter, setGlobalAdapter } from '@cowprotocol/sdk-common'
import { appDataHexToCid, appDataHexToCidLegacy } from './appDataHexToCid'
import { cidToAppDataHex } from './cidToAppDataHex'
import { fetchDocFromAppDataHex, fetchDocFromAppDataHexLegacy } from './fetchDocFromAppData'
import { fetchDocFromCid } from './fetchDocFromCid'

import { generateAppDataDoc } from './generateAppDataDoc'
import { getAppDataInfo, getAppDataInfoLegacy } from './getAppDataInfo'
import { getAppDataSchema } from './getAppDataSchema'
import { uploadMetadataDocToIpfsLegacy } from './uploadMetadataDocToIpfsLegacy'
import { validateAppDataDoc } from './validateAppDataDoc'

/**
 * MetadataApi provides a convenient interface for interacting with CoW Protocol's
 * app-data functionality. It supports both direct method calls and object-oriented usage.
 */
export class MetadataApi {
  /**
   * Creates a new MetadataApi instance
   *
   * @param adapter Provider adapter implementation
   */
  constructor(adapter: AbstractProviderAdapter) {
    setGlobalAdapter(adapter)
  }

  // Schema & Doc generation/validation
  getAppDataSchema = getAppDataSchema
  generateAppDataDoc = generateAppDataDoc
  validateAppDataDoc = validateAppDataDoc

  // appData / CID conversion
  getAppDataInfo = getAppDataInfo // (appData | fullAppData) -->  { cid, appDataHex, appDataContent }
  appDataHexToCid = appDataHexToCid // appDataHex --> cid
  cidToAppDataHex = cidToAppDataHex // cid --> appDataHex

  // Fetch from IPFS
  fetchDocFromAppDataHex = fetchDocFromAppDataHex // appDataHex --> appData

  // Legacy methods
  legacy = {
    // Fetch appData document from IPFS (deprecated)
    fetchDocFromCid: fetchDocFromCid, // cid --> document

    // Upload to IPFS (deprecated)
    uploadMetadataDocToIpfs: uploadMetadataDocToIpfsLegacy, //  appData --> cid + publish IPFS
    appDataToCid: getAppDataInfoLegacy, // (appData | fullAppData) --> cid
    appDataHexToCid: appDataHexToCidLegacy, // appDataHex --> cid
    fetchDocFromAppDataHex: fetchDocFromAppDataHexLegacy, // appDataHex --> appData
  }
}
