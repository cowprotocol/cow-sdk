import { mapAddressToSupportedNetworks, SupportedChainId } from '@cowprotocol/sdk-config'
import { CollateralPermitData } from './types'

export const HASH_ZERO = '0x0000000000000000000000000000000000000000000000000000000000000000'

export enum AaveFlashLoanType {
  CollateralSwap = 'CollateralSwap',
  DebtSwap = 'DebtSwap',
  RepayCollateral = 'RepayCollateral',
}

// See https://search.onaave.com/?q=sepolia
export const AAVE_POOL_ADDRESS = mapAddressToSupportedNetworks('0xb50201558B00496A145fE76f7424749556E326D8')
export const AAVE_ADAPTER_FACTORY = mapAddressToSupportedNetworks('0x889ee28C0a8a41a312546A8eeD77b4b097C84016')

const AAVE_COLLATERAL_SWAP_ADAPTER_HOOK = mapAddressToSupportedNetworks('0x0aeC794e544B81D96149a4C8C1cC57c6F31A978A')
const AAVE_DEBT_SWAP_ADAPTER_HOOK = mapAddressToSupportedNetworks('0x2d13ADCFa398073d7406e5e1aF3dD14663cdBF30')
const AAVE_REPAY_COLLATERAL_ADAPTER_HOOK = mapAddressToSupportedNetworks('0x193fd444802D6BC18a9AE0613D33C024F16A9dDC')

export const AAVE_HOOK_ADAPTER_PER_TYPE: Record<AaveFlashLoanType, Record<SupportedChainId, string>> = {
  [AaveFlashLoanType.CollateralSwap]: AAVE_COLLATERAL_SWAP_ADAPTER_HOOK,
  [AaveFlashLoanType.DebtSwap]: AAVE_DEBT_SWAP_ADAPTER_HOOK,
  [AaveFlashLoanType.RepayCollateral]: AAVE_REPAY_COLLATERAL_ADAPTER_HOOK,
}

export const DEFAULT_HOOK_GAS_LIMIT = {
  pre: 300_000n,
  post: 600_000n,
}

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
