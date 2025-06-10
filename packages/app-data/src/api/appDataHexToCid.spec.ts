import { APP_DATA_HEX, APP_DATA_HEX_LEGACY, CID, CID_LEGACY } from '../mocks'
import { appDataHexToCid, appDataHexToCidLegacy } from './appDataHexToCid'
import { AbstractProviderAdapter, getGlobalAdapter } from '@cowprotocol/sdk-common'

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

const mockAdapter: Partial<AbstractProviderAdapter> = {
  utils: {
    arrayify: (value: string) => {
      if (value === 'invalidHash') {
        throw new Error('Invalid hash format')
      }
      return new Uint8Array([1, 2, 3, 4])
    },
    keccak256: (data: string | Uint8Array) => '0x' + data.toString(),
    toUtf8Bytes: (text: string) => new Uint8Array(Array.from(text).map((c) => c.charCodeAt(0))),
  },
}

// Mock the getGlobalAdapter function
jest.mock('@cowprotocol/sdk-common', () => {
  const original = jest.requireActual('@cowprotocol/sdk-common')
  return {
    ...original,
    getGlobalAdapter: jest.fn(() => mockAdapter),
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('appDataHexToCid', () => {
  test('Happy path', async () => {
    // when
    const decodedAppDataHex = await appDataHexToCid(APP_DATA_HEX)

    // then
    expect(decodedAppDataHex).toEqual(CID)
    // Verify getGlobalAdapter was called
    expect(getGlobalAdapter).toHaveBeenCalled()
  })

  test('Throws with wrong hash format', async () => {
    // Configure mock adapter to throw for invalidHash
    ;(getGlobalAdapter as jest.Mock).mockImplementation(() => ({
      ...mockAdapter,
      getAppDataUtils: () => ({
        arrayify: (value: string) => {
          if (value === 'invalidHash') {
            throw new Error('Invalid hash format')
          }
          return new Uint8Array([1, 2, 3, 4])
        },
        keccak256: (data: string | Uint8Array) => '0x' + data.toString(),
        toUtf8Bytes: (text: string) => new Uint8Array(Array.from(text).map((c) => c.charCodeAt(0))),
      }),
    }))

    // when
    const promise = appDataHexToCid('invalidHash')

    // then
    await expect(promise).rejects.toThrow()
  })
})

describe('appDataHexToCidLegacy', () => {
  test('Happy path', async () => {
    // when
    const decodedAppDataHex = await appDataHexToCidLegacy(APP_DATA_HEX_LEGACY)

    // then
    expect(decodedAppDataHex).toEqual(CID_LEGACY)
    // Verify getGlobalAdapter was called
    expect(getGlobalAdapter).toHaveBeenCalled()
  })

  test('Throws with wrong hash format', async () => {
    // Configure mock adapter to throw for invalidHash
    ;(getGlobalAdapter as jest.Mock).mockImplementation(() => ({
      ...mockAdapter,
      getAppDataUtils: () => ({
        arrayify: (value: string) => {
          if (value === 'invalidHash') {
            throw new Error('Invalid hash format')
          }
          return new Uint8Array([1, 2, 3, 4])
        },
        keccak256: (data: string | Uint8Array) => '0x' + data.toString(),
        toUtf8Bytes: (text: string) => new Uint8Array(Array.from(text).map((c) => c.charCodeAt(0))),
      }),
    }))

    // when
    const promise = appDataHexToCidLegacy('invalidHash')

    // then
    await expect(promise).rejects.toThrow()
  })
})
