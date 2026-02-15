import { SupportedEvmChainId, TradingSdk } from '@cowprotocol/cow-sdk'

export const tradingSdk = new TradingSdk({
  chainId: SupportedEvmChainId.MAINNET, // Default chain, can be changed JIT
  appCode: 'CoWSdkReactExampleWagmi',
})
