import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  SupportedChainId,
} from '@cowprotocol/sdk-config'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createSignerlessAdapters } from '../tests/setup'
import { getPreSignCallData } from './getPreSignCallData'

const chainId = SupportedChainId.GNOSIS_CHAIN
const orderUid =
  '0xd64389693b6cf89ad6c140a113b10df08073e5ef3063d05a02f3f42e1a42f0ad0b7795e18767259cc253a2af471dbc4c72b49516ffffffff'
const expectedData =
  '0xec6cb13f000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000038d64389693b6cf89ad6c140a113b10df08073e5ef3063d05a02f3f42e1a42f0ad0b7795e18767259cc253a2af471dbc4c72b49516ffffffff0000000000000000'

describe('getPreSignCallData', () => {
  const adapters = createSignerlessAdapters()

  it('returns the same calldata for every signer-less adapter', () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]
      expect(adapter.signerOrNull()).toBeNull()
      setGlobalAdapter(adapter)

      expect(getPreSignCallData(chainId, orderUid)).toEqual({
        to: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
        data: expectedData,
        value: '0',
      })
    }
  })

  it('uses the staging settlement contract address', () => {
    setGlobalAdapter(adapters.ethersV5Adapter)

    expect(getPreSignCallData(chainId, orderUid, { env: 'staging' }).to).toBe(
      COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[chainId],
    )
  })

  it('prioritizes a custom settlement contract over the environment', () => {
    const customAddress = '0x1111111111111111111111111111111111111111'
    setGlobalAdapter(adapters.ethersV5Adapter)

    expect(
      getPreSignCallData(chainId, orderUid, {
        env: 'staging',
        settlementContractOverride: { [chainId]: customAddress },
      }).to,
    ).toBe(customAddress)
  })
})
