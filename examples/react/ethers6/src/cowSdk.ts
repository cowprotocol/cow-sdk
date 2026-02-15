import { setGlobalAdapter, SupportedEvmChainId, TradingSdk } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from 'ethers'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'

export const chainId = SupportedEvmChainId.SEPOLIA

export const rpcProvider = new JsonRpcProvider('https://sepolia.gateway.tenderly.co', chainId)

export const cowSdkAdapter = new EthersV6Adapter({
  provider: rpcProvider,
})

setGlobalAdapter(cowSdkAdapter)

export const tradingSdk = new TradingSdk({
  chainId,
  appCode: 'CoWSdkReactExampleEthers6',
})
