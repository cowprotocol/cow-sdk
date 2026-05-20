import { ALL_CHAINS_IDS, ALL_SUPPORTED_CHAIN_IDS } from './chainIds'
import { SupportedChainId, TargetChainId } from '../types'

/**
 * @deprecated Use `mapChainEnum(SupportedChainId, value)` instead. Will be removed in the next major.
 */
export function mapSupportedNetworks<T>(value: (chainId: SupportedChainId) => T): Record<SupportedChainId, T>
/**
 * @deprecated Use `mapChainEnum(SupportedChainId, value)` instead. Will be removed in the next major.
 */
export function mapSupportedNetworks<T>(value: T): Record<SupportedChainId, T>
export function mapSupportedNetworks<T>(value: T | ((chainId: SupportedChainId) => T)): Record<SupportedChainId, T> {
  return ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, T>>(
    (acc, chainId) => ({
      ...acc,
      [chainId]: typeof value === 'function' ? (value as (chainId: SupportedChainId) => T)(chainId) : value,
    }),
    {},
  )
}

/**
 * @deprecated Use `mapChainEnum(SupportedChainId, AdditionalTargetChainId, value)` instead.
 * Will be removed in the next major.
 */
export function mapAllNetworks<T>(value: (chainId: TargetChainId) => T): Record<TargetChainId, T>
/**
 * @deprecated Use `mapChainEnum(SupportedChainId, AdditionalTargetChainId, value)` instead.
 * Will be removed in the next major.
 */
export function mapAllNetworks<T>(value: T): Record<TargetChainId, T>
export function mapAllNetworks<T>(value: T | ((chainId: TargetChainId) => T)): Record<TargetChainId, T> {
  return ALL_CHAINS_IDS.reduce<Record<number | string, T>>(
    (acc, chainId) => ({
      ...acc,
      [chainId]: typeof value === 'function' ? (value as (chainId: TargetChainId) => T)(chainId) : value,
    }),
    {},
  ) as Record<TargetChainId, T>
}


export function mapAddressToSupportedNetworks(address: string): Record<SupportedChainId, string> {
  return mapChainEnum(SupportedChainId, address)
}

type ChainEnumLike = Record<string, number | string>

/** Numeric values of a chain enum (ignores the runtime reverse mapping). */
type ChainIdOf<E extends ChainEnumLike> = Extract<E[keyof E], number>

/**
 * Build a `Record` keyed by every numeric value across one or more chain enums.
 *
 * - With a single enum, the result is `Record<<that enum's values>, T>`.
 * - With several enums passed as separate args, the keys are the **union** of their values.
 *   Example: `mapChainEnum(SupportedChainId, AdditionalTargetChainId, fn)` covers every
 *   `TargetChainId`, replacing the legacy `mapAllNetworks`. `mapChainEnum(EvmChains, NonEvmChains, fn)`
 *   covers the same set of chain ids by construction.
 *
 * Numeric TypeScript enums emit a reverse mapping (name → value AND "value" → name) at
 * runtime; this helper filters to the numeric side so the resulting record only contains
 * real chain ids.
 *
 * The last argument is the value/factory; everything before it is treated as a chain enum.
 *
 * @example
 *   // Single enum, factory form (exhaustive — TS errors if SDK adds a new EvmChains member
 *   // and the factory's return type changes).
 *   const RPC_URLS = mapChainEnum(EvmChains, (id) => fetchRpcFor(id))
 *
 *   // Single enum, constant value (the same value is assigned to every key).
 *   const SEEDS = mapChainEnum(SupportedChainId, [] as Order[])
 *
 *   // Multiple enums — keys are the union (= `TargetChainId`-shaped here).
 *   const BRIDGE_ROUTES = mapChainEnum(SupportedChainId, AdditionalTargetChainId, (id) => routeFor(id))
 */
// 1 enum
export function mapChainEnum<E1 extends ChainEnumLike, T>(
  enum1: E1,
  value: (chainId: ChainIdOf<E1>) => T,
): Record<ChainIdOf<E1>, T>
export function mapChainEnum<E1 extends ChainEnumLike, T>(enum1: E1, value: T): Record<ChainIdOf<E1>, T>
// 2 enums
export function mapChainEnum<E1 extends ChainEnumLike, E2 extends ChainEnumLike, T>(
  enum1: E1,
  enum2: E2,
  value: (chainId: ChainIdOf<E1> | ChainIdOf<E2>) => T,
): Record<ChainIdOf<E1> | ChainIdOf<E2>, T>
export function mapChainEnum<E1 extends ChainEnumLike, E2 extends ChainEnumLike, T>(
  enum1: E1,
  enum2: E2,
  value: T,
): Record<ChainIdOf<E1> | ChainIdOf<E2>, T>
// Implementation. The variadic tuple captures the shape: ≥1 chain enum followed by a
// value or factory. Concrete chain-id types come from the overloads above; here we work
// against `number` since the impl is enum-agnostic.
export function mapChainEnum<T>(
  ...args: readonly [ChainEnumLike, ...ChainEnumLike[], T | ((chainId: number) => T)]
): Record<number, T> {
  const value = args[args.length - 1] as T | ((chainId: number) => T)
  const chainEnums = args.slice(0, -1) as readonly ChainEnumLike[]
  const isFn = typeof value === 'function'
  const result: Record<number, T> = {}
  for (const chainEnum of chainEnums) {
    for (const v of Object.values(chainEnum)) {
      if (typeof v === 'number') {
        result[v] = isFn ? (value as (id: number) => T)(v) : value
      }
    }
  }
  return result
}
