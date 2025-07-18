export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function allowance(address owner, address spender) view returns (uint256)',
]

export const SOCKET_VERIFIER_ABI = [
  {
    type: 'constructor',
    inputs: [
      { name: '_owner', type: 'address', internalType: 'address' },
      {
        name: '_socketGateway',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addVerifier',
    inputs: [
      { name: 'routeId', type: 'uint32', internalType: 'uint32' },
      { name: 'verifier', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimOwner',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'nominateOwner',
    inputs: [{ name: 'nominee_', type: 'address', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'nominee',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'parseCallData',
    inputs: [{ name: 'callData', type: 'bytes', internalType: 'bytes' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct SocketVerifier.UserRequest',
        components: [
          { name: 'routeId', type: 'uint32', internalType: 'uint32' },
          {
            name: 'socketRequest',
            type: 'bytes',
            internalType: 'bytes',
          },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'routeIdsToVerifiers',
    inputs: [{ name: '', type: 'uint32', internalType: 'uint32' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'socketGateway',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'validateRotueId',
    inputs: [
      { name: 'callData', type: 'bytes', internalType: 'bytes' },
      {
        name: 'expectedRouteId',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'validateSocketRequest',
    inputs: [
      { name: 'callData', type: 'bytes', internalType: 'bytes' },
      {
        name: 'expectedRequest',
        type: 'tuple',
        internalType: 'struct SocketVerifier.UserRequestValidation',
        components: [
          { name: 'routeId', type: 'uint32', internalType: 'uint32' },
          {
            name: 'socketRequest',
            type: 'tuple',
            internalType: 'struct SocketVerifier.SocketRequest',
            components: [
              {
                name: 'amount',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'recipient',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'toChainId',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'token',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'signature',
                type: 'bytes4',
                internalType: 'bytes4',
              },
            ],
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'OwnerClaimed',
    inputs: [
      {
        name: 'claimer',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnerNominated',
    inputs: [
      {
        name: 'nominee',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  { type: 'error', name: 'AmountNotMatched', inputs: [] },
  { type: 'error', name: 'FailedToVerify', inputs: [] },
  { type: 'error', name: 'OnlyNominee', inputs: [] },
  { type: 'error', name: 'OnlyOwner', inputs: [] },
  { type: 'error', name: 'RecipientNotMatched', inputs: [] },
  { type: 'error', name: 'RouteIdNotFound', inputs: [] },
  { type: 'error', name: 'RouteIdNotMatched', inputs: [] },
  { type: 'error', name: 'SignatureNotMatched', inputs: [] },
  { type: 'error', name: 'ToChainIdNotMatched', inputs: [] },
  { type: 'error', name: 'TokenNotMatched', inputs: [] },
]

export const BUNGEE_COWSWAP_LIB_ABI = [
  {
    inputs: [],
    name: 'InvalidInput',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PositionOutOfBounds',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_base',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_compare',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_target',
        type: 'uint256',
      },
    ],
    name: 'addPctDiff',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_base',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_compare',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_target',
        type: 'uint256',
      },
    ],
    name: 'applyPctDiff',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_original',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: '_start',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_length',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_replacement',
        type: 'bytes',
      },
    ],
    name: 'replaceBytes',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_original',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: '_start',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'replaceUint256',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_base',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_compare',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_target',
        type: 'uint256',
      },
    ],
    name: 'subPctDiff',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
]

export const SOCKET_GATEWAY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_owner', type: 'address' },
      { internalType: 'address', name: '_disabledRoute', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'ArrayLengthMismatch', type: 'error' },
  { inputs: [], name: 'IncorrectBridgeRatios', type: 'error' },
  { inputs: [], name: 'OnlyNominee', type: 'error' },
  { inputs: [], name: 'OnlyOwner', type: 'error' },
  { inputs: [], name: 'ZeroAddressNotAllowed', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'controllerId',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'controllerAddress',
        type: 'address',
      },
    ],
    name: 'ControllerAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'controllerId',
        type: 'uint32',
      },
    ],
    name: 'ControllerDisabled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'routeId',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'route',
        type: 'address',
      },
    ],
    name: 'NewRouteAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
    ],
    name: 'OwnerClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nominee',
        type: 'address',
      },
    ],
    name: 'OwnerNominated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: '_to', type: 'address' },
    ],
    name: 'OwnershipTransferRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'routeId',
        type: 'uint32',
      },
    ],
    name: 'RouteDisabled',
    type: 'event',
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    inputs: [],
    name: 'BRIDGE_AFTER_SWAP_SELECTOR',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'CENT_PERCENT',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'controllerAddress', type: 'address' }],
    name: 'addController',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'routeAddress', type: 'address' }],
    name: 'addRoute',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: 'routeId', type: 'uint32' }],
    name: 'addressAt',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'controllerCount',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    name: 'controllers',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: 'controllerId', type: 'uint32' }],
    name: 'disableController',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: 'routeId', type: 'uint32' }],
    name: 'disableRoute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'disabledRouteAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint32', name: 'controllerId', type: 'uint32' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct ISocketGateway.SocketControllerRequest',
        name: 'socketControllerRequest',
        type: 'tuple',
      },
    ],
    name: 'executeController',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint32', name: 'controllerId', type: 'uint32' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct ISocketGateway.SocketControllerRequest[]',
        name: 'controllerRequests',
        type: 'tuple[]',
      },
    ],
    name: 'executeControllers',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32', name: 'routeId', type: 'uint32' },
      { internalType: 'bytes', name: 'routeData', type: 'bytes' },
    ],
    name: 'executeRoute',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32[]', name: 'routeIds', type: 'uint32[]' },
      { internalType: 'bytes[]', name: 'dataItems', type: 'bytes[]' },
    ],
    name: 'executeRoutes',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: 'controllerId', type: 'uint32' }],
    name: 'getController',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: 'routeId', type: 'uint32' }],
    name: 'getRoute',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'nominee_', type: 'address' }],
    name: 'nominateOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nominee',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address payable', name: 'userAddress', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'rescueEther',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'userAddress', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'rescueFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    name: 'routes',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'routesCount',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'routeAddresses', type: 'address[]' },
      { internalType: 'address[]', name: 'tokenAddresses', type: 'address[]' },
      { internalType: 'bool', name: 'isMax', type: 'bool' },
    ],
    name: 'setApprovalForRouters',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint32', name: 'swapRouteId', type: 'uint32' },
          { internalType: 'bytes', name: 'swapImplData', type: 'bytes' },
          {
            internalType: 'uint32[]',
            name: 'bridgeRouteIds',
            type: 'uint32[]',
          },
          {
            internalType: 'bytes[]',
            name: 'bridgeImplDataItems',
            type: 'bytes[]',
          },
          {
            internalType: 'uint256[]',
            name: 'bridgeRatios',
            type: 'uint256[]',
          },
          { internalType: 'bytes[]', name: 'eventDataItems', type: 'bytes[]' },
        ],
        internalType: 'struct ISocketRequest.SwapMultiBridgeRequest',
        name: 'swapMultiBridgeRequest',
        type: 'tuple',
      },
    ],
    name: 'swapAndMultiBridge',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
]

export const BUNGEE_APPROVE_AND_BRIDGE_V1_ABI = [
  {
    type: 'function',
    name: 'approveAndBridge',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'contract IERC20',
      },
      { name: 'minAmount', type: 'uint256', internalType: 'uint256' },
      {
        name: 'nativeTokenExtraFee',
        type: 'uint256',
        internalType: 'uint256',
      },
      { name: 'data', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
]
