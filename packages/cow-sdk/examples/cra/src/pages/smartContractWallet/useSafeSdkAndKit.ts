import {useEffect, useState} from 'react'
import Safe, {EthersAdapter} from '@safe-global/protocol-kit'
import {ethers} from 'ethers'
import SafeApiKit from '@safe-global/api-kit'
import {SAFE_TRANSACTION_SERVICE_URL} from './const'
import {SupportedChainId} from '@cowprotocol/cow-sdk'
import {Web3Provider} from '@ethersproject/providers'

export function useSafeSdkAndKit(safeAddress: string | null, chainId: SupportedChainId, provider: Web3Provider) {
  const [safeSdk, setSafeSdk] = useState<Safe | null>(null)
  const [safeApiKit, setSafeApiKit] = useState<SafeApiKit | null>(null)

  useEffect(() => {
    const txServiceUrl = SAFE_TRANSACTION_SERVICE_URL[chainId]

    if (!safeAddress) return

    if (!txServiceUrl) {
      console.error('Unsupported chainId', chainId)
      return
    }

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: provider.getSigner(0),
    })

    const safeApiKit = new SafeApiKit({
      txServiceUrl,
      ethAdapter
    })

    setSafeApiKit(safeApiKit)

    Safe.create({ethAdapter, safeAddress}).then(setSafeSdk).catch(console.error)
  }, [chainId, provider, safeAddress])

  return { safeSdk, safeApiKit }
}
