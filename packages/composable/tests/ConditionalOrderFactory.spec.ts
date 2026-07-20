import { ConditionalOrderFactory } from '../src/ConditionalOrderFactory'
import { TWAP_ADDRESS, Twap } from '../src/orderTypes/Twap'
import { DEFAULT_CONDITIONAL_ORDER_REGISTRY } from '../src/orderTypes'
import { TWAP_PARAMS_TEST } from './Twap.spec'
import { createAdapters } from './setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

describe('ConditionalOrderFactory', () => {
  const adapters = createAdapters()

  beforeAll(() => {
    setGlobalAdapter(adapters.viemAdapter)
  })

  it('normalizes registry keys to lowercase', () => {
    const factory = new ConditionalOrderFactory({
      [TWAP_ADDRESS.toUpperCase()]: (params) => Twap.fromParams(params),
    })

    expect(factory.knownOrderTypes[TWAP_ADDRESS.toLowerCase()]).toBeDefined()
  })

  it('instantiates a TWAP from params via the default registry', () => {
    const twap = Twap.fromData(TWAP_PARAMS_TEST)
    const factory = new ConditionalOrderFactory(DEFAULT_CONDITIONAL_ORDER_REGISTRY)
    const order = factory.fromParams(twap.leaf)

    expect(order).toBeInstanceOf(Twap)
    expect(order?.id).toBe(twap.id)
  })

  it('uses the provided adapter in the constructor', () => {
    const factory = new ConditionalOrderFactory(DEFAULT_CONDITIONAL_ORDER_REGISTRY, adapters.ethersV5Adapter)

    expect(factory.knownOrderTypes[TWAP_ADDRESS.toLowerCase()]).toBeDefined()
  })

  it('returns undefined for unknown handlers', () => {
    const factory = new ConditionalOrderFactory(DEFAULT_CONDITIONAL_ORDER_REGISTRY)

    expect(
      factory.fromParams({
        handler: '0x0000000000000000000000000000000000000001',
        salt: twapSalt(),
        staticInput: '0x',
      }),
    ).toBeUndefined()
  })
})

function twapSalt(): string {
  return Twap.fromData(TWAP_PARAMS_TEST).salt
}
