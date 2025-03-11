import { ethers, Signer } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { SignerLike } from '../types/wallets'

export function getSigner(signer: SignerLike): Signer {
  if (typeof signer === 'string') return new ethers.Wallet(signer)

  if ('request' in signer || 'send' in signer) {
    const provider = new Web3Provider(signer)

    return provider.getSigner()
  }

  return signer as Signer
}
