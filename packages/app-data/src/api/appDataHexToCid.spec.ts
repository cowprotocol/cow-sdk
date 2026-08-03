import { APP_DATA_HEX, CID } from '../mocks'
import { appDataHexToCid } from './appDataHexToCid'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../test/setup'

jest.mock('multiformats/bases/base16', () => ({
  base16: {
    encode: jest.fn().mockReturnValue(CID),
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
