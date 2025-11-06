import { mapAddressToSupportedNetworks, SupportedChainId } from '@cowprotocol/sdk-config'
import { CollateralPermitData } from './types'

export const HASH_ZERO = '0x0000000000000000000000000000000000000000000000000000000000000000'

export enum AaveFlashLoanType {
  CollateralSwap = 'CollateralSwap',
  DebtSwap = 'DebtSwap',
  RepayCollateral = 'RepayCollateral',
}

// See https://aave.com/docs/resources/addresses
export const AAVE_POOL_ADDRESS: Record<SupportedChainId, string> = {
  [SupportedChainId.SEPOLIA]: '',
  [SupportedChainId.LENS]: '',
  [SupportedChainId.GNOSIS_CHAIN]: '0xb50201558B00496A145fE76f7424749556E326D8',
  [SupportedChainId.MAINNET]: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  [SupportedChainId.BASE]: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  [SupportedChainId.ARBITRUM_ONE]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [SupportedChainId.AVALANCHE]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [SupportedChainId.BNB]: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
  [SupportedChainId.POLYGON]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [SupportedChainId.LINEA]: '0xc47b8C00b0f69a36fa203Ffeac0334874574a8Ac',
  [SupportedChainId.PLASMA]: '0x925a2A7214Ed92428B5b1B090F80b25700095e12',
}
export const AAVE_ADAPTER_FACTORY: Record<SupportedChainId, string> = {
  ...mapAddressToSupportedNetworks(''),
  [SupportedChainId.GNOSIS_CHAIN]: '0x889ee28C0a8a41a312546A8eeD77b4b097C84016',
  [SupportedChainId.MAINNET]: '0x22E08c56a6799e28e7b05A117D853B9b46abc017',
  [SupportedChainId.BASE]: '0xc5D68e305e0b5998f895e34d4440954072F285B6',
}

const AAVE_COLLATERAL_SWAP_ADAPTER_HOOK: Record<SupportedChainId, string> = {
  ...mapAddressToSupportedNetworks(''),
  [SupportedChainId.GNOSIS_CHAIN]: '0x0aeC794e544B81D96149a4C8C1cC57c6F31A978A',
  [SupportedChainId.MAINNET]: '0xFEb471EC22E5572dbb44229301c266f4C305A78a',
  [SupportedChainId.BASE]: '0xBb45A7898A6f06a9c148BfeD0C103140F0079cd9',
}
const AAVE_DEBT_SWAP_ADAPTER_HOOK: Record<SupportedChainId, string> = {
  ...mapAddressToSupportedNetworks(''),
  [SupportedChainId.GNOSIS_CHAIN]: '0x2d13ADCFa398073d7406e5e1aF3dD14663cdBF30',
  [SupportedChainId.MAINNET]: '0x238f57A2c3F0696fB20295075a0F9A18EfC67D3a',
  [SupportedChainId.BASE]: '0xaCbd34fAB78BD6C8738eb32dDAFd688df98CD2E3',
}
const AAVE_REPAY_COLLATERAL_ADAPTER_HOOK: Record<SupportedChainId, string> = {
  ...mapAddressToSupportedNetworks(''),
  [SupportedChainId.GNOSIS_CHAIN]: '0x193fd444802D6BC18a9AE0613D33C024F16A9dDC',
  [SupportedChainId.MAINNET]: '0x9eB0ffd318e862D344792a8e589e8393E8bEd96F',
  [SupportedChainId.BASE]: '0x1549445700D0Cb2D7Ce85ECd5a7FD7Ba4a3D40A7',
}

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

// Constants for flash loan fee calculation matching Aave's PercentageMath.percentMul()
// Aave uses PERCENTAGE_FACTOR = 10000, but we scale 100× for basis points conversion
export const BASIS_POINTS_SCALE = BigInt(100 * PERCENT_SCALE) // 1_000_000
export const HALF_BASIS_POINTS_SCALE = BASIS_POINTS_SCALE / 2n // 500_000

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

export const AAVE_DAPP_ID_PER_TYPE: Record<AaveFlashLoanType, string> = {
  [AaveFlashLoanType.CollateralSwap]: 'cow-sdk://flashloans/aave/v3/collateral-swap',
  [AaveFlashLoanType.DebtSwap]: 'cow-sdk://flashloans/aave/v3/debt-swap',
  [AaveFlashLoanType.RepayCollateral]: 'cow-sdk://flashloans/aave/v3/repay-with-collateral',
}
