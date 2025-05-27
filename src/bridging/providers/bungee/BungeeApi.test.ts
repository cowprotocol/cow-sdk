// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('BungeeApi', () => {
  // let api: BungeeApi

  beforeEach(() => {
    // api = new BungeeApi()
    mockFetch.mockClear()
  })

  describe('', () => {
    it('', () => {})
  })
})
