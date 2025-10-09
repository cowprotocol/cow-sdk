export const collateralSwapAdapterHookAbi = [
  {
    type: "function",
    name: "AAVE_POOL",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "FACTORY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "SETTLEMENT_CONTRACT",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "collateralSwapWithFlashLoan",
    inputs: [
      {
        name: "erc20Permit",
        type: "tuple",
        internalType: "struct DataTypes.Permit",
        components: [
          {
            name: "amount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "v",
            type: "uint8",
            internalType: "uint8",
          },
          {
            name: "r",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "s",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hookData",
    inputs: [],
    outputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "sellAsset",
        type: "address",
        internalType: "address",
      },
      {
        name: "buyAsset",
        type: "address",
        internalType: "address",
      },
      {
        name: "sellAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "buyAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "kind",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "validTo",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "flashLoanAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "flashLoanFeeAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "hookSellAssetAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "hookBuyAssetAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "aavePool_",
        type: "address",
        internalType: "address",
      },
      {
        name: "settlement_",
        type: "address",
        internalType: "address",
      },
      {
        name: "hookData_",
        type: "tuple",
        internalType: "struct DataTypes.HookOrderData",
        components: [
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "sellAsset",
            type: "address",
            internalType: "address",
          },
          {
            name: "buyAsset",
            type: "address",
            internalType: "address",
          },
          {
            name: "sellAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "buyAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "kind",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "validTo",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "flashLoanAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "flashLoanFeeAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "hookSellAssetAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "hookBuyAssetAmount",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isValidSignature",
    inputs: [
      {
        name: "_orderHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "recoverERC20",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    name: "AddressZero",
    inputs: [],
  },
  {
    type: "error",
    name: "AmountInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "AmountZero",
    inputs: [],
  },
  {
    type: "error",
    name: "BalanceInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "BorrowInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "BuyAmountInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "BuyTokenInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "CallerNotHookTrampoline",
    inputs: [],
  },
  {
    type: "error",
    name: "CallerNotInstanceOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "OrderExpired",
    inputs: [],
  },
  {
    type: "error",
    name: "OrderFeeNotNull",
    inputs: [],
  },
  {
    type: "error",
    name: "OrderHashMismatch",
    inputs: [],
  },
  {
    type: "error",
    name: "OrderKindInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "OrderPartiallyFillable",
    inputs: [],
  },
  {
    type: "error",
    name: "OrderReceiverInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "OrderSignatureInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "OrderTokenBalanceInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "SellAmountInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "SellTokenInvalid",
    inputs: [],
  },
  {
    type: "error",
    name: "WithdrawInvalid",
    inputs: [],
  },
] as const;
  