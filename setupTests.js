import fetchMock from 'jest-fetch-mock'
import log from 'loglevel'

fetchMock.enableMocks()

jest.setMock('cross-fetch', fetchMock)

global.window = global

log.info = jest.fn
log.debug = jest.fn
log.error = jest.fn
log.setLevel = jest.fn
