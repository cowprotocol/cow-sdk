export const repayWithCollateralAdapterAbi = [
  {
    type: 'function',
    name: 'repayDebtWithFlashLoan',
    inputs: [
      {
        name: 'erc20Permit',
        type: 'tuple',
        internalType: 'struct DataTypes.Permit',
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
