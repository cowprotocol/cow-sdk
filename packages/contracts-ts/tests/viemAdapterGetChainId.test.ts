import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { createPublicClient, http } from 'viem'

import { TEST_CHAIN_ID, TEST_RPC_URL } from './setup'

describe('ViemAdapter.getChainId', () => {
  test('queries the live RPC instead of relying on a statically configured `chain`', async () => {
    // No `chain` passed to createPublicClient - a valid, common viem setup (e.g. a custom
    // RPC endpoint with no matching entry in viem/chains). `this._publicClient.chain` is
    // `undefined` in this case, so a naive `chain?.id ?? 0` implementation silently returns 0.
    const viemAdapter = new ViemAdapter({
      provider: createPublicClient({
        transport: http(TEST_RPC_URL),
      }),
    })

    const chainId = await viemAdapter.getChainId()

    expect(chainId).toBe(TEST_CHAIN_ID)
  })
})
