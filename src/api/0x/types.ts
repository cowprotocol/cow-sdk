import { SupportedChainId } from '../../constants/chains'
// copy/pasting as the library types correspond to the internal types, not API response
// e.g "price: BigNumber" when we want the API response type: "price: string"
// see link below to see
// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
export interface GetSwapQuoteResponseLiquiditySource {
  name: string
  proportion: string
  intermediateToken?: string
  hops?: string[]
}

// https://github.com/0xProject/0x-api/blob/8c4cc7bb8d4fa06a220b7dfd5784361c05daa92a/src/types.ts#L229
export interface ZeroXBaseQuote {
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
export interface ZeroXPriceQuote extends ZeroXBaseQuote {
  sellTokenAddress: string
  buyTokenAddress: string
  value: string
  gas: string
}
