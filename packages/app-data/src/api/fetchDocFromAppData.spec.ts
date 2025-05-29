import { APP_DATA_DOC_CUSTOM, APP_DATA_HEX_LEGACY, CID_LEGACY } from '../mocks'
import { fetchDocFromAppDataHex, fetchDocFromAppDataHexLegacy } from './fetchDocFromAppData'
import { AbstractProviderAdapter } from '@cowprotocol/sdk-common'
import fetchMock from 'jest-fetch-mock'
import { appDataHexToCidLegacy } from './appDataHexToCid'
import { fetchDocFromCid } from './fetchDocFromCid'

fetchMock.enableMocks()

// Create a mock adapter
const mockAdapter: Partial<AbstractProviderAdapter> = {
  utils: {
    arrayify: () => new Uint8Array([1, 2, 3, 4]),
    keccak256: () => '0x12345678',
    toUtf8Bytes: () => new Uint8Array([1, 2, 3, 4]),
  },
}

// Mock the modules
jest.mock('@cowprotocol/sdk-common', () => {
  const original = jest.requireActual('@cowprotocol/sdk-common')
  return {
    ...original,
    getGlobalAdapter: jest.fn(() => mockAdapter),
  }
})

jest.mock('./appDataHexToCid', () => ({
  appDataHexToCid: jest.fn(async (hash) => {
    if (hash === 'invalidHash') {
      throw new Error('Invalid hash format')
    }
    return 'valid-cid'
  }),
  appDataHexToCidLegacy: jest.fn(async () => CID_LEGACY),
}))

jest.mock('./fetchDocFromCid', () => ({
  fetchDocFromCid: jest.fn(async (cid) => {
    if (cid === CID_LEGACY) {
      return APP_DATA_DOC_CUSTOM
    }
    return {}
  }),
}))

beforeEach(() => {
  fetchMock.resetMocks()
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('fetchDocFromAppData', () => {
  test('Decodes appData', async () => {
    // when
    const appDataDoc = await fetchDocFromAppDataHexLegacy(APP_DATA_HEX_LEGACY)

    // then
    expect(appDataHexToCidLegacy).toHaveBeenCalledWith(APP_DATA_HEX_LEGACY)
    expect(fetchDocFromCid).toHaveBeenCalledWith(CID_LEGACY, undefined)
    expect(appDataDoc).toEqual(APP_DATA_DOC_CUSTOM)
  })

  test('Throws with wrong hash format', async () => {
    // when
    const promise = fetchDocFromAppDataHex('invalidHash')

    // then
    await expect(promise).rejects.toThrow(/Error decoding AppData:/)
  })
})
