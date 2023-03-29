import type { SupportedChainId } from '../common'
import type { Signer } from 'ethers'
import type { TypedDataDomain } from '@cowprotocol/contracts'
import type { SigningResult, UnsignedOrder } from './types'

const getSignUtils = () => import('./utils')

export class OrderSigningUtils {
  static async signOrder(order: UnsignedOrder, chainId: SupportedChainId, signer: Signer): Promise<SigningResult> {
    const { signOrder } = await getSignUtils()
    return signOrder(order, chainId, signer)
  }

  static async signOrderCancellation(
    orderId: string,
    chainId: SupportedChainId,
    signer: Signer
  ): Promise<SigningResult> {
    const { signOrderCancellation } = await getSignUtils()
    return signOrderCancellation(orderId, chainId, signer)
  }

  static async signOrderCancellations(
    orderUid: string[],
    chainId: SupportedChainId,
    signer: Signer
  ): Promise<SigningResult> {
    const { signOrderCancellations } = await getSignUtils()
    return signOrderCancellations(orderUid, chainId, signer)
  }

  static async getDomain(chainId: SupportedChainId): Promise<TypedDataDomain> {
    const { getDomain } = await getSignUtils()
    return getDomain(chainId)
  }
}
