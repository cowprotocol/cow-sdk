import { Web3Provider } from '@ethersproject/providers'
import { SignerLike } from '../types/wallets'
import { Signer } from '@ethersproject/abstract-signer'
import { Wallet } from '@ethersproject/wallet'
export function getSigner(signer: SignerLike): Signer {
  if (typeof signer === 'string') return new Wallet(signer)

  if ('request' in signer || 'send' in signer) {
    const provider = new Web3Provider(signer)

    return provider.getSigner()
  }

  return signer as Signer
}
