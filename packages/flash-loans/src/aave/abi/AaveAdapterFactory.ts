export const aaveAdapterFactoryAbi = [
  {
    type: 'function',
    name: 'getInstanceDeterministicAddress',
    inputs: [
      {
        name: 'adapterImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'hookData',
        type: 'tuple',
        internalType: 'struct DataTypes.HookOrderData',
        components: [
          {
            name: 'owner',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receiver',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'sellToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'buyToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'sellAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'buyAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'kind',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'validTo',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'flashLoanAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'flashLoanFeeAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hookSellTokenAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hookBuyTokenAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deployAndTransferFlashLoan',
    inputs: [
      {
        name: 'adapterImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'hookData',
        type: 'tuple',
        internalType: 'struct DataTypes.HookOrderData',
        components: [
          {
            name: 'owner',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'receiver',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'sellToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'buyToken',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'sellAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'buyAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'kind',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'validTo',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'flashLoanAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'flashLoanFeeAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hookSellTokenAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hookBuyTokenAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const
