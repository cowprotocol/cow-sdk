export interface ProgrammaticOrderApiOptions {
  /** Programmatic orders API base URL or full GraphQL URL. */
  apiUrl?: string
}

/**
 * Lifecycle status of a programmatic order.
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/schema/tables.ts#L20-L24
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/conditional-order-generator.ts
 */
export type ProgrammaticOrderStatus = 'Active' | 'Cancelled' | 'Completed'

export class ProgrammaticOrderApiError extends Error {
  readonly name = 'ProgrammaticOrderApiError'

  /**
   * Creates a programmatic orders API error.
   *
   * @param message - Human-readable failure description.
   * @param options - Standard error options, including the original cause.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}
