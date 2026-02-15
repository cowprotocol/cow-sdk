import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { CowEnv, SupportedEvmChainId } from '@cowprotocol/sdk-config'

const orderBookApiCache = new Map<CowEnv, Map<SupportedEvmChainId, OrderBookApi>>([
  ['prod', new Map()],
  ['staging', new Map()],
])

export function resolveOrderBookApi(
  chainId: SupportedEvmChainId,
  env: CowEnv,
  existingOrderBookApi?: OrderBookApi,
): OrderBookApi {
  if (existingOrderBookApi) {
    existingOrderBookApi.context.chainId = chainId
    existingOrderBookApi.context.env = env

    return existingOrderBookApi
  }

  const envCache = orderBookApiCache.get(env) ?? new Map<SupportedEvmChainId, OrderBookApi>()
  const cached = envCache.get(chainId)

  if (cached) return cached

  const orderBookApi = new OrderBookApi({ chainId, env })

  envCache.set(chainId, orderBookApi)

  orderBookApiCache.set(env, envCache)

  return orderBookApi
}
