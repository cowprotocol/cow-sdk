import { EcdsaSigningScheme, SigningScheme } from '@cowprotocol/sdk-order-book'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/sdk-config'

export const DEFAULT_QUOTE_VALIDITY = 60 * 30 // 30 min

export const DEFAULT_SLIPPAGE_BPS = 50 // 0.5%

export const ETH_FLOW_DEFAULT_SLIPPAGE_BPS: Record<SupportedChainId, number> =
  mapSupportedNetworks(DEFAULT_SLIPPAGE_BPS) // 0.5%

export const SIGN_SCHEME_MAP: Record<EcdsaSigningScheme, SigningScheme> = {
  [EcdsaSigningScheme.EIP712]: SigningScheme.EIP712,
  [EcdsaSigningScheme.ETHSIGN]: SigningScheme.ETHSIGN,
}

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
export const GAS_LIMIT_DEFAULT = BigInt(150000)

export const ERC20_APPROVE_ABI = [
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const ERC20_ALLOWANCE_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]
