import { EvmCall } from '@cowprotocol/sdk-config'

/**
 * Ensures the list matches the expected length for a hook provider (prefund + swap, single delegatecall, etc.).
 */
export function assertUnsignedBridgeCallsLength(
  unsignedCalls: readonly EvmCall[],
  expected: number,
  context: string,
): asserts unsignedCalls is [EvmCall, ...EvmCall[]] {

  if (unsignedCalls.some((call) => !call)) {
    throw new Error(`[${context}]: Unexpected empty call in unsigned bridge calls`)
  }

  const firstCall = unsignedCalls[0]

  if (!unsignedCalls.length || !firstCall) {
    throw new Error(`[${context}]: At least one unsigned bridge call is required`)
  }

  if (unsignedCalls.length !== expected) {
    throw new Error(
      `[${context}]: expected exactly ${expected} unsigned bridge call${expected === 1 ? '' : 's'}, got ${unsignedCalls.length}`,
    )
  }
}
