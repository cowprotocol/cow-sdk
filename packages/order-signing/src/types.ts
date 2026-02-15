import type { SignerLike } from '@cowprotocol/sdk-common'
import { SupportedEvmChainId } from '@cowprotocol/sdk-config'
import type { OrderParameters, EcdsaSigningScheme } from '@cowprotocol/sdk-order-book'

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
  chainId: SupportedEvmChainId
  signer: SignerLike
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
  chainId: SupportedEvmChainId
  signer: SignerLike
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
  chainId: SupportedEvmChainId
  signer: SignerLike
  orderUids: string[]
  signingScheme: EcdsaSigningScheme
}
