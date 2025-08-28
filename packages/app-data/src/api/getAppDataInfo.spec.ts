/* eslint-disable @typescript-eslint/no-require-imports */
import fetchMock from 'jest-fetch-mock'
import {
  APP_DATA_DOC,
  APP_DATA_HEX,
  APP_DATA_HEX_2,
  APP_DATA_HEX_LEGACY,
  APP_DATA_STRING,
  APP_DATA_STRING_2,
  CID,
  CID_2,
  CID_LEGACY,
} from '../mocks'
import { getAppDataInfo, getAppDataInfoLegacy } from './getAppDataInfo'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../test/setup'

// Mock modules
jest.mock('./validateAppDataDoc', () => ({
  validateAppDataDoc: jest.fn((appDataDoc) => {
    // Check if it's the invalid doc we're testing
    if (appDataDoc?.metadata?.quote?.sellAmount === 'fsdfas') {
      return { success: false, errors: 'Test validation error' }
    }
    // Otherwise return success
    return { success: true }
  }),
}))

jest.mock('./appDataHexToCid', () => ({
  appDataHexToCid: jest.fn().mockImplementation(async () => CID),
}))

jest.mock('../utils/ipfs', () => ({
  extractDigest: jest.fn().mockImplementation(() => APP_DATA_HEX),
}))

jest.mock('../utils/stringify', () => ({
  stringifyDeterministic: jest.fn().mockResolvedValue(APP_DATA_STRING),
}))

// Mock ipfs-only-hash for legacy CID generation
jest.mock(
  'ipfs-only-hash',
  () => ({
    of: jest.fn().mockReturnValue(CID_LEGACY),
  }),
  { virtual: true },
)

describe('getAppDataInfo', () => {
  let adapters: ReturnType<typeof createAdapters>

  beforeAll(() => {
    adapters = createAdapters()
  })

  beforeEach(() => {
    fetchMock.resetMocks()
    jest.clearAllMocks()

    // Update mock return values for specific tests
    const { extractDigest } = require('../utils/ipfs')
    extractDigest.mockImplementation((cid: string) => {
      if (cid === CID) return APP_DATA_HEX
      if (cid === CID_2) return APP_DATA_HEX_2
      if (cid === CID_LEGACY) return APP_DATA_HEX_LEGACY
      return APP_DATA_HEX
    })

    const { appDataHexToCid } = require('./appDataHexToCid')
    appDataHexToCid.mockImplementation(async (hex: string) => {
      if (hex === APP_DATA_HEX) return CID
      if (hex === APP_DATA_HEX_2) return CID_2
      return CID
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Happy path with fullAppData string', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      // Setup mock for this test
      const { stringifyDeterministic } = require('../utils/stringify')
      stringifyDeterministic.mockResolvedValueOnce(APP_DATA_STRING)

      const result = await getAppDataInfo(APP_DATA_STRING)
      results.push(result)
    }

    results.forEach((result) => {
      expect(result).not.toBeFalsy()
      expect(result).toEqual({ cid: CID, appDataHex: APP_DATA_HEX, appDataContent: APP_DATA_STRING })
    })
  })

  test('Happy path with appData doc', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      // Setup mocks for this test
      const { stringifyDeterministic } = require('../utils/stringify')
      stringifyDeterministic.mockResolvedValueOnce(APP_DATA_STRING)

      const result = await getAppDataInfo(APP_DATA_DOC)
      results.push(result)
    }

    results.forEach((result) => {
      expect(result).not.toBeFalsy()
      expect(result).toEqual({
        cid: CID,
        appDataHex: APP_DATA_HEX,
        appDataContent: APP_DATA_STRING,
      })
    })
  })

  test('Happy path with appData doc 2', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      // Setup mocks for this test
      const { stringifyDeterministic } = require('../utils/stringify')
      stringifyDeterministic.mockResolvedValueOnce(APP_DATA_STRING_2)
      const { appDataHexToCid } = require('./appDataHexToCid')
      appDataHexToCid.mockResolvedValueOnce(CID_2)
      const { extractDigest } = require('../utils/ipfs')
      extractDigest.mockReturnValueOnce(APP_DATA_HEX_2)

      const result = await getAppDataInfo(APP_DATA_STRING_2)
      results.push(result)
    }

    results.forEach((result) => {
      expect(result).not.toBeFalsy()
      expect(result).toEqual({ cid: CID_2, appDataHex: APP_DATA_HEX_2, appDataContent: APP_DATA_STRING_2 })
    })
  })

  test('Throws with invalid appDoc', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const doc = {
      ...APP_DATA_DOC,
      metadata: { quote: { sellAmount: 'fsdfas', buyAmount: '41231', version: '0.1.0' } },
    }

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const promise = getAppDataInfo(doc)
      await expect(promise).rejects.toThrow('Invalid appData provided')
    }
  })
})

describe('getAppDataInfoLegacy', () => {
  let adapters: ReturnType<typeof createAdapters>

  beforeAll(() => {
    adapters = createAdapters()
  })

  beforeEach(() => {
    fetchMock.resetMocks()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Happy path', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      // Mock JSON.stringify
      const originalStringify = JSON.stringify
      global.JSON.stringify = jest.fn().mockReturnValue(APP_DATA_STRING)

      // Setup mocks for this test
      const ipfsOnlyHash = require('ipfs-only-hash')
      ipfsOnlyHash.of.mockReturnValueOnce(CID_LEGACY)
      const { extractDigest } = require('../utils/ipfs')
      extractDigest.mockReturnValueOnce(APP_DATA_HEX_LEGACY)

      const result = await getAppDataInfoLegacy(APP_DATA_DOC)
      results.push(result)

      // Restore JSON.stringify
      global.JSON.stringify = originalStringify
    }

    results.forEach((result) => {
      expect(result).not.toBeFalsy()
      expect(result).toEqual({
        cid: CID_LEGACY,
        appDataHex: APP_DATA_HEX_LEGACY,
        appDataContent: APP_DATA_STRING,
      })
    })
  })

  test('Throws with invalid appDoc', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const doc = {
      ...APP_DATA_DOC,
      metadata: { quote: { sellAmount: 'fsdfas', buyAmount: '41231', version: '0.1.0' } },
    }

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const promise = getAppDataInfoLegacy(doc)
      await expect(promise).rejects.toThrow('Invalid appData provided')
    }
  })
})
