import * as composable from '../src/index'
import { DEFAULT_CONDITIONAL_ORDER_REGISTRY, TWAP_ADDRESS } from '../src/orderTypes'

describe('package exports', () => {
  it('re-exports core composable APIs from the package entrypoint', () => {
    expect(composable.ConditionalOrder).toBeDefined()
    expect(composable.ConditionalOrderFactory).toBeDefined()
    expect(composable.Multiplexer).toBeDefined()
    expect(composable.Twap).toBeDefined()
  })

  it('exposes the default conditional order registry', () => {
    expect(DEFAULT_CONDITIONAL_ORDER_REGISTRY[TWAP_ADDRESS]).toBeDefined()
  })
})
