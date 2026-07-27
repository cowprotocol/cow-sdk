import { AbstractProviderAdapter, setGlobalAdapter } from '@cowprotocol/sdk-common'
import { appDataHexToCid } from './appDataHexToCid'
import { cidToAppDataHex } from './cidToAppDataHex'
import { fetchDocFromAppDataHex } from './fetchDocFromAppData'

import { generateAppDataDoc } from './generateAppDataDoc'
import { getAppDataInfo } from './getAppDataInfo'
import { getAppDataSchema } from './getAppDataSchema'
import { validateAppDataDoc } from './validateAppDataDoc'

/**
 * AppDataSdk provides a convenient interface for interacting with CoW Protocol's
 * app-data functionality. It supports both direct method calls and object-oriented usage.
 */
export class AppDataSdk {
  /**
   * Creates a new MetadataApi instance
   *
   * @param adapter Provider adapter implementation
   */
  constructor(adapter?: AbstractProviderAdapter) {
    if (adapter) {
      setGlobalAdapter(adapter)
    }
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
}

/**
 * @deprecated use AppDataSdk instead
 * The class exists for backward compatibility only and should be deleted in the future
 */
export class MetadataApi extends AppDataSdk {}
