import { PublicKey } from '@solana/web3.js'

import { decodeSolanaOrderAccount, ENCODED_ORDER_ACCOUNT_SIZE } from './orderAccount'

const CREATED_BY = new PublicKey(new Uint8Array(32).fill(0x11))

function buildAccountData(overrides: { cancelled?: number; discriminator?: number } = {}): Uint8Array {
  const data = new Uint8Array(ENCODED_ORDER_ACCOUNT_SIZE)

  data[0] = overrides.discriminator ?? 0x80
  data[1] = 255
  data[2] = overrides.cancelled ?? 0
  data.set(CREATED_BY.toBytes(), 19)

  return data
}

describe('decodeSolanaOrderAccount', () => {
  it('reads the cancelled flag and the rent recipient', () => {
    expect(decodeSolanaOrderAccount(buildAccountData({ cancelled: 1 }))).toEqual({
      cancelled: true,
      createdBy: CREATED_BY,
    })
    expect(decodeSolanaOrderAccount(buildAccountData()).cancelled).toBe(false)
  })

  it('reads the recipient out of a view onto a larger buffer', () => {
    const framed = new Uint8Array(ENCODED_ORDER_ACCOUNT_SIZE + 8)
    framed.set(buildAccountData({ cancelled: 1 }), 8)

    const account = decodeSolanaOrderAccount(framed.subarray(8))

    expect(account.createdBy.toBase58()).toBe(CREATED_BY.toBase58())
  })

  it('rejects data that is not an order account', () => {
    expect(() => decodeSolanaOrderAccount(new Uint8Array(10))).toThrow(/must be exactly 264 bytes/)
    expect(() => decodeSolanaOrderAccount(buildAccountData({ discriminator: 0x81 }))).toThrow(/discriminator/)
    expect(() => decodeSolanaOrderAccount(buildAccountData({ cancelled: 2 }))).toThrow(/cancelled flag/)
  })
})
