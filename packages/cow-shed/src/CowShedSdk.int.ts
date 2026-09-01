import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { CowShedSdk } from './CowShedSdk'
import { ICoWShedCall } from './types'
import { createAdapters } from '../tests/setup'

const CALLS: ICoWShedCall[] = [
  {
    target: '0x0000000000000000000000000000000000000000',
    value: 0n,
    callData: '0xabcdef',
    allowFailure: false,
    isDelegateCall: false,
  },
]

// CoW Shed 1.0.1 is not deployed to Sepolia.
test.skip('estimates gas with live Sepolia providers', async () => {
  const adapters = createAdapters()

  for (const adapter of Object.values(adapters)) {
    setGlobalAdapter(adapter)
    const call = await new CowShedSdk().signCalls({
      calls: CALLS,
      signer: adapter.signer,
      chainId: SupportedChainId.SEPOLIA,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 30 * 60),
    })

    expect(call.gasLimit).toBeGreaterThan(1)
  }
})
