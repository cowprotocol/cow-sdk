import { ethers } from 'ethers'
import {
  arbitrumOne,
  avalanche,
  base,
  bnb,
  gnosisChain,
  lens,
  linea,
  mainnet,
  plasma,
  polygon,
  sepolia,
  ink,
  SupportedEvmChainId,
} from '@cowprotocol/sdk-config'

const DEFAULT_RPC_URL: Record<SupportedEvmChainId, string | undefined> = {
  [SupportedEvmChainId.MAINNET]: mainnet.rpcUrls.default.http[0],
  [SupportedEvmChainId.GNOSIS_CHAIN]: gnosisChain.rpcUrls.default.http[0],
  [SupportedEvmChainId.ARBITRUM_ONE]: arbitrumOne.rpcUrls.default.http[0],
  [SupportedEvmChainId.BASE]: base.rpcUrls.default.http[0],
  [SupportedEvmChainId.SEPOLIA]: sepolia.rpcUrls.default.http[0],
  [SupportedEvmChainId.POLYGON]: polygon.rpcUrls.default.http[0],
  [SupportedEvmChainId.AVALANCHE]: avalanche.rpcUrls.default.http[0],
  [SupportedEvmChainId.LENS]: lens.rpcUrls.default.http[0],
  [SupportedEvmChainId.BNB]: bnb.rpcUrls.default.http[0],
  [SupportedEvmChainId.LINEA]: linea.rpcUrls.default.http[0],
  [SupportedEvmChainId.PLASMA]: plasma.rpcUrls.default.http[0],
  [SupportedEvmChainId.INK]: ink.rpcUrls.default.http[0],
}

export async function getRpcProvider(chainId: SupportedEvmChainId) {
  const rpcUrl = DEFAULT_RPC_URL[chainId]
  if (!rpcUrl) {
    throw new Error(`No RPC URL found for chain ${chainId}. Please define env ${chainId}`)
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

  // Make sure the specified provider is for the correct chain
  const { chainId: providerChainId, name: providerName } = await provider.getNetwork()

  if (providerChainId !== chainId) {
    throw new Error(
      `Provider is not connected to chain ${chainId}. Provider is connected to chain ${providerChainId} (${providerName})`,
    )
  }

  return provider
}

export async function getWallet(chainId: SupportedEvmChainId) {
  const pk = getPk()
  return pk ? new ethers.Wallet(pk, await getRpcProvider(chainId)) : null
}

export function getPk() {
  const pk = process.env.PRIVATE_KEY
  if (!pk) {
    console.warn('PRIVATE_KEY is not set')
    return undefined
  }

  return pk
}
