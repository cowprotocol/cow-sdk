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
            name: 'sellAsset',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'buyAsset',
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
            name: 'hookSellAssetAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'hookBuyAssetAmount',
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
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'adapterImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'hookAmounts',
        type: 'tuple',
        internalType: 'struct DataTypes.HookAmounts',
        components: [
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
            name: 'sellAssetAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'buyAssetAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'order',
        type: 'tuple',
        internalType: 'struct GPv2Order.Data',
        components: [
          {
            name: 'sellToken',
            type: 'address',
            internalType: 'contract IERC20',
          },
          {
            name: 'buyToken',
            type: 'address',
            internalType: 'contract IERC20',
          },
          {
            name: 'receiver',
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
            name: 'validTo',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'appData',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'feeAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'kind',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'partiallyFillable',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'sellTokenBalance',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'buyTokenBalance',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const
