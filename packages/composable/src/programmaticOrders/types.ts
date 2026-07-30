export interface ProgrammaticOrderApiOptions {
  /** Programmatic orders API base URL or full GraphQL URL. */
  apiUrl?: string
}

export type QueryDirection = 'asc' | 'desc'

export interface QueryOptions {
  /** Maximum number of records to return. Defaults to 100; maximum 1000. */
  limit?: number
  /** Number of records to skip. Defaults to 0. */
  offset?: number
  /** Sort direction. Defaults to descending. */
  direction?: QueryDirection
}

export interface QueryPage<T> {
  items: T[]
  totalCount: number
}

/**
 * Status reported by the programmatic orders API.
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/schema/tables.ts#L20-L24
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/conditional-order-generator.ts
 */
export type ProgrammaticOrderStatus = 'Active' | 'Cancelled' | 'Completed'

export class ProgrammaticOrderApiError extends Error {
  readonly name = 'ProgrammaticOrderApiError'
}
