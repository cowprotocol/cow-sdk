import { setGlobalAdapter, SupportedChainId, TradingSdk } from '@cowprotocol/cow-sdk'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

export const chainId = SupportedChainId.SEPOLIA

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http('https://sepolia.gateway.tenderly.co'),
})

export const cowSdkAdapter = new ViemAdapter({
  provider: publicClient,
})

setGlobalAdapter(cowSdkAdapter)

export const tradingSdk = new TradingSdk({
  chainId,
  appCode: 'CoWSdkReactExampleViem',
})
