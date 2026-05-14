import {
  SigningScheme,
  type OrderCancellation as GeneratedOrderCancellation,
  type OrderCancellations as GeneratedOrderCancellations,
} from './generated'

/**
 * The subset of {@link SigningScheme} values that can be produced by signing an
 * order with an ECDSA key (i.e. `eip712` and `ethsign`).
 *
 * The orderbook OpenAPI spec models `EcdsaSigningScheme` and `SigningScheme` as
 * two independent string enums. When generated as TypeScript `enum`s they become
 * nominally unrelated types, so an `EcdsaSigningScheme` value is not assignable
 * to a `SigningScheme` field even though every `EcdsaSigningScheme` value is a
 * valid `SigningScheme` value.
 *
 * This caused a type error in the documented low-level flow, where the result of
 * `OrderSigningUtils.signOrder()` (which carries `EcdsaSigningScheme`) is spread
 * into the `OrderCreation` body of `OrderBookApi.sendOrder()` (which expects
 * `SigningScheme`):
 *
 * ```ts
 * const { quote } = await orderBookApi.getQuote(quoteRequest)
 * const orderSigningResult = await OrderSigningUtils.signOrder(quote, chainId, signer)
 * // previously failed: EcdsaSigningScheme not assignable to SigningScheme
 * const orderId = await orderBookApi.sendOrder({ ...quote, ...orderSigningResult })
 * ```
 *
 * To fix this `EcdsaSigningScheme` is defined here as a genuine subset of
 * `SigningScheme` rather than a standalone enum. It keeps the same runtime values
 * and member names, so existing usages (`EcdsaSigningScheme.EIP712`,
 * `Record<EcdsaSigningScheme, T>`, etc.) keep working, while values are now
 * assignable to `SigningScheme`.
 *
 * @see https://github.com/cowprotocol/cow-sdk/issues/187
 */
export const EcdsaSigningScheme = {
  EIP712: SigningScheme.EIP712,
  ETHSIGN: SigningScheme.ETHSIGN,
} as const

/**
 * How was the order signed?
 *
 * Subset of {@link SigningScheme} restricted to the schemes produced by ECDSA
 * signing (`eip712` and `ethsign`). Values are assignable to `SigningScheme`.
 */
export type EcdsaSigningScheme = (typeof EcdsaSigningScheme)[keyof typeof EcdsaSigningScheme]

/**
 * Data a user provides when cancelling a single order.
 *
 * Re-typed on top of the generated `OrderCancellation` so its `signingScheme`
 * uses the {@link EcdsaSigningScheme} subset of `SigningScheme`. This keeps the
 * result of `OrderSigningUtils.signOrderCancellation()` directly assignable to
 * this type.
 *
 * @see https://github.com/cowprotocol/cow-sdk/issues/187
 */
export type OrderCancellation = Omit<GeneratedOrderCancellation, 'signingScheme'> & {
  signingScheme: EcdsaSigningScheme
}

/**
 * Data a user provides when cancelling multiple orders.
 *
 * Re-typed on top of the generated `OrderCancellations` so its `signingScheme`
 * uses the {@link EcdsaSigningScheme} subset of `SigningScheme`. This keeps the
 * result of `OrderSigningUtils.signOrderCancellations()` directly assignable to
 * this type.
 *
 * @see https://github.com/cowprotocol/cow-sdk/issues/187
 */
export type OrderCancellations = Omit<GeneratedOrderCancellations, 'signingScheme'> & {
  signingScheme: EcdsaSigningScheme
}
