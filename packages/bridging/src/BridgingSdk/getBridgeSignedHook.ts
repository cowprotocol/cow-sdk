import { EvmCall } from '@cowprotocol/sdk-config'
import { areAddressesEqual, getGlobalAdapter } from '@cowprotocol/sdk-common'

import { BridgeHook, BridgeQuoteResult, HookBridgeProvider, QuoteBridgeRequest } from '../types'
import { HookBridgeResultContext } from './getQuoteWithBridge'

/**
 * Gets the bridge hook for the order owner (`owner`, or `account` when not set).
 *
 * With a signer, the hook is signed, and the signer must be the order owner: the hook's cow-shed account (the order
 * receiver) is derived from the signer, so any other signer would send the swapped funds to an account the owner
 * doesn't control.
 * Without a signer, the hook carries a placeholder signature (good for quotes only).
 */
export async function getBridgeSignedHook(
  provider: HookBridgeProvider<BridgeQuoteResult>,
  bridgeRequest: QuoteBridgeRequest,
  { signer, hookGasLimit, swapResult, validToOverride }: HookBridgeResultContext,
): Promise<{ hook: BridgeHook; unsignedBridgeCall: EvmCall; bridgingQuote: BridgeQuoteResult }> {
  const adapter = getGlobalAdapter()
  const ownerAddress = bridgeRequest.owner ?? bridgeRequest.account

  // Get the quote for the bridging of the intermediate token to the final token
  const bridgingQuote = await provider.getQuote(bridgeRequest)

  // Get the bridging call
  const unsignedBridgeCall = await provider.getUnsignedBridgeCall(bridgeRequest, bridgingQuote)

  const deadline = BigInt(validToOverride ?? swapResult.orderToSign.validTo)
  const bridgeHookNonce = adapter.utils.solidityKeccak256(
    ['bytes', 'uint256'],
    [unsignedBridgeCall.data, deadline],
  ) as string

  const chainId = bridgeRequest.sellTokenChainId

  let hook: BridgeHook

  if (signer) {
    const signerAddress = await adapter.createSigner(signer).getAddress()

    if (!areAddressesEqual(signerAddress, ownerAddress)) {
      throw new Error(`Bridge hook signer ${signerAddress} does not match the order owner ${ownerAddress}`)
    }

    hook = await provider.getSignedHook(chainId, unsignedBridgeCall, bridgeHookNonce, deadline, hookGasLimit, signer)
  } else {
    hook = await provider.getUnsignedHook(
      chainId,
      unsignedBridgeCall,
      bridgeHookNonce,
      deadline,
      hookGasLimit,
      ownerAddress,
    )
  }

  return {
    hook,
    unsignedBridgeCall,
    bridgingQuote,
  }
}
