import { sepolia as sepoliaConfig } from '@cowprotocol/sdk-config'

import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { ethers as ethersV5 } from 'ethers-v5'
import * as ethersV6 from 'ethers-v6'
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

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

export type AdaptersTestSetup = {
  ethersV5Adapter: EthersV5Adapter
  ethersV6Adapter: EthersV6Adapter
  viemAdapter: ViemAdapter
}

// Function to create specific adapters for testing
export function createSpecificAdapters(adapterNames: string[]): Partial<AdaptersTestSetup> {
  const adapters: Partial<AdaptersTestSetup> = {}

  if (adapterNames.includes('ethersV5Adapter')) {
    const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
    const ethersV5Wallet = new ethersV5.Wallet(TEST_PRIVATE_KEY, ethersV5Provider)
    adapters.ethersV5Adapter = new EthersV5Adapter({ provider: ethersV5Provider, signer: ethersV5Wallet })
  }

  if (adapterNames.includes('ethersV6Adapter')) {
    const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
    const ethersV6Wallet = new ethersV6.Wallet(TEST_PRIVATE_KEY, ethersV6Provider)
    adapters.ethersV6Adapter = new EthersV6Adapter({ provider: ethersV6Provider, signer: ethersV6Wallet })
  }

  if (adapterNames.includes('viemAdapter')) {
    const viemAccount = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`)
    adapters.viemAdapter = new ViemAdapter({
      provider: createPublicClient({
        chain: sepolia,
        transport: http(TEST_RPC_URL),
      }),
      signer: viemAccount,
    })
  }

  return adapters
}
