import { APP_DATA_DOC_CUSTOM, APP_DATA_HEX_LEGACY, CID_LEGACY } from '../mocks'
import { fetchDocFromAppDataHex, fetchDocFromAppDataHexLegacy } from './fetchDocFromAppData'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import fetchMock from 'jest-fetch-mock'
import { appDataHexToCidLegacy } from './appDataHexToCid'
import { fetchDocFromCid } from './fetchDocFromCid'
import { createAdapters } from '../../test/setup'

fetchMock.enableMocks()

// Mock the modules
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

describe('fetchDocFromAppData', () => {
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

  test('Decodes appData', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const appDataDoc = await fetchDocFromAppDataHexLegacy(APP_DATA_HEX_LEGACY)
      results.push(appDataDoc)
    }

    results.forEach((appDataDoc) => {
      expect(appDataHexToCidLegacy).toHaveBeenCalledWith(APP_DATA_HEX_LEGACY)
      expect(fetchDocFromCid).toHaveBeenCalledWith(CID_LEGACY, undefined)
      expect(appDataDoc).toEqual(APP_DATA_DOC_CUSTOM)
    })
  })

  test('Throws with wrong hash format', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const promise = fetchDocFromAppDataHex('invalidHash')
      await expect(promise).rejects.toThrow(/Error decoding AppData:/)
    }
  })
})
