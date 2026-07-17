import { log } from '@cowprotocol/sdk-common'

import { invalidResponse, parseGraphqlData, type Page } from './common/parse'
import { ProgrammaticOrderApiError } from './common/types'

const DEFAULT_API_URL = 'https://cow-programmatic-order.bleu.blue'
export const PAGE_SIZE = 1000

export class ProgrammaticOrdersClient {
  private readonly graphqlUrl: string

  constructor(apiUrl?: string) {
    this.graphqlUrl = getGraphqlUrl(apiUrl ?? DEFAULT_API_URL)
  }

  async paginate<T>(label: string, getPage: (after: string | null) => Promise<Page<T>>): Promise<T[]> {
    const items: T[] = []
    const cursors = new Set<string>()
    let after: string | null = null
    let hasNextPage = true

    while (hasNextPage) {
      const page = await getPage(after)
      items.push(...page.items)
      hasNextPage = page.hasNextPage

      if (!hasNextPage) break
      if (page.endCursor === null || page.endCursor.length === 0 || cursors.has(page.endCursor)) {
        invalidResponse(`${label}.pageInfo contains an invalid pagination cursor`)
      }

      cursors.add(page.endCursor)
      after = page.endCursor
    }

    return items
  }

  async query(operation: string, query: string, variables: Record<string, unknown>): Promise<unknown> {
    log(`ProgrammaticOrderApi: querying ${operation}`)

    let response: Response

    try {
      response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      })
    } catch (cause) {
      throw new ProgrammaticOrderApiError('network', 'Programmatic orders API request failed', undefined, { cause })
    }

    let payload: unknown

    try {
      payload = await response.json()
    } catch (cause) {
      if (!response.ok) {
        throw new ProgrammaticOrderApiError(
          'http',
          `Programmatic orders API returned HTTP ${response.status}`,
          response.status,
          { cause },
        )
      }

      throw new ProgrammaticOrderApiError(
        'invalid-response',
        'Programmatic orders API returned invalid JSON',
        undefined,
        { cause },
      )
    }

    if (!response.ok) {
      throw new ProgrammaticOrderApiError(
        'http',
        `Programmatic orders API returned HTTP ${response.status}`,
        response.status,
      )
    }

    return parseGraphqlData(payload)
  }
}

function getGraphqlUrl(apiUrl: string): string {
  if (typeof apiUrl !== 'string') {
    throw new ProgrammaticOrderApiError('invalid-request', 'Programmatic orders API URL must be a string')
  }

  try {
    const url = new URL(apiUrl)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Unsupported protocol')

    const pathname = url.pathname.replace(/\/+$/, '')

    url.pathname = pathname.endsWith('/graphql') ? pathname : `${pathname}/graphql`

    return url.toString()
  } catch (cause) {
    throw new ProgrammaticOrderApiError('invalid-request', 'Invalid programmatic orders API URL', undefined, {
      cause,
    })
  }
}
