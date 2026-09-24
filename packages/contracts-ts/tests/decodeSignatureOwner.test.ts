import { createAdapters, TEST_ADDRESS } from './setup'
import { setGlobalAdapter, TypedDataDomain } from '@cowprotocol/sdk-common'
import {
  ContractsOrder as Order,
  ContractsOrderKind as OrderKind,
  ContractsSigningScheme as SigningScheme,
  decodeSignatureOwner,
  signOrder,
} from '../src'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'

describe('decodeSignatureOwner', () => {
  let adapters: ReturnType<typeof createAdapters>

  const testDomain: TypedDataDomain = {
    name: 'Cow Protocol',
    version: '1',
    chainId: 1,
    verifyingContract: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET],
  }

  const testOrder: Order = {
    sellToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    buyToken: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    sellAmount: '1000000000000000000', // 1 WETH
    buyAmount: '2000000000000000000000', // 2000 DAI
    validTo: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
    feeAmount: '5000000000000000', // 0.005 WETH
    kind: OrderKind.SELL,
    partiallyFillable: false,
  }

  beforeAll(() => {
    adapters = createAdapters()
  })

  describe('ETHSIGN scheme', () => {
    test.each(['ethersV5Adapter', 'ethersV6Adapter', 'viemAdapter'] as const)(
      'recovers the real signer for an ETHSIGN-signed order (%s)',
      async (adapterName) => {
        setGlobalAdapter(adapters[adapterName])

        const sig = await signOrder(testDomain, testOrder, SigningScheme.ETHSIGN, adapters[adapterName].signer)

        const recoveredOwner = await decodeSignatureOwner(testDomain, testOrder, SigningScheme.ETHSIGN, sig.data)

        expect(recoveredOwner.toLowerCase()).toEqual(TEST_ADDRESS.toLowerCase())
      },
    )
  })
})
