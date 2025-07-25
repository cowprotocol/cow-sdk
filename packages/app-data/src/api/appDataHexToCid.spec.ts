import { APP_DATA_HEX, APP_DATA_HEX_LEGACY, CID, CID_LEGACY } from '../mocks'
import { appDataHexToCid, appDataHexToCidLegacy } from './appDataHexToCid'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../test/setup'

jest.mock('multiformats/bases/base16', () => ({
  base16: {
    encode: jest.fn().mockReturnValue(CID),
  },
}))

jest.mock('multiformats/cid', () => ({
  CID: {
    decode: jest.fn().mockImplementation(() => ({
      toV0: () => ({
        toString: () => CID_LEGACY,
      }),
    })),
  },
}))

describe('appDataHexToCid', () => {
  let adapters: ReturnType<typeof createAdapters>

  beforeAll(() => {
    adapters = createAdapters()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Happy path', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const decodedAppDataHex = await appDataHexToCid(APP_DATA_HEX)
      expect(decodedAppDataHex).toEqual(CID)
    }
  })

  test('Throws with wrong hash format', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const promise = appDataHexToCid('invalidHash')
      await expect(promise).rejects.toThrow()
    }
  })
})

describe('appDataHexToCidLegacy', () => {
  let adapters: ReturnType<typeof createAdapters>

  beforeAll(() => {
    adapters = createAdapters()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Happy path', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const decodedAppDataHex = await appDataHexToCidLegacy(APP_DATA_HEX_LEGACY)
      expect(decodedAppDataHex).toEqual(CID_LEGACY)
    }
  })

  test('Throws with wrong hash format', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const promise = appDataHexToCidLegacy('invalidHash')
      await expect(promise).rejects.toThrow()
    }
  })
})
