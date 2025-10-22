import { mapAddressToSupportedNetworks, SupportedChainId } from '@cowprotocol/sdk-config'
import { CollateralPermitData } from './types'

export const HASH_ZERO = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const AAVE_POOL_ADDRESS = '0xb50201558B00496A145fE76f7424749556E326D8' // See https://search.onaave.com/?q=sepolia
export const AAVE_ADAPTER_FACTORY = {
  ...mapAddressToSupportedNetworks('0x1186B5ad42E3e6d6c6901FC53b4A367540E6EcFE'),
  [SupportedChainId.GNOSIS_CHAIN]: '0x889ee28C0a8a41a312546A8eeD77b4b097C84016',
}
export const AAVE_COLLATERAL_SWAP_ADAPTER_HOOK = {
  ...mapAddressToSupportedNetworks('0xe80eE1e73f120b1106179Ae3D582CA4Fd768d517'),
  [SupportedChainId.GNOSIS_CHAIN]: '0x0aeC794e544B81D96149a4C8C1cC57c6F31A978A',
}

export const DEFAULT_HOOK_GAS_LIMIT = 1_000_000n

export const PERCENT_SCALE = 10_000

export const DEFAULT_VALIDITY = 10 * 60 // 10 min

export const GAS_ESTIMATION_ADDITION_PERCENT = 10 // 10%

export const ADAPTER_DOMAIN_NAME = 'AaveAdapterFactory'
export const ADAPTER_DOMAIN_VERSION = '1'

export const ADAPTER_SIGNATURE_TYPES = {
  AdapterOrderSig: [
    { name: 'instance', type: 'address' },
    { name: 'sellToken', type: 'address' },
    { name: 'buyToken', type: 'address' },
    { name: 'sellAmount', type: 'uint256' },
    { name: 'buyAmount', type: 'uint256' },
    { name: 'kind', type: 'bytes32' },
    { name: 'validTo', type: 'uint32' },
    { name: 'appData', type: 'bytes32' },
  ],
}

export const EMPTY_PERMIT: CollateralPermitData = {
  amount: '0',
  deadline: 0,
  v: 0,
  r: HASH_ZERO,
  s: HASH_ZERO,
}
