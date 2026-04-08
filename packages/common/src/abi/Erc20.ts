/**
 * Minimal ABI fragment for the ERC-20 `approve(address spender, uint256 amount)` function.
 *
 * Useful when you only need to encode/call `approve` without importing a full token ABI.
 *
 * @see {@link https://eips.ethereum.org/EIPS/eip-20 EIP-20 (ERC-20) specification}
 * @see {@link https://ethereum.org/developers/docs/standards/tokens/erc-20/ ethereum.org: ERC-20 overview}
 * @see {@link https://docs.openzeppelin.com/contracts/5.x/api/token/erc20 OpenZeppelin: ERC20 API reference}
 */
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

/**
 * Minimal ABI fragment for the ERC-20 `allowance(address owner, address spender)` view function.
 *
 * Returns the current allowance that `spender` can spend from `owner`.
 *
 * @see {@link https://eips.ethereum.org/EIPS/eip-20 EIP-20 (ERC-20) specification}
 * @see {@link https://ethereum.org/developers/docs/standards/tokens/erc-20/ ethereum.org: ERC-20 overview}
 * @see {@link https://docs.openzeppelin.com/contracts/5.x/api/token/erc20 OpenZeppelin: ERC20 API reference}
 */
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

/**
 * Minimal ABI fragment for the ERC-20 `transfer(address to, uint256 amount)` function.
 *
 * Note: if this call is executed from CoWShed, then `msg.sender` is the proxy wallet.
 *
 * @see {@link https://eips.ethereum.org/EIPS/eip-20 EIP-20 (ERC-20) specification}
 * @see {@link https://ethereum.org/developers/docs/standards/tokens/erc-20/ ethereum.org: ERC-20 overview}
 * @see {@link https://docs.openzeppelin.com/contracts/5.x/api/token/erc20 OpenZeppelin: ERC20 API reference}
 */
export const ERC20_TRANSFER_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

/**
 * Minimal ABI fragment for the ERC-20 `balanceOf(address account)` view function.
 *
 * Returns the token balance of `account`.
 *
 * @see {@link https://eips.ethereum.org/EIPS/eip-20 EIP-20 (ERC-20) specification}
 * @see {@link https://ethereum.org/developers/docs/standards/tokens/erc-20/ ethereum.org: ERC-20 overview}
 * @see {@link https://docs.openzeppelin.com/contracts/5.x/api/token/erc20 OpenZeppelin: ERC20 API reference}
 */
export const ERC20_BALANCE_OF_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]
