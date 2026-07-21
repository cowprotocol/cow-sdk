import * as v from 'valibot'

import { GraphqlClient, GraphqlClientError } from '../src/programmaticOrders/graphql'

describe('GraphqlClient', () => {
  afterEach(() => jest.restoreAllMocks())

  it('iterates parsed pages', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(pageResponse(['first'], true, 'next'))
      .mockResolvedValueOnce(pageResponse(['second'], false, null))
    const client = new GraphqlClient('https://example.com/api')

    const items = await client.paginate({
      query: 'query Nodes($after: String) { nodes(after: $after) { items pageInfo } }',
      page: 'nodes',
      variables: (after) => ({ after }),
      itemSchema: v.string(),
    })

    expect(items).toEqual(['first', 'second'])
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://example.com/api/graphql',
      'https://example.com/api/graphql',
    ])
    expect(fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init?.body)).variables.after)).toEqual([
      null,
      'next',
    ])
  })

  it('rejects invalid envelopes, pages, and cursors', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch')
    const client = new GraphqlClient('https://example.com/graphql')

    fetchMock.mockResolvedValueOnce(jsonResponse({ value: 1 }))

    await expect(client.query('query Value { value }', {})).rejects.toThrow('GraphQL response.data is missing')

    fetchMock.mockResolvedValueOnce(pageResponse([1], false, null))

    await expect(
      client.paginate({
        query: 'query Nodes { nodes }',
        page: 'nodes',
        variables: () => ({}),
        itemSchema: v.string(),
      }),
    ).rejects.toThrow('Invalid GraphQL page: nodes')

    fetchMock
      .mockResolvedValueOnce(pageResponse(['first'], true, 'same'))
      .mockResolvedValueOnce(pageResponse(['second'], true, 'same'))

    await expect(
      client.paginate({
        query: 'query Nodes { nodes }',
        page: 'nodes',
        variables: () => ({}),
        itemSchema: v.string(),
      }),
    ).rejects.toThrow('GraphQL page contains an invalid pagination cursor')
  })

  it('rejects invalid endpoints', () => {
    expect(() => new GraphqlClient('not a URL')).toThrow(GraphqlClientError)
  })
})

function pageResponse(items: unknown[], hasNextPage: boolean, endCursor: string | null): Promise<Response> {
  return Promise.resolve(
    jsonResponse({
      data: {
        nodes: {
          items,
          pageInfo: { hasNextPage, endCursor },
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
