const permitComponents = [
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
]

export const leverageAdapterAbi = [
  {
    type: 'function',
    name: 'leverageWithFlashLoan',
    inputs: [
      {
        name: 'permitData',
        type: 'tuple',
        internalType: 'struct DataTypes.Permit',
        components: permitComponents,
      },
      {
        name: 'creditDelegationData',
        type: 'tuple',
        internalType: 'struct DataTypes.CreditDelegationData',
        components: permitComponents,
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
]
