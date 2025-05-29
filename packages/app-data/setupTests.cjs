global.fetchMock = require('jest-fetch-mock')

global.window = global

fetchMock.enableMocks()

jest.setMock('cross-fetch', fetchMock)
