import { appDataHexToCid, appDataHexToCidLegacy } from './appDataHexToCid'
import { getAppDataInfo, getAppDataInfoLegacy } from './getAppDataInfo'
import { cidToAppDataHex } from './cidToAppDataHex'
import { fetchDocFromAppDataHex, fetchDocFromAppDataHexLegacy } from './fetchDocFromAppData'
import { fetchDocFromCid } from './fetchDocFromCid'

import { generateAppDataDoc } from './generateAppDataDoc'
import { getAppDataSchema } from './getAppDataSchema'
import { uploadMetadataDocToIpfsLegacy } from './uploadMetadataDocToIpfsLegacy'
import { validateAppDataDoc } from './validateAppDataDoc'

export class MetadataApi {
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
