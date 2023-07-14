jest.mock('cross-fetch', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetchMock = require('jest-fetch-mock')
  // Require the original module to not be mocked...
  const originalFetch = jest.requireActual('cross-fetch')
  return {
    __esModule: true,
    ...originalFetch,
    default: fetchMock,
  }
})

import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { TWAP } from './types/twap'
import { TWAP_PARAMS_TEST } from './types/twap.spec'
import { Multiplexer } from './multiplexer'
import { SupportedChainId } from '../common'

enableFetchMocks()

describe('Multiplexer (ComposableCoW)', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Serde: can serialize and deserialize', () => {
    // Register the TWAP handler
    Multiplexer.registerOrderType('TWAP', TWAP)

    // Create a new multiplexer, add a TWAP order
    const m = new Multiplexer(SupportedChainId.GNOSIS_CHAIN)
    m.add(TWAP.default(TWAP_PARAMS_TEST))

    // Get an order from the multiplexer
    const orderBefore = m.getByIndex(0)
    const orderId = orderBefore.id

    // Serialize the multiplexer
    const serialized = m.toJSON()

    // Deserialize the multiplexer
    const m2 = Multiplexer.fromJSON(serialized)

    // Get an order from the deserialized multiplexer
    const orderAfter = m2.getById(orderId)

    // Compare the two orders
    expect(orderBefore).toEqual(orderAfter)
  })
})
