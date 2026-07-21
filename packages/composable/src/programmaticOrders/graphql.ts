import * as v from 'valibot'

const GRAPHQL_ENVELOPE_SCHEMA = v.object({
  data: v.optional(v.unknown()),
  errors: v.optional(v.nullable(v.array(v.object({ message: v.string() })))),
})

interface GraphqlPaginatedOperation<TItemSchema extends v.GenericSchema> {
  query: string
  page: string
  variables: (after: string | null) => Record<string, unknown>
  itemSchema: TItemSchema
}

export class GraphqlClientError extends Error {
  readonly name = 'GraphqlClientError'
}

export class GraphqlClient {
  private readonly url: string

  constructor(url: string) {
    try {
      const parsedUrl = new URL(url)

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') throw new Error('Unsupported protocol')

      const pathname = parsedUrl.pathname.replace(/\/+$/, '')

      parsedUrl.pathname = pathname.endsWith('/graphql') ? pathname : `${pathname}/graphql`
      this.url = parsedUrl.toString()
    } catch (cause) {
      throw new GraphqlClientError('Invalid GraphQL endpoint', { cause })
    }
  }

  async query(query: string, variables: Record<string, unknown>): Promise<unknown> {
    let response: Response

    try {
      response = await fetch(this.url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      })
    } catch (cause) {
      throw new GraphqlClientError('GraphQL request failed', { cause })
    }

    let payload: unknown

    try {
      payload = await response.json()
    } catch (cause) {
      if (!response.ok) {
        throw new GraphqlClientError(`GraphQL request returned HTTP ${response.status}`, {
          cause,
        })
      }

      throw new GraphqlClientError('GraphQL response is not valid JSON', { cause })
    }

    if (!response.ok) {
      throw new GraphqlClientError(`GraphQL request returned HTTP ${response.status}`)
    }

    const result = v.safeParse(GRAPHQL_ENVELOPE_SCHEMA, payload, { abortEarly: true })

    if (!result.success) {
      throw new GraphqlClientError('Invalid GraphQL response')
    }

    const { data, errors } = result.output

    if (errors?.length) {
      throw new GraphqlClientError(errors.map(({ message }) => message).join('; '))
    }

    if (data === undefined) throw new GraphqlClientError('GraphQL response.data is missing')

    return data
  }

  async paginate<TItemSchema extends v.GenericSchema>(
    operation: GraphqlPaginatedOperation<TItemSchema>,
  ): Promise<v.InferOutput<TItemSchema>[]> {
    const items: v.InferOutput<TItemSchema>[] = []
    const cursors = new Set<string>()
    let after: string | null = null
    let hasNextPage = true

    while (hasNextPage) {
      const data = await this.query(operation.query, operation.variables(after))
      const result = v.safeParse(
        v.object({
          [operation.page]: v.object({
            items: v.array(operation.itemSchema),
            pageInfo: v.object({
              hasNextPage: v.boolean(),
              endCursor: v.nullable(v.string()),
            }),
          }),
        }),
        data,
        { abortEarly: true },
      )

      if (!result.success) {
        throw new GraphqlClientError(`Invalid GraphQL page: ${operation.page}`)
      }

      const page = result.output[operation.page]

      if (page === undefined) throw new GraphqlClientError(`response.data.${operation.page} is missing`)

      const { endCursor } = page.pageInfo

      hasNextPage = page.pageInfo.hasNextPage
      items.push(...page.items)

      if (!hasNextPage) break
      if (endCursor === null || endCursor.length === 0 || cursors.has(endCursor)) {
        throw new GraphqlClientError('GraphQL page contains an invalid pagination cursor')
      }

      cursors.add(endCursor)
      after = endCursor
    }

    return items
  }
}
