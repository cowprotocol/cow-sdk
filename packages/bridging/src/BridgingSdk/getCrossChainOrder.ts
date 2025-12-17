import { BridgeQuoteResult, BridgeStatus, CrossChainOrder, BridgeProvider } from '../types'

import { BridgeOrderParsingError } from '../errors'
import { findBridgeProviderFromHook } from './findBridgeProviderFromHook'
import { CowEnv, SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'

interface GetCrossChainOrderParams {
  chainId: SupportedChainId
  orderId: string
  orderBookApi: OrderBookApi
  providers: BridgeProvider<BridgeQuoteResult>[]
  env: CowEnv
}

/**
 * Fetch a cross-chain order and its status.
 */
export async function getCrossChainOrder(params: GetCrossChainOrderParams): Promise<CrossChainOrder | null> {
  const { chainId, orderId, orderBookApi, providers, env } = params

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
    const tradeTxHash = firstTrade?.txHash

    if (!tradeTxHash) {
      throw new BridgeOrderParsingError(
        `No tx hash found for order ${orderId} . First trade, with log index ${firstTrade?.logIndex}`,
      )
    }

    // Get bridging id for this order
    const { params: bridgingParams, status: statusResult } =
      (await provider.getBridgingParams(chainId, order, tradeTxHash)) || {}

    if (!bridgingParams || !statusResult) {
      throw new BridgeOrderParsingError(`Bridging params cannot be derived from transaction: ${tradeTxHash}`)
    }

    const state: CrossChainOrder = {
      provider,
      chainId,
      order,
      statusResult: {
        status: BridgeStatus.UNKNOWN,
      },
      bridgingParams,
      tradeTxHash,
    }

    try {
      const explorerUrl = provider.getExplorerUrl(bridgingParams.bridgingId)

      return {
        ...state,
        statusResult,
        explorerUrl,
      }
    } catch (e) {
      console.error('Cannot get bridging status', e)
      return state
    }
  }

  // Bridging not initiated yet
  return null
}
