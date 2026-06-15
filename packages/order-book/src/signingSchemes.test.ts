import { OrderKind, SigningScheme } from './generated'
import type { OrderCreation } from './generated'
import { EcdsaSigningScheme, type OrderCancellation, type OrderCancellations } from './signingSchemes'

/**
 * Regression tests for https://github.com/cowprotocol/cow-sdk/issues/187
 *
 * `EcdsaSigningScheme` must be a subset of `SigningScheme` so that the result of
 * `OrderSigningUtils.signOrder()` / `signOrderCancellations()` can be passed to
 * `OrderBookApi.sendOrder()` / `sendSignedOrderCancellations()` without a type error.
 *
 * The type-level `expectAssignable` checks below are enforced at compile time by
 * ts-jest, so a regression to two nominally-unrelated enums would fail the build.
 */
describe('EcdsaSigningScheme', () => {
  it('keeps the same runtime values as the matching SigningScheme members', () => {
    expect(EcdsaSigningScheme.EIP712).toBe(SigningScheme.EIP712)
    expect(EcdsaSigningScheme.ETHSIGN).toBe(SigningScheme.ETHSIGN)
    expect(Object.values(EcdsaSigningScheme)).toEqual([SigningScheme.EIP712, SigningScheme.ETHSIGN])
  })

  it('only exposes the ECDSA-compatible schemes', () => {
    expect(Object.values(EcdsaSigningScheme)).not.toContain(SigningScheme.PRESIGN)
    expect(Object.values(EcdsaSigningScheme)).not.toContain(SigningScheme.EIP1271)
  })

  it('is assignable to SigningScheme', () => {
    const expectAssignable = (_scheme: SigningScheme): void => undefined

    expectAssignable(EcdsaSigningScheme.EIP712)
    expectAssignable(EcdsaSigningScheme.ETHSIGN)

    const scheme: EcdsaSigningScheme = EcdsaSigningScheme.EIP712
    expectAssignable(scheme)
  })

  it('lets a signing result be spread into an OrderCreation body', () => {
    const signingResult: { signature: string; signingScheme: EcdsaSigningScheme } = {
      signature: '0x',
      signingScheme: EcdsaSigningScheme.EIP712,
    }

    const order = {
      sellToken: '0x0000000000000000000000000000000000000001',
      buyToken: '0x0000000000000000000000000000000000000002',
      receiver: '0x0000000000000000000000000000000000000003',
      sellAmount: '1',
      buyAmount: '1',
      validTo: 0,
      feeAmount: '0',
      kind: OrderKind.SELL,
      partiallyFillable: false,
      appData: '{}',
    }

    // Would fail to compile if EcdsaSigningScheme were not assignable to SigningScheme.
    const orderCreation: OrderCreation = { ...order, ...signingResult }

    expect(orderCreation.signingScheme).toBe(SigningScheme.EIP712)
  })

  it('lets a cancellation signing result be spread into the cancellation bodies', () => {
    const signingResult: { signature: string; signingScheme: EcdsaSigningScheme } = {
      signature: '0x',
      signingScheme: EcdsaSigningScheme.ETHSIGN,
    }

    const orderCancellation: OrderCancellation = { ...signingResult }
    const orderCancellations: OrderCancellations = { ...signingResult, orderUids: ['0x'] }

    expect(orderCancellation.signingScheme).toBe(SigningScheme.ETHSIGN)
    expect(orderCancellations.signingScheme).toBe(SigningScheme.ETHSIGN)
  })
})
