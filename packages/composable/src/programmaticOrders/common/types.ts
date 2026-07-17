/** Configuration for the programmatic orders API client. */
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

/** Stable category describing why a programmatic orders API call failed. */
export type ProgrammaticOrderApiErrorKind = 'invalid-request' | 'network' | 'http' | 'graphql' | 'invalid-response'

/** Error thrown by programmatic orders API operations. */
export class ProgrammaticOrderApiError extends Error {
  readonly name = 'ProgrammaticOrderApiError'

  /**
   * Creates a programmatic orders API error.
   *
   * @param kind - Stable failure category suitable for programmatic handling.
   * @param message - Human-readable failure description.
   * @param status - HTTP response status for `http` failures.
   * @param options - Standard error options, including the original cause.
   */
  constructor(
    readonly kind: ProgrammaticOrderApiErrorKind,
    message: string,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options)
  }
}
