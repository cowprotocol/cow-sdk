import { EvmCall } from '@cowprotocol/sdk-config'
import { AbstractProviderAdapter, getGlobalAdapter } from '@cowprotocol/sdk-common'

import { BridgeHook, BridgeQuoteResult, HookBridgeProvider, QuoteBridgeRequest } from '../types'
import { assertUnsignedBridgeCallsLength } from '../utils/assertUnsignedBridgeCallsLength'
import { HookBridgeResultContext } from './getQuoteWithBridge'

function encodeUnsignedBridgeCallsForHookNonce(
  unsignedBridgeCalls: EvmCall[],
  expectedCalls: number,
  adapter: AbstractProviderAdapter,
): string {
  assertUnsignedBridgeCallsLength(unsignedBridgeCalls, expectedCalls, 'encodeUnsignedBridgeCallsForHookNonce')

  const firstCall = unsignedBridgeCalls[0]

  if (unsignedBridgeCalls.length === 1) {
    return firstCall.data
  }

  return adapter.utils.encodeAbi(
    ['tuple(address,uint256,bytes)[]'],
    [unsignedBridgeCalls.map((c) => [c.to, c.value, c.data])],
  ) as string
}

interface GetBridgeSignedHookResult {
  hook: BridgeHook
  unsignedBridgeCalls: EvmCall[]
  bridgingQuote: BridgeQuoteResult
}

export async function getBridgeSignedHook(
  provider: HookBridgeProvider<BridgeQuoteResult>,
  bridgeRequest: QuoteBridgeRequest,
  { signer, hookGasLimit, swapResult, validToOverride }: HookBridgeResultContext,
): Promise<GetBridgeSignedHookResult> {
  const adapter = getGlobalAdapter()

  // Get the quote for the bridging of the intermediate token to the final token
  const bridgingQuote = await provider.getQuote(bridgeRequest)

  // Get the bridging call(s):
  const unsignedBridgeCalls = await provider.getUnsignedBridgeCalls(bridgeRequest, bridgingQuote)

  const deadline = BigInt(validToOverride ?? swapResult.orderToSign.validTo)
  const bridgeHookNonceInput = encodeUnsignedBridgeCallsForHookNonce(unsignedBridgeCalls, provider.unsignedBridgeHookCallsCount, adapter)
  const bridgeHookNonce = adapter.utils.solidityKeccak256(
    ['bytes', 'uint256'],
    [bridgeHookNonceInput, deadline],
  ) as string

  const hook = await provider.getSignedHook(
    bridgeRequest.sellTokenChainId,
    unsignedBridgeCalls,
    bridgeHookNonce,
    deadline,
    hookGasLimit,
    signer,
  )

  return {
    hook,
    unsignedBridgeCalls,
    bridgingQuote,
  }
}
