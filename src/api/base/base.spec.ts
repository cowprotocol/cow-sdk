import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { CowSdk } from '../../CowSdk'

enableFetchMocks()

beforeEach(() => {
  fetchMock.resetMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('Valid: DEFAULT_HEADERS returns the correct headers', async () => {
  const appDataHash = '0x123TESTEST'
  const cowSdk = new CowSdk(1, { appDataHash })
  const headers = cowSdk.cowApi.DEFAULT_HEADERS
  expect(headers).toEqual({
    'Content-Type': 'application/json',
    'X-AppId': '0x123TESTEST',
  })
})
