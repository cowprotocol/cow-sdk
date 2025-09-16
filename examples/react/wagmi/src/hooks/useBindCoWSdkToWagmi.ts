import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { useEffect, useState } from 'react'
import { ViemAdapter, ViemAdapterOptions } from '@cowprotocol/sdk-viem-adapter'
import { tradingSdk } from '../cowSdk.ts'
import { setGlobalAdapter } from '@cowprotocol/cow-sdk'

export function useBindCoWSdkToWagmi(): boolean {
  const account = useAccount()
  const { chainId } = account
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [isSdkReady, setIsSdkReady] = useState(false)

  /**
   * Sync Trading SDK with wagmi account state (chainId and signer)
   */
  useEffect(() => {
    if (!walletClient || !chainId) {
      setIsSdkReady(false)
      return
    }

    setGlobalAdapter(
      new ViemAdapter({
        provider: publicClient,
        walletClient,
      } as unknown as ViemAdapterOptions),
    )

    tradingSdk.setTraderParams({ chainId })

    setIsSdkReady(true)

    return () => {
      setIsSdkReady(false)
    }
  }, [publicClient, walletClient, chainId])

  return isSdkReady
}
