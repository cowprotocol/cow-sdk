import { SupportedChainId, TradingSdk } from '@cowprotocol/cow-sdk'

export const tradingSdk = new TradingSdk({
  chainId: SupportedChainId.MAINNET, // Default chain, can be changed JIT
  appCode: 'CoWSdkReactExampleWagmi',
})
