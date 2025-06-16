import { solidityKeccak256 } from 'ethers/lib/utils'

import { EvmCall } from '../../common'
import { getOrderDeadlineFromNow } from '../../common/utils/order'

import { BridgeHook, BridgeQuoteResult, QuoteBridgeRequest } from '../types'
import { BridgeResultContext } from './types'
import { BRIDGE_HOOK_VALIDITY } from '../const'

export async function getBridgeSignedHook(
  bridgeRequest: QuoteBridgeRequest,
  { provider, signer, defaultGasLimit }: BridgeResultContext,
): Promise<{ hook: BridgeHook; unsignedBridgeCall: EvmCall; bridgingQuote: BridgeQuoteResult }> {
  // Get the quote for the bridging of the intermediate token to the final token
  const bridgingQuote = await provider.getQuote(bridgeRequest)

  // Get the bridging call
  const unsignedBridgeCall = await provider.getUnsignedBridgeCall(bridgeRequest, bridgingQuote)

  const deadline = getOrderDeadlineFromNow(BRIDGE_HOOK_VALIDITY)
  const bridgeHookNonce = solidityKeccak256(['bytes', 'uint256'], [unsignedBridgeCall.data, deadline])

  const hook = await provider.getSignedHook(
    bridgeRequest.sellTokenChainId,
    unsignedBridgeCall,
    signer,
    bridgeHookNonce,
    deadline,
    defaultGasLimit,
  )

  return {
    hook,
    unsignedBridgeCall,
    bridgingQuote,
  }
}
