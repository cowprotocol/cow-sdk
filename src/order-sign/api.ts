import type { SupportedChainId } from '../common'
import type { Signer } from '@ethersproject/abstract-signer'
import type { TypedDataDomain } from '@cowprotocol/contracts'
import type { SigningResult, UnsignedOrder } from './types'

const getSignUtils = () => import('./signUtils')

export class OrderSignApi {
  async signOrder(order: UnsignedOrder, chainId: SupportedChainId, signer: Signer): Promise<SigningResult> {
    const { signOrder } = await getSignUtils()
    return signOrder(order, chainId, signer)
  }

  async signOrderCancellation(orderId: string, chainId: SupportedChainId, signer: Signer): Promise<SigningResult> {
    const { signOrderCancellation } = await getSignUtils()
    return signOrderCancellation(orderId, chainId, signer)
  }

  async getDomain(chainId: SupportedChainId): Promise<TypedDataDomain> {
    const { getDomain } = await getSignUtils()
    return getDomain(chainId)
  }
}
