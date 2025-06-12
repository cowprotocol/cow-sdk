import { sepolia } from 'viem/chains'
import { createAdapters, TEST_ADDRESS, TEST_PRIVATE_KEY, TEST_RPC_URL } from './setup'
import { ethers as ethersV5 } from 'ethers-v5'
import * as ethersV6 from 'ethers-v6'
import { setGlobalAdapter, TypedDataDomain } from '@cowprotocol/sdk-common'
import {
  ContractsTs,
  ContractsOrder as Order,
  ContractsSignature as Signature,
  Swap,
  SwapEncoder,
  ContractsOrderKind as OrderKind,
  ContractsSigningScheme as SigningScheme,
  EncodedSwap,
} from '../src'
import { privateKeyToAccount } from 'viem/accounts'

import { createWalletClient, http } from 'viem'

describe('SwapEncoder', () => {
  let adapters: ReturnType<typeof createAdapters>
  let contracts: {
    ethersV5Contracts: ContractsTs
    ethersV6Contracts: ContractsTs
    viemContracts: ContractsTs
  }

  beforeAll(() => {
    adapters = createAdapters()
    contracts = {
      ethersV5Contracts: new ContractsTs(adapters.ethersV5Adapter),
      ethersV6Contracts: new ContractsTs(adapters.ethersV6Adapter),
      viemContracts: new ContractsTs(adapters.viemAdapter),
    }
  })

  describe('encodeSwap', () => {
    // Test data for swaps and orders
    const testDomain: TypedDataDomain = {
      name: 'Cow Protocol',
      version: '1',
      chainId: 1,
      verifyingContract: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41', // Example address
    }

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

    const mockSignature: Signature = {
      scheme: SigningScheme.EIP712,
      data: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef00',
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
      const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const ethersV5Wallet = new ethersV5.Wallet(TEST_PRIVATE_KEY, ethersV5Provider)
      encodedSwaps.ethersV5 = await SwapEncoder.encodeSwap(
        ContractsTs.domain(sepolia.id, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'),
        [testSwap],
        testOrder,
        ethersV5Wallet,
        SigningScheme.EIP712,
      )

      // EthersV6 order
      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
      const ethersV6Wallet = new ethersV6.Wallet(TEST_PRIVATE_KEY, ethersV6Provider)
      encodedSwaps.ethersV6 = await SwapEncoder.encodeSwap(
        ContractsTs.domain(sepolia.id, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'),
        [testSwap],
        testOrder,
        ethersV6Wallet,
        SigningScheme.EIP712,
      )

      // Viem order
      setGlobalAdapter(adapters.viemAdapter)
      const viemAccount = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`)
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: http(),
        account: viemAccount,
      })
      encodedSwaps.viem = await SwapEncoder.encodeSwap(
        ContractsTs.domain(sepolia.id, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'),
        [testSwap],
        testOrder,
        walletClient,
        SigningScheme.EIP712,
      )

      // Expect the swaps to be the equal across adapters
      expect(encodedSwaps.ethersV5).toBeDefined()
      expect(JSON.stringify(encodedSwaps.ethersV5)).toEqual(JSON.stringify(encodedSwaps.ethersV6))
      expect(JSON.stringify(encodedSwaps.ethersV5)).toEqual(JSON.stringify(encodedSwaps.viem))
    })
  })
})
