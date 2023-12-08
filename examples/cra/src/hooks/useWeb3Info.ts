import { useEffect, useState } from 'react'
import { Web3Provider } from '@ethersproject/providers'

const provider = new Web3Provider(window.ethereum)

// Connect to injected wallet
;(window.ethereum as {enable(): void})?.enable()

export interface Web3Info {
  provider: Web3Provider
  chainId: number
  account: string
}

export function useWeb3Info(): Web3Info {
  const [chainId, setChainId] = useState(5)
  const [account, setAccount] = useState<string>('')

  useEffect(() => {
    provider.on('network', (network) => {
      setChainId(+network.chainId)
    })
    provider.listAccounts().then((accounts: string[]) => {
      setAccount(accounts[0])
    })
  }, [setChainId, setAccount])

  return { chainId, account, provider }
}
