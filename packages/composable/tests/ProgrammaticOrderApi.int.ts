import { SupportedChainId } from '@cowprotocol/sdk-config'

import { ProgrammaticOrderApi } from '../src'

const EOA = '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3'
const SAFE = '0xaA248D5328c7D781a96D93d7D013bcF393157bB4'

describe('ProgrammaticOrderApi', () => {
  jest.setTimeout(30_000)

  it('lists deployed CoWSheds for an EOA from the live programmatic orders API', async () => {
    const page = await new ProgrammaticOrderApi().getDeployedCowSheds({ owner: EOA }, { limit: 1000 })

    expect(page.totalCount).toBeGreaterThan(0)
    expect(page.items).toHaveLength(page.totalCount)
    expect(page.items.some(({ chainId }) => chainId === SupportedChainId.GNOSIS_CHAIN)).toBe(true)
    expect(page.items.every(({ address, blockNumber }) => /^0x[0-9a-f]{40}$/.test(address) && blockNumber > 0n)).toBe(true)
  })

  it('lists a completed EOA TWAP window from the live programmatic orders API', async () => {
    const page = await new ProgrammaticOrderApi().getTwapOrders(
      {
        resolvedOwner: EOA,
        chainId: SupportedChainId.GNOSIS_CHAIN,
      },
      { direction: 'asc', offset: 7, limit: 2 },
    )

    expect(page.items).toHaveLength(2)
    expect(page.items.every(({ status }) => status === 'partiallyFilled')).toBe(true)
    expect([...page.items].reverse()).toMatchSnapshot()
  })

  it('lists the latest Safe TWAP parents from the live programmatic orders API', async () => {
    const page = await new ProgrammaticOrderApi().getTwapOrders({
      resolvedOwner: SAFE,
      chainId: SupportedChainId.GNOSIS_CHAIN,
    })

    expect(page.items).toMatchSnapshot()
  })

  it('lists one page of EOA TWAP part orders from the live programmatic orders API', async () => {
    const api = new ProgrammaticOrderApi()
    const parentsPage = await api.getTwapOrders(
      {
        resolvedOwner: EOA,
        chainId: SupportedChainId.GNOSIS_CHAIN,
      },
      { direction: 'asc', offset: 7, limit: 2 },
    )
    const parent = parentsPage.items.find(
      ({ executedAmounts, status }) => status === 'partiallyFilled' && executedAmounts.executedFee > 0n,
    )

    expect(parent).toBeDefined()

    const page = await api.getTwapPartOrders(
      {
        eventId: String(parent?.eventId),
        chainId: SupportedChainId.GNOSIS_CHAIN,
      },
      { direction: 'asc', offset: 0, limit: 10 },
    )

    expect(page.totalCount).toBe(parent?.partOrdersCount)
    expect(page.items.some(({ executedFee }) => executedFee !== null)).toBe(true)
    expect(page).toMatchSnapshot()
  })
})
