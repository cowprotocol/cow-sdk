import { setGlobalAdapter, SupportedEvmChainId, TradingSdk } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from '@ethersproject/providers'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'

export const chainId = SupportedEvmChainId.SEPOLIA

export const rpcProvider = new JsonRpcProvider('https://sepolia.gateway.tenderly.co', chainId)

export const cowSdkAdapter = new EthersV5Adapter({
  provider: rpcProvider,
})

setGlobalAdapter(cowSdkAdapter)

export const tradingSdk = new TradingSdk({
  chainId,
  appCode: 'CoWSdkReactExampleEthers5',
  signer: rpcProvider.getSigner(),
})
