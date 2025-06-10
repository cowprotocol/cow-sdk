import fetchMock from 'jest-fetch-mock'
import { APP_DATA_HEX, APP_DATA_HEX_2, CID, CID_2 } from '../mocks'
import { cidToAppDataHex } from './cidToAppDataHex'

beforeEach(() => {
  fetchMock.resetMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('cidToAppDataHex', () => {
  test('Happy path', async () => {
    // when
    const result = await cidToAppDataHex(CID)

    // then
    expect(result).not.toBeFalsy()
    expect(result).toEqual(APP_DATA_HEX)
  })

  test('Happy path 2', async () => {
    // when
    const result = await cidToAppDataHex(CID_2)

    // then
    expect(result).not.toBeFalsy()
    expect(result).toEqual(APP_DATA_HEX_2)
  })

  test('Malformed CID', async () => {
    // when
    const promise = cidToAppDataHex('invalidCid')

    // then
    expect(promise).rejects.toThrow()
  })
})
