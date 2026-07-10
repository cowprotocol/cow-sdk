import { DEFAULT_CONDITIONAL_ORDER_REGISTRY, TWAP_ADDRESS } from '../src/index'

describe('package exports', () => {
  it('re-exports core composable APIs from the package entrypoint', async () => {
    const composable = await import('../src/index')

    expect(composable.ConditionalOrder).toBeDefined()
    expect(composable.ConditionalOrderFactory).toBeDefined()
    expect(composable.Multiplexer).toBeDefined()
    expect(composable.Twap).toBeDefined()
  })

  it('exposes the default conditional order registry', () => {
    expect(DEFAULT_CONDITIONAL_ORDER_REGISTRY[TWAP_ADDRESS]).toBeDefined()
  })
})
