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
import { stringifyDeterministic } from '..'

beforeEach(() => {
  fetchMock.resetMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('getAppDataInfo', () => {
  test('Happy path with fullAppData string', async () => {
    // when
    const result = await getAppDataInfo(APP_DATA_STRING)

    // then
    expect(result).not.toBeFalsy()
    expect(result).toEqual({ cid: CID, appDataHex: APP_DATA_HEX, appDataContent: APP_DATA_STRING })
  })

  test('Happy path with appData doc', async () => {
    // when
    const result = await getAppDataInfo(APP_DATA_DOC)

    // then
    expect(result).not.toBeFalsy()
    expect(result).toEqual({
      cid: CID,
      appDataHex: APP_DATA_HEX,
      appDataContent: await stringifyDeterministic(APP_DATA_DOC),
    })
  })

  test('Happy path with appData doc 2 ', async () => {
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
    // when
    const result = await getAppDataInfoLegacy(APP_DATA_DOC)
    // then
    expect(result).not.toBeFalsy()
    expect(result).toEqual({
      cid: CID_LEGACY,
      appDataHex: APP_DATA_HEX_LEGACY,
      appDataContent: JSON.stringify(APP_DATA_DOC), // For the legacy-mode we use plain JSON.stringify to mantain backwards compatibility, however this is not a good idea to do since JSON.stringify. Better specify the doc as a fullAppData string or use stringifyDeterministic
    })
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
