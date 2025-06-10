import { AbstractProviderAdapter } from '@cowprotocol/sdk-common'
import { sepolia as sepoliaConfig } from '@cowprotocol/sdk-config'

import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { ethers as ethersV5 } from 'ethers-v5'
import * as ethersV6 from 'ethers-v6'
import { createWalletClient, http, WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

// Configuration
// SOME RANDOM GENERATED PRIVATE KEY
export const TEST_PRIVATE_KEY = '0x4de4739ebdab31d6a36e5ecef027c6ab2fd1a80cf2692c3861ba1ccfeb6cf8b8'
export const TEST_RPC_URL = sepoliaConfig.rpcUrls.default.http[0]
export const TEST_CHAIN_ID = 11155111
export const ethersV5Wallet = new ethersV5.Wallet(TEST_PRIVATE_KEY)
export const TEST_ADDRESS = ethersV5Wallet.address
export const MOCK_TX_PARAMS = {
  to: '0x1234567890123456789012345678901234567890',
  data: '0x',
  value: '1000000000000000000',
}

// Helper function to create all adapters with the same configuration
export function createAdapters(): {
  ethersV5Adapter: EthersV5Adapter
  ethersV6Adapter: EthersV6Adapter
  viemAdapter: ViemAdapter
} {
  // EthersV5 setup
  const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
  const ethersV5Wallet = new ethersV5.Wallet(TEST_PRIVATE_KEY, ethersV5Provider)
  const ethersV5Adapter = new EthersV5Adapter(ethersV5Wallet)

  // EthersV6 setup
  const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
  const ethersV6Wallet = new ethersV6.Wallet(TEST_PRIVATE_KEY, ethersV6Provider)
  const ethersV6Adapter = new EthersV6Adapter(ethersV6Wallet)

  const viemAccount = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`)
  const viemAdapter = new ViemAdapter(sepolia, http(), viemAccount)

  return {
    ethersV5Adapter,
    ethersV6Adapter,
    viemAdapter,
  }
}

// Helper function to create wallets for each adapter
export function createWallets(): {
  ethersV5: { adapter: AbstractProviderAdapter; wallet: ethersV5.Wallet }
  ethersV6: { adapter: AbstractProviderAdapter; wallet: ethersV6.Wallet }
  viem: { adapter: AbstractProviderAdapter; wallet: WalletClient }
} {
  const adapters = createAdapters()

  const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
  const ethersV5Wallet = new ethersV5.Wallet(TEST_PRIVATE_KEY, ethersV5Provider)

  const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
  const ethersV6Wallet = new ethersV6.Wallet(TEST_PRIVATE_KEY, ethersV6Provider)

  const viemAccount = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`)
  const viemWallet = createWalletClient({
    chain: sepolia,
    transport: http(),
    account: viemAccount,
  })

  return {
    ethersV5: { adapter: adapters.ethersV5Adapter, wallet: ethersV5Wallet },
    ethersV6: { adapter: adapters.ethersV6Adapter, wallet: ethersV6Wallet },
    viem: { adapter: adapters.viemAdapter, wallet: viemWallet },
  }
}
