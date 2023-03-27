import type { SupportedChainId } from '../common'
import type { Signer } from 'ethers'
import type { OrderParameters, EcdsaSigningScheme } from '../order-book'

export type UnsignedOrder = Omit<OrderParameters, 'receiver'> & { receiver: string }

export type SigningResult = { signature: string; signingScheme: EcdsaSigningScheme }

export interface SignOrderParams {
  chainId: SupportedChainId
  signer: Signer
  order: UnsignedOrder
  signingScheme: EcdsaSigningScheme
}

export interface SingOrderCancellationParams {
  chainId: SupportedChainId
  signer: Signer
  orderId: string
  signingScheme: EcdsaSigningScheme
}
