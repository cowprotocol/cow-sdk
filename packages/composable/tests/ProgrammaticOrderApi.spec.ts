import { SupportedChainId } from '@cowprotocol/sdk-config'

import {
  ProgrammaticOrderApi,
  type GetTwapOrderParams,
  type GetTwapOrdersParams,
  type GetTwapPartOrdersParams,
  type QueryDirection,
} from '../src'

const EOA = '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3'

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
    await expect(
      api.getTwapOrders({
        resolvedOwner: EOA,
        chainId: SupportedChainId.GNOSIS_CHAIN,
        updatedAtBlockGte: -1n,
      }),
    ).rejects.toThrow('must be a non-negative bigint')
    await expect(api.getTwapOrder(undefined as unknown as GetTwapOrderParams)).rejects.toThrow(
      'Invalid type: Expected Object but received undefined',
    )
  })

  it('returns one TWAP parent by event ID', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            twapOrders: {
              items: [{ ...twapParent('event', 200), partOrdersCount: 3 }],
              totalCount: 1,
            },
          },
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const order = await new ProgrammaticOrderApi({ apiUrl: 'https://example.com' }).getTwapOrder({
      eventId: 'event',
      chainId: SupportedChainId.GNOSIS_CHAIN,
    })
    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      query: string
      variables: Record<string, unknown>
    }

    expect(request.query).toContain('programmaticOrders(')
    expect(request.query).toContain('eventId: $eventId')
    expect(request.query).toContain('orderType: TWAP')
    expect(request.variables).toEqual({
      chainId: SupportedChainId.GNOSIS_CHAIN,
      eventId: 'event',
      limit: 1,
    })
    if (!order) throw new Error('Expected a TWAP order')
    const txHash: string = order.txHash
    expect(order).toMatchObject({
      eventId: 'event',
      createdAt: 200,
      partOrdersCount: 3,
    })
    expect(txHash).toBe(`0x${'3'.repeat(64)}`)
  })

  it.each([
    ['Active', '0', 200, 'open'],
    ['Active', '1', 200, 'open'],
    ['Active', '0', 203, 'expired'],
    ['Active', '1', 203, 'partiallyFilled'],
    ['Completed', '1', 200, 'partiallyFilled'],
    ['Active', '2', 200, 'filled'],
    ['Cancelled', '0', 200, 'cancelled'],
    ['Cancelled', '1', 200, 'partiallyFilled'],
    ['Cancelled', '2', 200, 'filled'],
  ])('derives %s with %s sold at %s as %s in both endpoints', async (status, sold, now, expected) => {
    jest.spyOn(Date, 'now').mockReturnValue(Number(now) * 1000)
    const parent = {
      ...twapParent('event', 200),
      status,
      schedule: {
        ...(twapParent('event', 200).schedule as Record<string, unknown>),
        n: '2',
      },
      additionalData: { executedSellAmount: sold, executedBuyAmount: sold, executedFee: '0' },
    }
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              twapOrders: { items: [parent], totalCount: 1 },
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              twapOrders: { items: [parent], totalCount: 1 },
            },
          }),
        ),
      )
    const api = new ProgrammaticOrderApi()
    const order = await api.getTwapOrder({ eventId: 'event', chainId: SupportedChainId.GNOSIS_CHAIN })
    const page = await api.getTwapOrders({ resolvedOwner: EOA, chainId: SupportedChainId.GNOSIS_CHAIN })
    expect(order?.status).toBe(expected)
    expect(page.items[0]?.status).toBe(expected)
    expect(order?.lifecycleStatus).toBe(status)
    expect(page.items[0]?.lifecycleStatus).toBe(status)
  })

  it.each([
    ['missing', undefined],
    ['null', null],
  ])('rejects a %s creation transaction hash', async (_case, txHash) => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            twapOrders: {
              items: [{ ...twapParent('event', 200), txHash }],
              totalCount: 1,
            },
          },
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(
      new ProgrammaticOrderApi({ apiUrl: 'https://example.com' }).getTwapOrder({
        eventId: 'event',
        chainId: SupportedChainId.GNOSIS_CHAIN,
      }),
    ).rejects.toThrow('Failed to fetch TWAP order')
  })

  it('returns null when the filtered view has no matching TWAP', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { twapOrders: { items: [], totalCount: 0 } } }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      new ProgrammaticOrderApi({ apiUrl: 'https://example.com' }).getTwapOrder({
        eventId: 'event',
        chainId: SupportedChainId.GNOSIS_CHAIN,
      }),
    ).resolves.toBeNull()
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
    expect(request.query).toContain('txHash')
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
    expect(page.items[0]?.schedule).toMatchObject({
      effectiveStartTime: 200,
      numberOfParts: 1,
      timeBetweenParts: 1,
      durationOfPart: 0,
    })
    expect(page.items[0]).not.toHaveProperty('partOrders')
    expect(page.items[0]?.partOrdersCount).toBe(2)
    expect(page.items[0]?.txHash).toBe(`0x${'3'.repeat(64)}`)
    expect(request.query).toContain('twapOrders: programmaticOrders(')
  })

  it('filters TWAP orders by an inclusive update block', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { twapOrders: { items: [], totalCount: 2 } } }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const page = await new ProgrammaticOrderApi({ apiUrl: 'https://example.com' }).getTwapOrders(
      {
        resolvedOwner: EOA,
        chainId: SupportedChainId.GNOSIS_CHAIN,
        updatedAtBlockGte: 10n,
      },
      { limit: 1000 },
    )
    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      query: string
      variables: Record<string, unknown>
    }

    expect(request.query).toContain('updatedAtBlock_gte: $updatedAtBlockGte')
    expect(request.variables.updatedAtBlockGte).toBe('10')
    expect(page).toEqual({ items: [], totalCount: 2 })
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

    expect(request.query).toContain('partOrders: partOrders(')
    expect(request.query).toContain('orderBy: "sortKey"')
    expect(request.query).toContain('orderDirection: $direction')
    expect(request.variables).toEqual({
      chainId: SupportedChainId.GNOSIS_CHAIN,
      parentEventId: 'event',
      offset: 10,
      limit: 10,
    })
    expect(page).toEqual({ items: [], totalCount: 12 })
  })

  it('returns unconfirmed candidates without inventing executed amounts', async () => {
    const orderUid = `0x${'1'.repeat(112)}`
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            partOrders: {
              items: [
                {
                  orderUid,
                  status: 'unconfirmed',
                  sellAmount: '10',
                  buyAmount: '5',
                  feeAmount: '0',
                  validTo: 2000,
                  createdAt: '1000',
                  executedSellAmount: null,
                  executedBuyAmount: null,
                  executedFeeAmount: null,
                },
              ],
              totalCount: 1,
            },
          },
        }),
      ),
    )

    const page = await new ProgrammaticOrderApi().getTwapPartOrders({
      eventId: 'parent',
      chainId: SupportedChainId.GNOSIS_CHAIN,
    })
    expect(page.items).toEqual([
      {
        orderUid,
        status: 'unconfirmed',
        sellAmount: 10n,
        buyAmount: 5n,
        feeAmount: 0n,
        validTo: 2000,
        createdAt: 1000,
        executedSellAmount: null,
        executedBuyAmount: null,
        executedFeeAmount: null,
      },
    ])
  })
})

function twapParent(eventId: string, blockTimestamp: number): Record<string, unknown> {
  return {
    eventId,
    chainId: SupportedChainId.GNOSIS_CHAIN,
    hash: `0x${'1'.repeat(64)}`,
    txHash: `0x${'3'.repeat(64)}`,
    owner: EOA,
    resolvedOwner: EOA,
    status: 'Active',
    updatedAtBlock: '1',
    additionalData: {
      executedSellAmount: '0',
      executedBuyAmount: '0',
      executedFee: '0',
    },
    partOrdersCount: 2,
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
    createdAt: String(blockTimestamp),
  }
}
