jest.mock('../api', () => {
  return {
    OrderBookApi: class MockedOrderBookApi {
      getOrder = mockGetOrder
    },
  }
})

export const mockGetOrder = jest.fn()
