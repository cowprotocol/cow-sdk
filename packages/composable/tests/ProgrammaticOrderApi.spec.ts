import { SupportedChainId } from '@cowprotocol/sdk-config'

import { ProgrammaticOrderApi, type TwapOrder } from '../src'

const EOA = '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3'
const SAFE = '0xaA248D5328c7D781a96D93d7D013bcF393157bB4'

describe('ProgrammaticOrderApi', () => {
  it('lists all known EOA TWAPs from the live programmatic orders API', async () => {
    const progress: TwapOrder[] = []
    const orders = await new ProgrammaticOrderApi().getTwapOrders({
      resolvedOwner: EOA,
      chainId: SupportedChainId.GNOSIS_CHAIN,
      onProgress: (order) => progress.push(order),
    })

    expect(progress).toEqual(orders)
    expect(orders).toMatchSnapshot()
  }, 30_000)

  it('lists all known Safe TWAPs from the live programmatic orders API', async () => {
    const orders = await new ProgrammaticOrderApi().getTwapOrders({
      resolvedOwner: SAFE,
      chainId: SupportedChainId.GNOSIS_CHAIN,
    })

    expect(orders).toMatchSnapshot()
  }, 30_000)
})
