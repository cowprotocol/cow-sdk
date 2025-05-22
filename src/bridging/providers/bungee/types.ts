export type SupportedBridge = 'across' | 'cctp'

export interface BungeeQuoteAPIRequest {
  userAddress: string
  originChainId: string
  destinationChainId: string
  inputToken: string
  inputAmount: string
  receiverAddress: string
  outputToken: string
  enableManual: true
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
    destinationExec: any
    autoRoute: any
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
      affiliateFee: any
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
          chainAgnosticId: any
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
        dexDetails: any
      }
      refuel: any
    }>
  }
}

export interface BungeeQuote {
  originChainId: number
  destinationChainId: number
  userAddress: string
  receiverAddress: string
  input: BungeeQuoteAPIResponse['result']['input']
  route: BungeeQuoteAPIResponse['result']['manualRoutes'][0]
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
