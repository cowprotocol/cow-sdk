import * as v from 'valibot'

import { GraphqlClient, GraphqlClientError } from '../src/programmaticOrders/graphql'

describe('GraphqlClient', () => {
  afterEach(() => jest.restoreAllMocks())

  it('parses one page', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(pageResponse(['first'], 3))
    const client = new GraphqlClient('https://example.com/api')

    const page = await client.queryPage({
      query: 'query Nodes($offset: Int!) { nodes(offset: $offset) { items totalCount } }',
      page: 'nodes',
      variables: { offset: 1 },
      itemSchema: v.string(),
    })

    expect(page).toEqual({ items: ['first'], totalCount: 3 })
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/api/graphql', expect.any(Object))
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)).variables).toEqual({ offset: 1 })
  })

  it('rejects invalid envelopes and pages', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch')
    const client = new GraphqlClient('https://example.com/graphql')

    fetchMock.mockResolvedValueOnce(jsonResponse({ value: 1 }))

    await expect(client.query('query Value { value }', {})).rejects.toThrow('GraphQL response.data is missing')

    fetchMock.mockResolvedValueOnce(pageResponse([1], 1))

    await expect(
      client.queryPage({
        query: 'query Nodes { nodes }',
        page: 'nodes',
        variables: {},
        itemSchema: v.string(),
      }),
    ).rejects.toThrow('Invalid GraphQL page: nodes')

    fetchMock.mockResolvedValueOnce(pageResponse([], -1))

    await expect(
      client.queryPage({
        query: 'query Nodes { nodes }',
        page: 'nodes',
        variables: {},
        itemSchema: v.string(),
      }),
    ).rejects.toThrow('Invalid GraphQL page: nodes')
  })

  it('rejects invalid endpoints', () => {
    expect(() => new GraphqlClient('not a URL')).toThrow(GraphqlClientError)
  })
})

function pageResponse(items: unknown[], totalCount: number): Promise<Response> {
  return Promise.resolve(
    jsonResponse({
      data: {
        nodes: {
          items,
          totalCount,
        },
      },
    }),
  )
}

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  })
}
