import { SupportedChainId } from '../../constants/chains'
// copy/pasting as the library types correspond to the internal types, not API response
// e.g "price: BigNumber" when we want the API response type: "price: string"
// see link below to see
// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
interface GetSwapQuoteResponseLiquiditySource {
  name: string
  proportion: string
  intermediateToken?: string
  hops?: string[]
}

// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
interface MatchaBaseQuote {
  chainId: SupportedChainId
  price: string
  buyAmount: string
  sellAmount: string
  sources: GetSwapQuoteResponseLiquiditySource[]
  gasPrice: string
  estimatedGas: string
  sellTokenToEthRate: string
  buyTokenToEthRate: string
  protocolFee: string
  minimumProtocolFee: string
  allowanceTarget?: string
}

// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
export interface MatchaPriceQuote extends MatchaBaseQuote {
  sellTokenAddress: string
  buyTokenAddress: string
  value: string
  gas: string
}

export type MatchaOptions = {
  affiliateAddressMap: Partial<Record<number, string>>
  excludedSources: ERC20BridgeSource[]
}

// Excludable price sources
// from https://github.com/0xProject/protocol/blob/4f32f3174f25858644eae4c3de59c3a6717a757c/packages/asset-swapper/src/utils/market_operation_utils/types.ts#L38
export enum ERC20BridgeSource {
  Native = 'Native',
  Uniswap = 'Uniswap',
  UniswapV2 = 'Uniswap_V2',
  Eth2Dai = 'Eth2Dai',
  Kyber = 'Kyber',
  Curve = 'Curve',
  LiquidityProvider = 'LiquidityProvider',
  MultiBridge = 'MultiBridge',
  Balancer = 'Balancer',
  BalancerV2 = 'Balancer_V2',
  Cream = 'CREAM',
  Bancor = 'Bancor',
  MakerPsm = 'MakerPsm',
  MStable = 'mStable',
  Mooniswap = 'Mooniswap',
  MultiHop = 'MultiHop',
  Shell = 'Shell',
  Swerve = 'Swerve',
  SnowSwap = 'SnowSwap',
  SushiSwap = 'SushiSwap',
  Dodo = 'DODO',
  DodoV2 = 'DODO_V2',
  CryptoCom = 'CryptoCom',
  Linkswap = 'Linkswap',
  KyberDmm = 'KyberDMM',
  Smoothy = 'Smoothy',
  Component = 'Component',
  Saddle = 'Saddle',
  XSigma = 'xSigma',
  UniswapV3 = 'Uniswap_V3',
  CurveV2 = 'Curve_V2',
  Lido = 'Lido',
  ShibaSwap = 'ShibaSwap',
  Clipper = 'Clipper',
  // BSC only
  PancakeSwap = 'PancakeSwap',
  PancakeSwapV2 = 'PancakeSwap_V2',
  BakerySwap = 'BakerySwap',
  Nerve = 'Nerve',
  Belt = 'Belt',
  Ellipsis = 'Ellipsis',
  ApeSwap = 'ApeSwap',
  CafeSwap = 'CafeSwap',
  CheeseSwap = 'CheeseSwap',
  JulSwap = 'JulSwap',
  ACryptos = 'ACryptoS',
  // Polygon only
  QuickSwap = 'QuickSwap',
  ComethSwap = 'ComethSwap',
  Dfyn = 'Dfyn',
  WaultSwap = 'WaultSwap',
  Polydex = 'Polydex',
  FirebirdOneSwap = 'FirebirdOneSwap',
  JetSwap = 'JetSwap',
  IronSwap = 'IronSwap',
}
