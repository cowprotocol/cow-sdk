export const aaveAdapterFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'aavePool_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'settlement_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'router_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'owner_',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'ADDRESSES_PROVIDER',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IPoolAddressesProvider',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DOMAIN_SEPARATOR',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'POOL',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IPool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ROUTER',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IFlashLoanRouter',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'SETTLEMENT_CONTRACT',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract ICowSettlement',
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
  {
    type: 'function',
    name: 'eip712Domain',
    inputs: [],
    outputs: [
      {
        name: 'fields',
        type: 'bytes1',
        internalType: 'bytes1',
      },
      {
        name: 'name',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'version',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'chainId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'verifyingContract',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'salt',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'extensions',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'executeOperation',
    inputs: [
      {
        name: '',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'callbackData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'flashLoanAndCallBack',
    inputs: [
      {
        name: 'lender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'contract IERC20',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'callbackData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
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
    name: 'isAdapterImplementation',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'notifyRepayFlashLoan',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'openFlashLoans',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'instanceActive',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'asset',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'totalAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
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
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'rescueTokens',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'contract IERC20',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAdapterImplementation',
    inputs: [
      {
        name: 'adapterImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'active',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'verifyOrderSignature',
    inputs: [
      {
        name: 'orderOwner',
        type: 'address',
        internalType: 'address',
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
      {
        name: 'signature',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'EIP712DomainChanged',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SetAdapterImplementation',
    inputs: [
      {
        name: 'adapterImplementation',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'active',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'CallerNotAavePool',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CallerNotInstance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CallerNotRouter',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FailedDeployment',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ImplementationAlreadyListed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ImplementationNotActive',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InstanceAlreadyDeployed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InstanceNotInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientBalance',
    inputs: [
      {
        name: 'balance',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'needed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidLender',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidOrderReceiver',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidShortString',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidZeroAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidZeroAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NothingToRepay',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'StringTooLong',
    inputs: [
      {
        name: 'str',
        type: 'string',
        internalType: 'string',
      },
    ],
  },
] as const
