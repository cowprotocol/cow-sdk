import fetchMock from 'jest-fetch-mock'
;(global as any).window = global

fetchMock.enableMocks()

jest.setMock('cross-fetch', fetchMock)
