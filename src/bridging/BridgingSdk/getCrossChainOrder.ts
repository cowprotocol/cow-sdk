import { BridgeProvider, BridgeQuoteResult, CrossChainOrder } from '../types'

import { CowEnv } from '../../common'
import { JsonRpcProvider } from '@ethersproject/providers'
import { BridgeOrderParsingError } from '../errors'
import { SupportedChainId } from '../../chains'
import { OrderBookApi } from '../../order-book'
import { findBridgeProviderFromHook } from './findBridgeProviderFromHook'

interface GetCrossChainOrderParams {
  chainId: SupportedChainId
  orderId: string
  rpcProvider: JsonRpcProvider
  orderBookApi: OrderBookApi
  providers: BridgeProvider<BridgeQuoteResult>[]
  env: CowEnv
}

/**
 * Fetch a cross-chain order and its status.
 */
export async function getCrossChainOrder(params: GetCrossChainOrderParams): Promise<CrossChainOrder | null> {
  const { chainId, orderId, orderBookApi, providers, rpcProvider, env } = params

  const chainContext = { chainId, env }
  const order = await orderBookApi.getOrder(orderId, chainContext)

  // Find the provider by name (note that I could just have use this.provider, but just wanted to leave it ready in case we implement multiple providers)
  const provider = order.fullAppData && findBridgeProviderFromHook(order.fullAppData, providers)
  if (!provider) {
    throw new BridgeOrderParsingError(
      `Unknown Bridge provider in order ${order.uid}. Add provider to the SDK config to be able to decode the order`,
    )
  }

  // TODO: We might want to decode the bridge appData (reverse the encoding of the call in the provider)
  //const bridgeDeposit = await provider.decodeBridgeHook(bridgingHook)

  // Check if there are any trades for this order
  const trades = await orderBookApi.getTrades({ orderUid: order.uid }, chainContext)

  if (trades.length > 0) {
    // Bridging already initiated
    const firstTrade = trades[0]
    const tradeTxHash = firstTrade.txHash

    if (!tradeTxHash) {
      throw new BridgeOrderParsingError(
        `No tx hash found for order ${orderId} . First trade, with log index ${firstTrade.logIndex}`,
      )
    }

    // Get bridging id for this order
    const bridgingParams = await provider.getBridgingParams(chainId, rpcProvider, orderId, tradeTxHash)

    if (!bridgingParams) {
      throw new BridgeOrderParsingError(`Bridging params cannot be derived from transaction: ${tradeTxHash}`)
    }

    const { status, fillTimeInSeconds } = await provider.getStatus(bridgingParams.bridgingId, chainId)
    const explorerUrl = provider.getExplorerUrl(bridgingParams.bridgingId)

    return {
      chainId,
      order,
      status,
      bridgingParams,
      tradeTxHash,
      explorerUrl,
      fillTimeInSeconds,
    }
  }

  // Bridging not initiated yet
  return null
}
