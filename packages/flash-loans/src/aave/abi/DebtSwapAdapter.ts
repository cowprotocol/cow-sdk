export const debtSwapAdapterAbi = [
  {
    type: 'function',
    name: 'debtSwapWithFlashLoan',
    inputs: [
      {
        name: 'creditDelegationSig',
        type: 'tuple',
        internalType: 'struct DataTypes.CreditDelegationSig',
        components: [
          {
            name: 'amount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'deadline',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'v',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
]
