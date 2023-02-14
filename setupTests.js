import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

jest.setMock('cross-fetch', fetchMock)

global.window = global
