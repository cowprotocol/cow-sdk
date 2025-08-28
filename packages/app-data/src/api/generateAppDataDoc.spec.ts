import fetchMock from 'jest-fetch-mock'
import { APP_DATA_DOC_CUSTOM } from '../mocks'
import { generateAppDataDoc } from './generateAppDataDoc'

beforeEach(() => {
  fetchMock.resetMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('generateAppDataDoc', () => {
  test('Creates appDataDoc with empty metadata ', async () => {
    // when
    const appDataDoc = await generateAppDataDoc({})

    const { metadata, version, appCode, environment } = appDataDoc

    // then
    expect(version).toBeTruthy()
    expect(metadata).toEqual({})
    expect(appCode).toEqual(APP_DATA_DOC_CUSTOM.appCode)
    expect(environment).toBeUndefined()
  })

  test('Creates appDataDoc with custom metadata ', async () => {
    // given
    const { referrer, quote } = APP_DATA_DOC_CUSTOM.metadata
    const params = {
      environment: APP_DATA_DOC_CUSTOM.environment,
      metadata: {
        referrer,
        quote,
      },
    }
    // when
    const appDataDoc = await generateAppDataDoc(params)

    // then
    expect(appDataDoc).toBeTruthy()
    const { metadata, version, appCode, environment } = appDataDoc
    expect(version).toBeTruthy()
    expect(metadata).toEqual(APP_DATA_DOC_CUSTOM.metadata)
    expect(appCode).toEqual(APP_DATA_DOC_CUSTOM.appCode)
    expect(environment).toEqual(APP_DATA_DOC_CUSTOM.environment)
  })
})
