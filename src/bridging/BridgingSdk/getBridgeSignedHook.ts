import { keccak256 } from 'ethers/lib/utils'

import { EvmCall } from '../../common'
import { unsignedOrderForSigning } from '../../common/utils/order'
import { OrderSigningUtils } from '../../order-signing'

import { BridgeHook, BridgeQuoteResult, QuoteBridgeRequest } from '../types'
import { BridgeResultContext } from './types'

export async function getBridgeSignedHook(
  bridgeRequest: QuoteBridgeRequest,
  { swapResult, provider, signer, defaultGasLimit }: BridgeResultContext,
): Promise<{ hook: BridgeHook; unsignedBridgeCall: EvmCall; bridgingQuote: BridgeQuoteResult }> {
  // Get the quote for the bridging of the intermediate token to the final token
  const bridgingQuote = await provider.getQuote(bridgeRequest)

  // Get the bridging call
  const unsignedBridgeCall = await provider.getUnsignedBridgeCall(bridgeRequest, bridgingQuote)

  const owner = swapResult.tradeParameters.owner || (await signer.getAddress())
  const { orderId } = await OrderSigningUtils.generateOrderId(
    bridgeRequest.sellTokenChainId,
    unsignedOrderForSigning(swapResult.orderToSign),
    {
      owner,
    },
  )

  const bridgeHookNonce = keccak256(orderId)

  const hook = await provider.getSignedHook(
    bridgeRequest.sellTokenChainId,
    unsignedBridgeCall,
    signer,
    bridgeHookNonce,
    defaultGasLimit,
  )

  return {
    hook,
    unsignedBridgeCall,
    bridgingQuote,
  }
}
