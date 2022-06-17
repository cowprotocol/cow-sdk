import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import BaseApi from '.'
import { SupportedChainId } from '../../constants/chains'
import { Context } from '../../utils/context'

enableFetchMocks()

beforeEach(() => {
  fetchMock.resetMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

const MOCK_URLS = {
  [SupportedChainId.MAINNET]: 'https://funinthesun.com',
  [SupportedChainId.RINKEBY]: 'https://funinthesun.com',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://funinthesun.com',
}

test('Valid: DEFAULT_HEADERS returns the correct headers', async () => {
  const baseApi = new BaseApi({
    context: new Context(SupportedChainId.MAINNET, { appDataHash: '123' }),
    name: 'BASE_API',
    baseUrl: MOCK_URLS,
  })
  const headers = baseApi.DEFAULT_HEADERS
  expect(headers).toEqual({
    'Content-Type': 'application/json',
    'X-AppId': '123',
  })
})
