import { type ConditionalOrder } from './ConditionalOrder'
import { ConditionalOrderParams } from './types'

export type FromParams<D, S> = (params: ConditionalOrderParams) => ConditionalOrder<D, S>
export type ConditionalOrderRegistry = Record<string, FromParams<unknown, unknown>>

export class ConditionalOrderFactory {
  public knownOrderTypes

  constructor(registry: ConditionalOrderRegistry) {
    this.knownOrderTypes = registry
  }

  public fromParams(params: ConditionalOrderParams): ConditionalOrder<unknown, unknown> | undefined {
    const { handler } = params

    const factory = this.knownOrderTypes[handler]
    if (!factory) {
      return undefined
    }

    return factory(params)
  }
}
