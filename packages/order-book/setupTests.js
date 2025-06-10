jest.mock('cross-fetch', () => {
  const fetchMock = require('jest-fetch-mock')

  const originalFetch = jest.requireActual('cross-fetch')

  return {
    __esModule: true,
    ...originalFetch,
    default: fetchMock,
  }
})

global.window = global
