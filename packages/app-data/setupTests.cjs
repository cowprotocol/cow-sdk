/* eslint-disable */
const fetchMock = require('jest-fetch-mock')

global.fetchMock = fetchMock
global.window = global

fetchMock.enableMocks()

jest.setMock('cross-fetch', fetchMock)
