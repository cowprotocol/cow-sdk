import { SupportedChainId } from '@cowprotocol/sdk-config'

import { ProgrammaticOrderApi } from '../src'

const EOA = '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3'
const SAFE = '0xaA248D5328c7D781a96D93d7D013bcF393157bB4'

describe('ProgrammaticOrderApi', () => {
  jest.setTimeout(30_000)

  it('lists a completed EOA TWAP window from the live programmatic orders API', async () => {
    const page = await new ProgrammaticOrderApi().getTwapOrders(
      {
        resolvedOwner: EOA,
        chainId: SupportedChainId.GNOSIS_CHAIN,
      },
      { direction: 'asc', offset: 7, limit: 2 },
    )

    expect(page.items).toHaveLength(2)
    expect(page.items.every(({ status }) => status === 'Completed')).toBe(true)
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
      ({ executedAmounts, status }) => status === 'Completed' && executedAmounts.executedFeeAmount > 0n,
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
    expect(page.items.some(({ executedFeeAmount }) => executedFeeAmount !== null)).toBe(true)
    expect(page).toMatchSnapshot()
  })
})
