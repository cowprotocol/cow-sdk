import type { SupportedChainId } from '@cowprotocol/sdk-config'
import { areAddressesEqual, getEvmAddressKey, log } from '@cowprotocol/sdk-common'

import {
  invalidResponse,
  OWNER_MAPPING_SCHEMA,
  parseGraphqlData,
  parsePage,
  type Page,
} from './common/parse'
import { ProgrammaticOrderApiError } from './common/types'

const DEFAULT_API_URL = 'https://cow-programmatic-order.bleu.blue'
export const PAGE_SIZE = 1000

const OWNER_MAPPINGS_QUERY = `
  query OwnerMappings($owner: String!, $chainId: Int!, $after: String, $limit: Int!) {
    ownerMappings(where: { owner: $owner, chainId: $chainId }, after: $after, limit: $limit) {
      items {
        address
        chainId
        owner
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const OWNER_RESOLUTION_QUERY = `
  query OwnerResolution($address: String!, $chainId: Int!, $after: String, $limit: Int!) {
    ownerMappings(where: { address: $address, chainId: $chainId }, after: $after, limit: $limit) {
      items {
        address
        chainId
        owner
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

interface OwnerScope {
  resolvedOwner: string
  owners: string[]
}

export class ProgrammaticOrdersClient {
  private readonly graphqlUrl: string

  constructor(apiUrl?: string) {
    this.graphqlUrl = getGraphqlUrl(apiUrl ?? DEFAULT_API_URL)
  }

  async getOwnerScope(owner: string, chainId: SupportedChainId): Promise<OwnerScope> {
    const inputMappings = await this.paginate('owner resolution', async (after) => {
      const data = await this.query('owner resolution', OWNER_RESOLUTION_QUERY, {
        address: owner,
        chainId,
        after,
        limit: PAGE_SIZE,
      })

      return parsePage(data, 'ownerMappings', OWNER_MAPPING_SCHEMA)
    })

    if (inputMappings.length > 1) invalidResponse('ownerMappings contains conflicting mappings for an address')

    const inputMapping = inputMappings[0]

    if (inputMapping && (inputMapping.chainId !== chainId || !areAddressesEqual(inputMapping.address, owner))) {
      invalidResponse('ownerMappings.items contains a row for another address or chain')
    }

    const resolvedOwner = inputMapping?.owner ?? owner
    const mappings = await this.paginate('owner mappings', async (after) => {
      const data = await this.query('owner mappings', OWNER_MAPPINGS_QUERY, {
        owner: resolvedOwner,
        chainId,
        after,
        limit: PAGE_SIZE,
      })

      return parsePage(data, 'ownerMappings', OWNER_MAPPING_SCHEMA)
    })
    const owners = new Map<string, string>([
      [getEvmAddressKey(resolvedOwner), resolvedOwner],
      [getEvmAddressKey(owner), owner],
    ])

    for (const mapping of mappings) {
      if (mapping.chainId !== chainId || !areAddressesEqual(mapping.owner, resolvedOwner)) {
        invalidResponse('ownerMappings.items contains a row for another owner or chain')
      }

      owners.set(getEvmAddressKey(mapping.address), mapping.address)
    }

    log(`ProgrammaticOrderApi: resolved ${owners.size - 1} proxy owner(s)`)

    return { resolvedOwner, owners: [...owners.values()] }
  }

  async paginate<T>(label: string, getPage: (after: string | null) => Promise<Page<T>>): Promise<T[]> {
    const items: T[] = []
    const cursors = new Set<string>()
    let after: string | null = null

    while (true) {
      const page = await getPage(after)
      items.push(...page.items)

      if (!page.hasNextPage) return items
      if (page.endCursor === null || page.endCursor.length === 0 || cursors.has(page.endCursor)) {
        invalidResponse(`${label}.pageInfo contains an invalid pagination cursor`)
      }

      cursors.add(page.endCursor)
      after = page.endCursor
    }
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
