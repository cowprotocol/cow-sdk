/**
 * ABI for the OrderFlowFactory contract.
 * Used to compute deterministic OrderFlow addresses and interact with the factory.
 */
export const ORDER_FLOW_FACTORY_ABI = [
  {
    type: 'function',
    name: 'getOrderFlowAddress',
    inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'triggerOrderCreation',
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        internalType: 'struct OrderFlowOrder.Data',
        components: [
          { name: 'sellToken', type: 'address', internalType: 'contract IERC20' },
          { name: 'buyToken', type: 'address', internalType: 'contract IERC20' },
          { name: 'receiver', type: 'address', internalType: 'address' },
          { name: 'owner', type: 'address', internalType: 'address' },
          { name: 'sellAmount', type: 'uint256', internalType: 'uint256' },
          { name: 'buyAmount', type: 'uint256', internalType: 'uint256' },
          { name: 'appData', type: 'bytes32', internalType: 'bytes32' },
          { name: 'feeAmount', type: 'uint256', internalType: 'uint256' },
          { name: 'validTo', type: 'uint32', internalType: 'uint32' },
          { name: 'partiallyFillable', type: 'bool', internalType: 'bool' },
          { name: 'quoteId', type: 'int64', internalType: 'int64' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * ABI tuple type for encoding OrderFlowOrder.Data struct.
 * Used with ABI encoding utilities to produce the destinationPayload.
 */
export const ORDER_FLOW_ORDER_DATA_TUPLE = {
  type: 'tuple',
  components: [
    { name: 'sellToken', type: 'address' },
    { name: 'buyToken', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'owner', type: 'address' },
    { name: 'sellAmount', type: 'uint256' },
    { name: 'buyAmount', type: 'uint256' },
    { name: 'appData', type: 'bytes32' },
    { name: 'feeAmount', type: 'uint256' },
    { name: 'validTo', type: 'uint32' },
    { name: 'partiallyFillable', type: 'bool' },
    { name: 'quoteId', type: 'int64' },
  ],
} as const
