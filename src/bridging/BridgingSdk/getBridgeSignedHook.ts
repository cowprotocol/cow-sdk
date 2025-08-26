import { solidityKeccak256 } from 'ethers/lib/utils'

import { EvmCall } from '../../common'

import { BridgeHook, BridgeQuoteResult, QuoteBridgeRequest } from '../types'
import { BridgeResultContext } from './types'

export async function getBridgeSignedHook(
  bridgeRequest: QuoteBridgeRequest,
  { provider, signer, hookGasLimit, swapResult, validToOverride }: BridgeResultContext,
): Promise<{ hook: BridgeHook; unsignedBridgeCall: EvmCall; bridgingQuote: BridgeQuoteResult }> {
  // Get the quote for the bridging of the intermediate token to the final token
  const bridgingQuote = await provider.getQuote(bridgeRequest)

  // Get the bridging call
  const unsignedBridgeCall = await provider.getUnsignedBridgeCall(bridgeRequest, bridgingQuote)

  const deadline = BigInt(validToOverride || swapResult.orderToSign.validTo)
  const bridgeHookNonce = solidityKeccak256(['bytes', 'uint256'], [unsignedBridgeCall.data, deadline])

  const hook = await provider.getSignedHook(
    bridgeRequest.sellTokenChainId,
    unsignedBridgeCall,
    signer,
    bridgeHookNonce,
    deadline,
    hookGasLimit,
  )

  return {
    hook,
    unsignedBridgeCall,
    bridgingQuote,
  }
}
