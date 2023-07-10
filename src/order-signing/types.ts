import type { SupportedChainId } from '../common'
import type { Signer } from '@ethersproject/abstract-signer'
import type { OrderParameters, EcdsaSigningScheme } from '../order-book'

/**
 * Unsigned order intent to be placed.
 */
export type UnsignedOrder = Omit<OrderParameters, 'receiver'> & { receiver: string }

/**
 * Encoded signature including signing scheme for the order.
 */
export type SigningResult = { signature: string; signingScheme: EcdsaSigningScheme }

/**
 * Parameters for signing an order intent.
 * @param chainId The CoW Protocol `chainId` context that's being used.
 * @param signer The signer who is placing the order intent.
 * @param order The unsigned order intent to be placed.
 * @param signingScheme The signing scheme to use for the signature.
 */
export interface SignOrderParams {
  chainId: SupportedChainId
  signer: Signer
  order: UnsignedOrder
  signingScheme: EcdsaSigningScheme
}

/**
 * Parameters for signing an order cancellation.
 * @param chainId The CoW Protocol `chainId` context that's being used.
 * @param signer The signer who initially placed the order intent.
 * @param orderUid The unique identifier of the order to cancel.
 * @param signingScheme The signing scheme to use for the signature.
 */
export interface SignOrderCancellationParams {
  chainId: SupportedChainId
  signer: Signer
  orderUid: string
  signingScheme: EcdsaSigningScheme
}

/**
 * Parameters for signing multiple bulk order cancellations.
 * @param chainId The CoW Protocol `chainId` context that's being used.
 * @param signer The signer who initially placed the order intents.
 * @param orderUids An array of `orderUid` to cancel.
 * @param signingScheme The signing scheme to use for the signature.
 */
export interface SignOrderCancellationsParams {
  chainId: SupportedChainId
  signer: Signer
  orderUids: string[]
  signingScheme: EcdsaSigningScheme
}
