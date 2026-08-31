const SCHEDULE_COMPONENTS = [
  { name: 'handler', type: 'address', internalType: 'contract IConditionalOrderGenerator' },
  { name: 'authEpoch', type: 'uint96', internalType: 'uint96' },
  { name: 'funder', type: 'address', internalType: 'address' },
  { name: 'owner', type: 'address', internalType: 'address' },
  { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
  { name: 'staticInput', type: 'bytes', internalType: 'bytes' },
] as const

const SCHEDULE_INPUT = {
  name: 'schedule',
  type: 'tuple',
  internalType: 'struct ComposableCowPoller.Schedule',
  components: SCHEDULE_COMPONENTS,
} as const

const ID_OUTPUT = [{ name: 'id', type: 'bytes32', internalType: 'bytes32' }] as const

export const ComposableCowPollerAbi = [
  {
    type: 'function',
    name: 'COMPOSABLE_COW',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract ComposableCoW' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'COW_SHED_FACTORY',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract ICowShedFactory' }],
    stateMutability: 'view',
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
    name: 'register',
    inputs: [SCHEDULE_INPUT],
    outputs: ID_OUTPUT,
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerFromShed',
    inputs: [SCHEDULE_INPUT],
    outputs: ID_OUTPUT,
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerWithSignature',
    inputs: [
      SCHEDULE_INPUT,
      { name: 'deadline', type: 'uint256', internalType: 'uint256' },
      { name: 'signature', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: ID_OUTPUT,
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revoke',
    inputs: [
      { name: 'handler', type: 'address', internalType: 'contract IConditionalOrderGenerator' },
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: ID_OUTPUT,
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeFromShed',
    inputs: [
      { name: 'handler', type: 'address', internalType: 'contract IConditionalOrderGenerator' },
      { name: 'funder', type: 'address', internalType: 'address' },
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
      { name: 'authEpoch', type: 'uint96', internalType: 'uint96' },
    ],
    outputs: ID_OUTPUT,
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeWithSignature',
    inputs: [
      { name: 'handler', type: 'address', internalType: 'contract IConditionalOrderGenerator' },
      { name: 'funder', type: 'address', internalType: 'address' },
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'salt', type: 'bytes32', internalType: 'bytes32' },
      { name: 'authEpoch', type: 'uint96', internalType: 'uint96' },
      { name: 'deadline', type: 'uint256', internalType: 'uint256' },
      { name: 'signature', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: ID_OUTPUT,
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'schedules',
    inputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    outputs: SCHEDULE_COMPONENTS,
    stateMutability: 'view',
  },
] as const
