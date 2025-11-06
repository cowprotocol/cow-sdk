export const debtSwapAdapterAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'factory_',
        type: 'address',
        internalType: 'address',
      },
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
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'AAVE_POOL',
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
    name: 'FACTORY',
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
    name: 'SETTLEMENT_CONTRACT',
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
  {
    type: 'function',
    name: 'getHookData',
    inputs: [],
    outputs: [
      {
        name: '',
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
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isValidSignature',
    inputs: [
      {
        name: '_orderHash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '_signature',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
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
    name: 'setParameters',
    inputs: [
      {
        name: 'hookData_',
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
    type: 'error',
    name: 'AlreadyInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CallerNotInstanceOwner',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidBalance',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidBorrow',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidBuyAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidBuyToken',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidHookSellAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidOrderExpiry',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidOrderKind',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidOrderReceiver',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidOrderSignature',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidOrderTokenBalancer',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSellAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidSellToken',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidWithdraw',
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
    name: 'OrderExpired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OrderFeeNotNull',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OrderHashMismatch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OrderPartiallyFillable',
    inputs: [],
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
]
