import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { ethers as ethersV5 } from 'ethers-v5'
import * as ethersV6 from 'ethers-v6'
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

export type AdaptersTestSetup = {
  ethersV5Adapter: EthersV5Adapter
  ethersV6Adapter: EthersV6Adapter
  viemAdapter: ViemAdapter
}
const TEST_RPC_URL = 'https://sepolia.gateway.tenderly.co'
const TEST_PRIVATE_KEY = '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca'
// Helper function to create all adapters with the same configuration
export function createAdapters(): AdaptersTestSetup {
  // EthersV5 setup
  const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
  const ethersV5Wallet = new ethersV5.Wallet(TEST_PRIVATE_KEY, ethersV5Provider)
  const ethersV5Adapter = new EthersV5Adapter({ provider: ethersV5Provider, signer: ethersV5Wallet })

  // EthersV6 setup
  const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
  const ethersV6Wallet = new ethersV6.Wallet(TEST_PRIVATE_KEY, ethersV6Provider)
  const ethersV6Adapter = new EthersV6Adapter({ provider: ethersV6Provider, signer: ethersV6Wallet })

  // Viem setup with public client
  const viemAccount = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`)
  const viemAdapter = new ViemAdapter({
    provider: createPublicClient({
      chain: sepolia,
      transport: http(TEST_RPC_URL),
    }),
    signer: viemAccount,
  })
  return {
    ethersV5Adapter,
    ethersV6Adapter,
    viemAdapter,
  }
}
