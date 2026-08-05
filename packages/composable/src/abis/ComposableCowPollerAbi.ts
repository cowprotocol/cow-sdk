export const ComposableCowPollerAbi = [
  {
    type: 'function',
    name: 'register',
    inputs: [
      {
        name: 'schedule',
        type: 'tuple',
        internalType: 'struct ComposableCowPoller.Schedule',
        components: [
          { name: 'handler', type: 'address', internalType: 'contract IConditionalOrderGenerator' },
          { name: 'funder', type: 'address', internalType: 'address' },
          { name: 'owner', type: 'address', internalType: 'address' },
          { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
          { name: 'staticInput', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    outputs: [{ name: 'id', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'pollFunds',
    inputs: [{ name: 'id', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revoke',
    inputs: [{ name: 'id', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'funded',
    inputs: [
      { name: '', type: 'bytes32', internalType: 'bytes32' },
      { name: '', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nonces',
    inputs: [{ name: 'funder', type: 'address', internalType: 'address' }],
    outputs: [{ name: 'nonce', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerWithSignature',
    inputs: [
      {
        name: 'schedule',
        type: 'tuple',
        internalType: 'struct ComposableCowPoller.Schedule',
        components: [
          { name: 'handler', type: 'address', internalType: 'contract IConditionalOrderGenerator' },
          { name: 'funder', type: 'address', internalType: 'address' },
          { name: 'owner', type: 'address', internalType: 'address' },
          { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
          { name: 'staticInput', type: 'bytes', internalType: 'bytes' },
        ],
      },
      { name: 'deadline', type: 'uint256', internalType: 'uint256' },
      { name: 'signature', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [{ name: 'id', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeWithSignature',
    inputs: [
      { name: 'id', type: 'bytes32', internalType: 'bytes32' },
      { name: 'deadline', type: 'uint256', internalType: 'uint256' },
      { name: 'signature', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  }
] as const
