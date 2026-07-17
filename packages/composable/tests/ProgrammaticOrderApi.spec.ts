import { SupportedChainId } from '@cowprotocol/sdk-config'

import { ProgrammaticOrderApi } from '../src'

const EOA = '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3'

describe('ProgrammaticOrderApi', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('lists all known EOA TWAPs from the live programmatic orders API', async () => {
    const orders = await new ProgrammaticOrderApi().getTwapOrders({
      owner: EOA,
      chainId: SupportedChainId.GNOSIS_CHAIN,
    })
    const eventIds = orders.map(({ eventId }) => eventId)
    const stableOrders = orders
      .map(({ eventId: _eventId, partOrders, ...order }) => ({
        ...order,
        partOrders: [...partOrders].sort((a, b) => a.orderUid.localeCompare(b.orderUid)),
      }))
      .sort((a, b) => a.hash.localeCompare(b.hash))

    expect(orders).toHaveLength(13)
    expect(eventIds.every((eventId) => eventId.length > 0)).toBe(true)
    expect(new Set(eventIds).size).toBe(13)
    expect(stableOrders).toMatchSnapshot()
  }, 30_000)

  it('surfaces malformed indexer data as an invalid-response error', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            ownerMappings: {
              items: [{ address: 'not-an-address', chainId: 100, owner: EOA }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        }),
        { status: 200 },
      ),
    )

    await expect(
      new ProgrammaticOrderApi().getTwapOrders({ owner: EOA, chainId: SupportedChainId.GNOSIS_CHAIN }),
    ).rejects.toMatchObject({
      name: 'ProgrammaticOrderApiError',
      kind: 'invalid-response',
      message: expect.stringContaining('response.data.ownerMappings.items[0].address'),
    })
  })
})
