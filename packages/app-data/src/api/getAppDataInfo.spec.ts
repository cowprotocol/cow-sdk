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
import { AbstractProviderAdapter } from '@cowprotocol/sdk-common'

// Create a mock adapter
const mockAdapter: Partial<AbstractProviderAdapter> = {
  utils: {
    arrayify: () => new Uint8Array([1, 2, 3, 4]),
    keccak256: () => APP_DATA_HEX,
    toUtf8Bytes: () => new Uint8Array([1, 2, 3, 4]),
  },
}

// Mock modules
jest.mock('@cowprotocol/sdk-common', () => {
  const original = jest.requireActual('@cowprotocol/sdk-common')
  return {
    ...original,
    getGlobalAdapter: jest.fn(() => mockAdapter),
  }
})

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

describe('getAppDataInfo', () => {
  test('Happy path with fullAppData string', async () => {
    // Setup mock for this test
    const { stringifyDeterministic } = require('../utils/stringify')
    stringifyDeterministic.mockResolvedValueOnce(APP_DATA_STRING)

    // when
    const result = await getAppDataInfo(APP_DATA_STRING)

    // then
    expect(result).not.toBeFalsy()
    expect(result).toEqual({ cid: CID, appDataHex: APP_DATA_HEX, appDataContent: APP_DATA_STRING })
  })

  test('Happy path with appData doc', async () => {
    // Setup mocks for this test
    const { stringifyDeterministic } = require('../utils/stringify')
    stringifyDeterministic.mockResolvedValueOnce(APP_DATA_STRING)

    // when
    const result = await getAppDataInfo(APP_DATA_DOC)

    // then
    expect(result).not.toBeFalsy()
    expect(result).toEqual({
      cid: CID,
      appDataHex: APP_DATA_HEX,
      appDataContent: APP_DATA_STRING,
    })
  })

  test('Happy path with appData doc 2', async () => {
    // Setup mocks for this test
    const { stringifyDeterministic } = require('../utils/stringify')
    stringifyDeterministic.mockResolvedValueOnce(APP_DATA_STRING_2)
    const { appDataHexToCid } = require('./appDataHexToCid')
    appDataHexToCid.mockResolvedValueOnce(CID_2)
    const { extractDigest } = require('../utils/ipfs')
    extractDigest.mockReturnValueOnce(APP_DATA_HEX_2)

    // when
    const result = await getAppDataInfo(APP_DATA_STRING_2)

    // then
    expect(result).not.toBeFalsy()
    expect(result).toEqual({ cid: CID_2, appDataHex: APP_DATA_HEX_2, appDataContent: APP_DATA_STRING_2 })
  })

  test('Throws with invalid appDoc', async () => {
    // given
    const doc = {
      ...APP_DATA_DOC,
      metadata: { quote: { sellAmount: 'fsdfas', buyAmount: '41231', version: '0.1.0' } },
    }

    // when
    const promise = getAppDataInfo(doc)

    // then
    await expect(promise).rejects.toThrow('Invalid appData provided')
  })
})

describe('getAppDataInfoLegacy', () => {
  test('Happy path', async () => {
    // Mock JSON.stringify
    const originalStringify = JSON.stringify
    global.JSON.stringify = jest.fn().mockReturnValue(APP_DATA_STRING)

    // Setup mocks for this test
    const ipfsOnlyHash = require('ipfs-only-hash')
    ipfsOnlyHash.of.mockReturnValueOnce(CID_LEGACY)
    const { extractDigest } = require('../utils/ipfs')
    extractDigest.mockReturnValueOnce(APP_DATA_HEX_LEGACY)

    // when
    const result = await getAppDataInfoLegacy(APP_DATA_DOC)

    // then
    expect(result).not.toBeFalsy()
    expect(result).toEqual({
      cid: CID_LEGACY,
      appDataHex: APP_DATA_HEX_LEGACY,
      appDataContent: APP_DATA_STRING,
    })

    // Restore JSON.stringify
    global.JSON.stringify = originalStringify
  })

  test('Throws with invalid appDoc', async () => {
    // given
    const doc = {
      ...APP_DATA_DOC,
      metadata: { quote: { sellAmount: 'fsdfas', buyAmount: '41231', version: '0.1.0' } },
    }

    // when
    const promise = getAppDataInfoLegacy(doc)

    // then
    await expect(promise).rejects.toThrow('Invalid appData provided')
  })
})
