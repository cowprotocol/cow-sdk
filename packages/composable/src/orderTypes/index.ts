import { ConditionalOrderRegistry } from '../ConditionalOrderFactory'
import { TWAP_ADDRESS, Twap } from './Twap'
export * from './Twap'

export const DEFAULT_CONDITIONAL_ORDER_REGISTRY: ConditionalOrderRegistry = {
  // Registry of all known order types
  [TWAP_ADDRESS]: (params) => Twap.fromParams(params),
}
