import { type ConditionalOrder } from './ConditionalOrder'
import { ConditionalOrderParams } from './types'

export type FromParams<D, S> = (params: ConditionalOrderParams) => ConditionalOrder<D, S>
export type ConditionalOrderRegistry = Record<string, FromParams<unknown, unknown>>

/**
 * Factory for conditional orders.
 *
 * It uses a registry to instantiate the correct conditional order based on the handler.
 *
 * Knowing the handler, the factory will instantiate the correct conditional order using the staticInput data.
 */
export class ConditionalOrderFactory {
  public knownOrderTypes

  constructor(registry: ConditionalOrderRegistry) {
    // Normalize the keys to lowercase
    this.knownOrderTypes = Object.entries(registry).reduce<ConditionalOrderRegistry>((acc, [key, value]) => {
      acc[key.toLowerCase()] = value
      return acc
    }, {})
  }

  /**
   * Get the conditional order factory from the conditional order parameters
   */
  public fromParams(params: ConditionalOrderParams): ConditionalOrder<unknown, unknown> | undefined {
    const { handler } = params

    const factory = this.knownOrderTypes[handler.toLocaleLowerCase()]
    if (!factory) {
      return undefined
    }

    return factory(params)
  }
}
