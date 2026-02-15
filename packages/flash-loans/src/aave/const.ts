import { mapAddressToSupportedNetworks, SupportedEvmChainId } from '@cowprotocol/sdk-config'
import { CollateralPermitData } from './types'

export const HASH_ZERO = '0x0000000000000000000000000000000000000000000000000000000000000000'

export enum AaveFlashLoanType {
  CollateralSwap = 'CollateralSwap',
  DebtSwap = 'DebtSwap',
  RepayCollateral = 'RepayCollateral',
}

// See https://aave.com/docs/resources/addresses
export const AAVE_POOL_ADDRESS: Record<SupportedEvmChainId, string> = {
  [SupportedEvmChainId.SEPOLIA]: '',
  [SupportedEvmChainId.LENS]: '',
  [SupportedEvmChainId.GNOSIS_CHAIN]: '0xb50201558B00496A145fE76f7424749556E326D8',
  [SupportedEvmChainId.MAINNET]: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  [SupportedEvmChainId.BASE]: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  [SupportedEvmChainId.ARBITRUM_ONE]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [SupportedEvmChainId.AVALANCHE]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [SupportedEvmChainId.BNB]: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
  [SupportedEvmChainId.POLYGON]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [SupportedEvmChainId.LINEA]: '0xc47b8C00b0f69a36fa203Ffeac0334874574a8Ac',
  [SupportedEvmChainId.PLASMA]: '0x925a2A7214Ed92428B5b1B090F80b25700095e12',
  [SupportedEvmChainId.INK]: '0x2816cf15F6d2A220E789aA011D5EE4eB6c47FEbA',
}

export const AAVE_ADAPTER_FACTORY: Record<SupportedEvmChainId, string> = mapAddressToSupportedNetworks(
  '0x43c658Ea38bBfD897706fDb35e2468ef5D8F6927',
)

const AAVE_COLLATERAL_SWAP_ADAPTER_HOOK: Record<SupportedEvmChainId, string> = mapAddressToSupportedNetworks(
  '0x29A9b0a13c81d59f13BA0f39DBDCAA1AB2adc95F',
)
const AAVE_DEBT_SWAP_ADAPTER_HOOK: Record<SupportedEvmChainId, string> = mapAddressToSupportedNetworks(
  '0xbE9A121bb958BBBb027dA728DEC0D5496811b7d1',
)
const AAVE_REPAY_COLLATERAL_ADAPTER_HOOK: Record<SupportedEvmChainId, string> = mapAddressToSupportedNetworks(
  '0x8e25d1210FabB0fcAdE92a82C4a89568B4b10E0F',
)

export const AAVE_HOOK_ADAPTER_PER_TYPE: Record<AaveFlashLoanType, Record<SupportedEvmChainId, string>> = {
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

export const ADAPTER_DOMAIN_NAME = 'AaveV3AdapterFactory'
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
