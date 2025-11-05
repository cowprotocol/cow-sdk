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
  SupportedChainId,
} from '@cowprotocol/sdk-config'

const DEFAULT_RPC_URL: Record<SupportedChainId, string | undefined> = {
  [SupportedChainId.MAINNET]: mainnet.rpcUrls.default.http[0],
  [SupportedChainId.GNOSIS_CHAIN]: gnosisChain.rpcUrls.default.http[0],
  [SupportedChainId.ARBITRUM_ONE]: arbitrumOne.rpcUrls.default.http[0],
  [SupportedChainId.BASE]: base.rpcUrls.default.http[0],
  [SupportedChainId.SEPOLIA]: sepolia.rpcUrls.default.http[0],
  [SupportedChainId.POLYGON]: polygon.rpcUrls.default.http[0],
  [SupportedChainId.AVALANCHE]: avalanche.rpcUrls.default.http[0],
  [SupportedChainId.LENS]: lens.rpcUrls.default.http[0],
  [SupportedChainId.BNB]: bnb.rpcUrls.default.http[0],
  [SupportedChainId.LINEA]: linea.rpcUrls.default.http[0],
  [SupportedChainId.PLASMA]: plasma.rpcUrls.default.http[0],
}

export async function getRpcProvider(chainId: SupportedChainId) {
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

export async function getWallet(chainId: SupportedChainId) {
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
