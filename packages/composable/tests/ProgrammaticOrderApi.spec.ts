import { SupportedChainId } from '@cowprotocol/sdk-config'

import {
  ProgrammaticOrderApi,
  type GetTwapOrdersParams,
  type GetTwapPartOrdersParams,
  type QueryDirection,
} from '../src'

const EOA = '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3'
const SAFE = '0xaA248D5328c7D781a96D93d7D013bcF393157bB4'

describe('ProgrammaticOrderApi', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('validates parent and part page bounds before requesting', async () => {
    const api = new ProgrammaticOrderApi()

    await expect(
      api.getTwapOrders({ resolvedOwner: EOA, chainId: SupportedChainId.GNOSIS_CHAIN }, { limit: 1001 }),
    ).rejects.toThrow('Invalid value: Expected <=1000 but received 1001')
    await expect(
      api.getTwapOrders({ resolvedOwner: EOA, chainId: SupportedChainId.GNOSIS_CHAIN }, { limit: 0 }),
    ).rejects.toThrow('Invalid value: Expected >=1 but received 0')
    await expect(
      api.getTwapOrders({ resolvedOwner: EOA, chainId: SupportedChainId.GNOSIS_CHAIN }, { limit: 1.5 }),
    ).rejects.toThrow('Invalid safe integer: Received 1.5')
    await expect(
      api.getTwapOrders({ resolvedOwner: EOA, chainId: SupportedChainId.GNOSIS_CHAIN }, { offset: -1 }),
    ).rejects.toThrow('Invalid value: Expected >=0 but received -1')
    await expect(
      api.getTwapOrders(
        { resolvedOwner: EOA, chainId: SupportedChainId.GNOSIS_CHAIN },
        { direction: 'sideways' as QueryDirection },
      ),
    ).rejects.toThrow('Invalid type: Expected ("asc" | "desc") but received "sideways"')
    await expect(
      api.getTwapPartOrders(
        {
          eventId: '',
          chainId: SupportedChainId.GNOSIS_CHAIN,
        },
        { offset: 0, limit: 10 },
      ),
    ).rejects.toThrow('TWAP eventId must not be empty')
    await expect(
      api.getTwapPartOrders(
        {
          eventId: 'event',
          chainId: SupportedChainId.GNOSIS_CHAIN,
        },
        { offset: -1, limit: 10 },
      ),
    ).rejects.toThrow('Invalid value: Expected >=0 but received -1')
  })

  it('validates parent and part params before requesting', async () => {
    const api = new ProgrammaticOrderApi()

    await expect(api.getTwapOrders(undefined as unknown as GetTwapOrdersParams)).rejects.toThrow(
      'Invalid type: Expected Object but received undefined',
    )
    await expect(
      api.getTwapOrders({
        resolvedOwner: 'invalid',
        chainId: SupportedChainId.GNOSIS_CHAIN,
      }),
    ).rejects.toThrow('must be an EVM address')
    await expect(
      api.getTwapOrders({
        resolvedOwner: EOA,
        chainId: 999 as SupportedChainId,
      }),
    ).rejects.toThrow('must be a supported EVM chain')
    await expect(
      api.getTwapPartOrders({
        eventId: '   ',
        chainId: SupportedChainId.GNOSIS_CHAIN,
      }),
    ).rejects.toThrow('TWAP eventId must not be empty')
    await expect(api.getTwapPartOrders(null as unknown as GetTwapPartOrdersParams)).rejects.toThrow(
      'Invalid type: Expected Object but received null',
    )
  })

  it('requests parent-only TWAPs by creation and preserves the returned order', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            twapOrders: {
              items: [twapParent('newer-event', 200), twapParent('older-event', 100)],
              totalCount: 2,
            },
          },
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const page = await new ProgrammaticOrderApi({ apiUrl: 'https://example.com' }).getTwapOrders(
      {
        resolvedOwner: EOA,
        chainId: SupportedChainId.GNOSIS_CHAIN,
      },
      { direction: 'asc', limit: 2, offset: 1 },
    )
    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      query: string
      variables: Record<string, unknown>
    }

    expect(request.query).toContain('orderBy: "eventId"')
    expect(request.query).toContain('orderDirection: $direction')
    expect(request.query).not.toContain('discreteOrders {\n')
    expect(request.variables).toEqual({
      resolvedOwner: EOA.toLowerCase(),
      chainId: SupportedChainId.GNOSIS_CHAIN,
      offset: 1,
      limit: 2,
      direction: 'asc',
    })
    expect(page.totalCount).toBe(2)
    expect(page.items.map(({ eventId, createdAt }) => ({ eventId, createdAt }))).toEqual([
      { eventId: 'newer-event', createdAt: 200 },
      { eventId: 'older-event', createdAt: 100 },
    ])
    expect(page.items[0]).not.toHaveProperty('partOrders')
  })

  it('applies query options to a part-order page', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            partOrders: {
              items: [],
              totalCount: 12,
            },
          },
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const page = await new ProgrammaticOrderApi({ apiUrl: 'https://example.com' }).getTwapPartOrders(
      {
        eventId: 'event',
        chainId: SupportedChainId.GNOSIS_CHAIN,
      },
      { limit: 10, offset: 10 },
    )
    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      query: string
      variables: Record<string, unknown>
    }

    expect(request.query).toContain('orderBy: "creationDate"')
    expect(request.query).toContain('orderDirection: $direction')
    expect(request.variables).toEqual({
      chainId: SupportedChainId.GNOSIS_CHAIN,
      parentEventId: 'event',
      offset: 10,
      limit: 10,
      direction: 'desc',
    })
    expect(page).toEqual({ items: [], totalCount: 12 })
  })

  it('lists the latest EOA TWAP parents from the live programmatic orders API', async () => {
    const page = await new ProgrammaticOrderApi().getTwapOrders({
      resolvedOwner: EOA,
      chainId: SupportedChainId.GNOSIS_CHAIN,
    })

    expect(page.items).toMatchSnapshot()
  }, 30_000)

  it('lists the latest Safe TWAP parents from the live programmatic orders API', async () => {
    const page = await new ProgrammaticOrderApi().getTwapOrders({
      resolvedOwner: SAFE,
      chainId: SupportedChainId.GNOSIS_CHAIN,
    })

    expect(page.items).toMatchSnapshot()
  }, 30_000)

  it('lists one page of EOA TWAP part orders from the live programmatic orders API', async () => {
    const api = new ProgrammaticOrderApi()
    const parentsPage = await api.getTwapOrders({
      resolvedOwner: EOA,
      chainId: SupportedChainId.GNOSIS_CHAIN,
    })
    const parent = parentsPage.items.find(({ executedAmounts }) => executedAmounts.executedFeeAmount > 0n)

    expect(parent).toBeDefined()

    const page = await api.getTwapPartOrders(
      {
        eventId: String(parent?.eventId),
        chainId: SupportedChainId.GNOSIS_CHAIN,
      },
      { offset: 0, limit: 10 },
    )

    expect(page.totalCount).toBe(parent?.partOrdersCount)
    expect(page.items.some(({ executedFeeAmount }) => executedFeeAmount !== null)).toBe(true)
    expect(page).toMatchSnapshot()
  }, 30_000)
})

function twapParent(eventId: string, blockTimestamp: number): Record<string, unknown> {
  return {
    eventId,
    chainId: SupportedChainId.GNOSIS_CHAIN,
    hash: `0x${'1'.repeat(64)}`,
    owner: EOA,
    resolvedOwner: EOA,
    status: 'Active',
    updatedAtBlock: '1',
    additionalData: {
      executedSellAmount: '0',
      executedBuyAmount: '0',
      executedFee: '0',
    },
    partOrders: { totalCount: 0 },
    schedule: {
      sellToken: EOA,
      buyToken: EOA,
      receiver: EOA,
      partSellAmount: '1',
      minPartLimit: '1',
      t0: '0',
      n: '1',
      t: '1',
      span: '0',
      appData: `0x${'2'.repeat(64)}`,
    },
    transaction: { blockTimestamp: String(blockTimestamp) },
  }
}
