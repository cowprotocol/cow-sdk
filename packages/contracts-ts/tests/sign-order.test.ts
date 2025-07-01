import { sepolia } from 'viem/chains'
import { createAdapters } from './setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  ContractsTs,
  ContractsOrder as Order,
  Swap,
  SwapEncoder,
  ContractsOrderKind as OrderKind,
  ContractsSigningScheme as SigningScheme,
  EncodedSwap,
} from '../src'

describe('SwapEncoder', () => {
  let adapters: ReturnType<typeof createAdapters>

  beforeAll(() => {
    adapters = createAdapters()
  })

  describe('encodeSwap', () => {
    const testSwap: Swap = {
      poolId: '0x0000000000000000000000000000000000000000000000000000000000000001',
      assetIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
      assetOut: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
      amount: '1000000000000000000', // 1 WETH
      userData: '0x',
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

    test('should consistently encode swaps across different adapters', async () => {
      // Encode the swap with each adapter
      const encodedSwaps = {} as {
        ethersV5: EncodedSwap
        ethersV6: EncodedSwap
        viem: EncodedSwap
      }

      // EthersV5 order
      setGlobalAdapter(adapters.ethersV5Adapter)
      encodedSwaps.ethersV5 = await SwapEncoder.encodeSwap(
        ContractsTs.domain(sepolia.id, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'),
        [testSwap],
        testOrder,
        SigningScheme.EIP712,
        adapters.ethersV5Adapter.signer,
      )

      // EthersV6 order
      setGlobalAdapter(adapters.ethersV6Adapter)
      encodedSwaps.ethersV6 = await SwapEncoder.encodeSwap(
        ContractsTs.domain(sepolia.id, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'),
        [testSwap],
        testOrder,
        SigningScheme.EIP712,
        adapters.ethersV6Adapter.signer,
      )

      // Viem order
      setGlobalAdapter(adapters.viemAdapter)
      encodedSwaps.viem = await SwapEncoder.encodeSwap(
        ContractsTs.domain(sepolia.id, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'),
        [testSwap],
        testOrder,
        SigningScheme.EIP712,
        adapters.viemAdapter.signer,
      )

      // Expect the swaps to be the equal across adapters
      expect(encodedSwaps.ethersV5).toBeDefined()
      expect(JSON.stringify(encodedSwaps.ethersV5)).toEqual(JSON.stringify(encodedSwaps.ethersV6))
      expect(JSON.stringify(encodedSwaps.ethersV5)).toEqual(JSON.stringify(encodedSwaps.viem))
    })
  })
})
