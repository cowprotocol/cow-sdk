import type { SupportedChainId, TargetChainId } from '@cowprotocol/sdk-config'

export type SupportedBridge = 'across' | 'cctp' | 'gnosis-native-bridge'

export interface BungeeQuoteAPIRequest {
  userAddress: string
  originChainId: string
  destinationChainId: string
  inputToken: string
  inputAmount: string
  receiverAddress: string
  outputToken: string
  enableManual: true
  disableSwapping: true
  disableAuto: true
  includeBridges?: SupportedBridge[]
}

export interface BungeeQuoteAPIResponse {
  success: boolean
  statusCode: number
  result: {
    originChainId: number
    destinationChainId: number
    userAddress: string
    receiverAddress: string
    input: {
      token: {
        chainId: number
        address: string
        name: string
        symbol: string
        decimals: number
        logoURI: string
        icon: string
      }
      amount: string
      priceInUsd: number
      valueInUsd: number
    }
    destinationExec: unknown
    autoRoute: unknown
    manualRoutes: Array<{
      quoteId: string
      quoteExpiry: number
      output: {
        token: {
          chainId: number
          address: string
          name: string
          symbol: string
          decimals: number
          logoURI: string
          icon: string
        }
        amount: string
        priceInUsd: number
        valueInUsd: number
        minAmountOut: string
        effectiveReceivedInUsd: number
      }
      affiliateFee: unknown
      approvalData: {
        spenderAddress: string
        amount: string
        tokenAddress: string
        userAddress: string
      }
      gasFee: {
        gasToken: {
          chainId: number
          address: string
          symbol: string
          name: string
          decimals: number
          icon: string
          logoURI: string
          chainAgnosticId: unknown
        }
        gasLimit: string
        gasPrice: string
        estimatedFee: string
        feeInUsd: number
      }
      slippage: number
      estimatedTime: number
      routeDetails: {
        name: string
        logoURI: string
        routeFee: {
          token: {
            chainId: number
            address: string
            name: string
            symbol: string
            decimals: number
            logoURI: string
            icon: string
          }
          amount: string
          feeInUsd: number
          priceInUsd: number
        }
        dexDetails: unknown
      }
      refuel: unknown
    }>
  }
}

export enum BungeeBridge {
  'Across' = 'across',
  'CircleCCTP' = 'cctp',
  'GnosisNative' = 'gnosis-native-bridge',
}

// Map display names to enum values
export const BungeeBridgeNames: Record<string, BungeeBridge> = {
  Across: BungeeBridge.Across,
  'Circle CCTP': BungeeBridge.CircleCCTP,
  'Gnosis Native': BungeeBridge.GnosisNative,
}

export interface BungeeQuote {
  originChainId: number
  destinationChainId: number
  userAddress: string
  receiverAddress: string
  input: BungeeQuoteAPIResponse['result']['input']
  route: BungeeQuoteAPIResponse['result']['manualRoutes'][0]
  routeBridge: BungeeBridge
  quoteTimestamp: number
}

export type BungeeQuoteWithBuildTx = {
  bungeeQuote: BungeeQuote
  buildTx: BungeeBuildTx
}

export interface BungeeBuildTxAPIResponse {
  success: boolean
  statusCode: number
  result: {
    approvalData: {
      spenderAddress: string
      amount: string
      tokenAddress: string
      userAddress: string
    }
    txData: {
      data: string
      to: string
      chainId: number
      value: string
    }
    userOp: string
  }
}

export type BungeeBuildTx = BungeeBuildTxAPIResponse['result']

export interface InputAmountTxDataBytesIndices {
  inputAmount: {
    bytes_startIndex: number
    bytes_length: number
    bytesString_startIndex: number
    bytesString_length: number
  }
}

export interface OutputAmountTxDataBytesIndices {
  outputAmount: {
    bytes_startIndex: number
    bytes_length: number
    bytesString_startIndex: number
    bytesString_length: number
  }
}

export interface InputOutputAmountTxDataBytesIndices
  extends InputAmountTxDataBytesIndices,
    OutputAmountTxDataBytesIndices {}

export type BungeeTxDataBytesIndicesType = {
  [K in BungeeBridge]: {
    [functionSelector: string]: K extends BungeeBridge.Across
      ? InputOutputAmountTxDataBytesIndices
      : InputAmountTxDataBytesIndices
  }
}

export type SocketRequest = {
  amount: string
  recipient: string
  toChainId: string
  token: string
  signature: string
}

export type UserRequestValidation = {
  routeId: string
  socketRequest: SocketRequest
}

export enum BungeeEventStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
}

export enum BungeeBridgeName {
  ACROSS = 'across',
  CCTP = 'cctp',
}

export type BungeeEvent = {
  identifier: string
  // When srcTxStatus is PENDING the tx hash is undefined
  srcTransactionHash?: string
  bridgeName: BungeeBridgeName
  fromChainId: number
  gasUsed: string
  isCowswapTrade: boolean
  isSocketTx: boolean
  metadata: string
  orderId: string
  recipient: string
  sender: string
  socketContractVersion: string
  srcAmount: string
  srcBlockHash: string
  srcBlockNumber: number
  srcBlockTimeStamp: number
  srcTokenAddress: string
  srcTokenDecimals: number
  srcTokenLogoURI: string
  srcTokenName: string
  srcTokenSymbol: string
  to: string
  toChainId: number
  // When destTxStatus is PENDING the tx hash and destAmount are undefined
  destTransactionHash?: string
  destAmount?: string
  destBlockHash: string
  destBlockNumber: number
  destBlockTimeStamp: number
  destTokenAddress: string
  destTokenDecimals: number
  destTokenLogoURI: string
  destTokenName: string
  destTokenSymbol: string
  srcTxStatus: BungeeEventStatus
  destTxStatus: BungeeEventStatus
}
export type BungeeEventsAPIResponse = {
  success: boolean
  result: Array<BungeeEvent>
}

export interface AcrossStatusAPIResponse {
  status: 'filled' | 'pending' | 'expired' | 'refunded' | 'slowFillRequested'
  originChainId: string
  depositId: string
  depositTxHash?: string
  fillTx?: string
  destinationChainId?: string
  depositRefundTxHash?: string
  pagination?: {
    currentIndex: number
    maxIndex: number
  }
}

export type AcrossStatus = AcrossStatusAPIResponse['status']

export type BungeeBuyTokensAPIResponse = {
  success: boolean
  statusCode: number
  result: Array<{
    chainId: number
    address: string
    decimals: number
    name?: string
    symbol?: string
    logoURI?: string
    icon?: string
  }>
}

export type BungeeIntermediateTokensAPIResponse = {
  success: boolean
  statusCode: number
  result: Array<{
    chainId: number
    address: string
    name: string
    symbol: string
    decimals: number
    logoURI: string
    icon: string
  }>
}

export interface BungeeApiUrlOptions {
  apiBaseUrl: string
  manualApiBaseUrl: string
  eventsApiBaseUrl: string
  acrossApiBaseUrl: string
}

export interface BungeeApiOptions extends Partial<BungeeApiUrlOptions> {
  includeBridges?: SupportedBridge[]
  affiliate?: string
  fallbackTimeoutMs?: number
}

export interface IntermediateTokensParams {
  fromChainId: SupportedChainId
  toChainId: TargetChainId
  toTokenAddress: string
  includeBridges?: SupportedBridge[]
}

export interface GetBuyTokensParams {
  toChainId: string
  includeBridges: string
  fromChainId?: string
  fromTokenAddress?: string
}
