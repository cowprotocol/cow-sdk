import { ALL_ADDITIONAL_TARGET_CHAIN_IDS, ALL_SUPPORTED_CHAIN_IDS } from './chainIds'
import { AdditionalTargetChainId, SupportedChainId, TargetChainId } from '../types'
import { isSupportedChain } from '../utils'

// determines return type based on input chainIds type, if you put SupportedChainId -> it will create SupportedChainId map,
// otherwise it will create AdditionalTargetChainId map
type MapNetworksReturnType<T, ChainIds extends TargetChainId[] | undefined> =
  ChainIds extends AdditionalTargetChainId[]
    ? Record<AdditionalTargetChainId, T>
    : Record<SupportedChainId, T>

// Overloads for type inference
export function mapSupportedNetworks<T>(value: (chainId: SupportedChainId) => T): Record<SupportedChainId, T>
export function mapSupportedNetworks<T>(value: T): Record<SupportedChainId, T>
export function mapSupportedNetworks<T>(
  value: (chainId: AdditionalTargetChainId) => T,
  chainIds: AdditionalTargetChainId[],
): Record<AdditionalTargetChainId, T>
export function mapSupportedNetworks<T, ChainIds extends TargetChainId[] | undefined = undefined>(
  value: T,
  chainIds?: ChainIds,
): MapNetworksReturnType<T, ChainIds> {
  const idsToMap = chainIds || ALL_SUPPORTED_CHAIN_IDS

  if (idsToMap.length > 0 && typeof idsToMap[0] === 'number' && isSupportedChain(idsToMap[0])) {
    return ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, T>>(
      (acc, chainId) => ({
        ...acc,
        [chainId]: typeof value === 'function' ? (value as (chainId: SupportedChainId) => T)(chainId) : value,
      }),
      {},
    ) as MapNetworksReturnType<T, ChainIds>
  } else {
    return ALL_ADDITIONAL_TARGET_CHAIN_IDS.reduce<Record<number | string, T>>(
      (acc, chainId) => ({
        ...acc,
        [chainId]: typeof value === 'function' ? (value as (chainId: AdditionalTargetChainId) => T)(chainId) : value,
      }),
      {},
    ) as MapNetworksReturnType<T, ChainIds>
  }
}

export function mapAddressToSupportedNetworks(address: string): Record<SupportedChainId, string> {
  return mapSupportedNetworks(address)
}
