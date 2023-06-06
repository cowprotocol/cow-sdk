import type { SupportedChainId } from '../common'
import type { Signer } from '@ethersproject/abstract-signer'
import type { OrderParameters, EcdsaSigningScheme } from '../order-book'

export type UnsignedOrder = Omit<OrderParameters, 'receiver'> & { receiver: string }

export type SigningResult = { signature: string; signingScheme: EcdsaSigningScheme }

export interface SignOrderParams {
  chainId: SupportedChainId
  signer: Signer
  order: UnsignedOrder
  signingScheme: EcdsaSigningScheme
}

export interface SignOrderCancellationParams {
  chainId: SupportedChainId
  signer: Signer
  orderId: string
  signingScheme: EcdsaSigningScheme
}

export interface SignOrderCancellationsParams {
  chainId: SupportedChainId
  signer: Signer
  orderUids: string[]
  signingScheme: EcdsaSigningScheme
}
