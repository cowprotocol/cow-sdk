// Only includes the `swapAndBridge` function used by createAcrossDepositCall.
// Other SpokePoolPeriphery methods (depositNative, depositWithAuthorization,
// depositWithPermit, depositWithPermit2, swapAndBridgeWithAuthorization,
// swapAndBridgeWithPermit, swapAndBridgeWithPermit2, multicall, etc.)
// were removed to reduce bundle size.
export const ACROSS_SPOKE_POOL_PERIPHERY_ABI = [
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              { internalType: 'address', name: 'recipient', type: 'address' },
            ],
            internalType: 'struct SpokePoolPeripheryInterface.Fees',
            name: 'submissionFees',
            type: 'tuple',
          },
          {
            components: [
              { internalType: 'address', name: 'inputToken', type: 'address' },
              { internalType: 'bytes32', name: 'outputToken', type: 'bytes32' },
              { internalType: 'uint256', name: 'outputAmount', type: 'uint256' },
              { internalType: 'address', name: 'depositor', type: 'address' },
              { internalType: 'bytes32', name: 'recipient', type: 'bytes32' },
              { internalType: 'uint256', name: 'destinationChainId', type: 'uint256' },
              { internalType: 'bytes32', name: 'exclusiveRelayer', type: 'bytes32' },
              { internalType: 'uint32', name: 'quoteTimestamp', type: 'uint32' },
              { internalType: 'uint32', name: 'fillDeadline', type: 'uint32' },
              { internalType: 'uint32', name: 'exclusivityParameter', type: 'uint32' },
              { internalType: 'bytes', name: 'message', type: 'bytes' },
            ],
            internalType: 'struct SpokePoolPeripheryInterface.BaseDepositData',
            name: 'depositData',
            type: 'tuple',
          },
          { internalType: 'address', name: 'swapToken', type: 'address' },
          { internalType: 'address', name: 'exchange', type: 'address' },
          { internalType: 'enum SpokePoolPeripheryInterface.TransferType', name: 'transferType', type: 'uint8' },
          { internalType: 'uint256', name: 'swapTokenAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'minExpectedInputTokenAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'routerCalldata', type: 'bytes' },
          { internalType: 'bool', name: 'enableProportionalAdjustment', type: 'bool' },
          { internalType: 'address', name: 'spokePool', type: 'address' },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
        ],
        internalType: 'struct SpokePoolPeripheryInterface.SwapAndDepositData',
        name: 'swapAndDepositData',
        type: 'tuple',
      },
    ],
    name: 'swapAndBridge',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
]
