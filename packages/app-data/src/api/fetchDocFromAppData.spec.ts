import { APP_DATA_DOC_CUSTOM, APP_DATA_HEX, CID } from '../mocks'
import { fetchDocFromAppDataHex } from './fetchDocFromAppData'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import fetchMock from 'jest-fetch-mock'
import { appDataHexToCid } from './appDataHexToCid'
import { fetchDocFromCid } from './fetchDocFromCid'
import { createAdapters } from '../../test/setup'

fetchMock.enableMocks()

// Mock the modules
jest.mock('./appDataHexToCid', () => ({
  appDataHexToCid: jest.fn(async (hash) => {
    if (hash === 'invalidHash') {
      throw new Error('Invalid hash format')
    }
    return CID
  }),
}))

jest.mock('./fetchDocFromCid', () => ({
  fetchDocFromCid: jest.fn(async (cid) => {
    if (cid === CID) {
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
      const appDataDoc = await fetchDocFromAppDataHex(APP_DATA_HEX)
      results.push(appDataDoc)
    }

    results.forEach((appDataDoc) => {
      expect(appDataHexToCid).toHaveBeenCalledWith(APP_DATA_HEX)
      expect(fetchDocFromCid).toHaveBeenCalledWith(CID, undefined)
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
