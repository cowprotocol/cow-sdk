import fetchMock from 'jest-fetch-mock'

jest.setMock('cross-fetch', fetchMock)
jest.setMock('loglevel', { debug: jest.fn(), error: jest.fn() })
