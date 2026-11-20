import { PublicKey } from '@solana/web3.js'

import { ENCODED_ORDER_INTENT_SIZE } from './orderIntent'

/** First byte of every order PDA's data, per `EncodedOrderAccount::DISCRIMINATOR` in the Rust source. */
const ORDER_ACCOUNT_DISCRIMINATOR = 0x80

const OFFSET_CANCELLED = 2
const OFFSET_CREATED_BY = 19
/** Header fields (discriminator, bump, cancelled, filled amounts) in front of the embedded intent. */
const ORDER_ACCOUNT_HEADER_SIZE = 51

/** Byte size of an order PDA's data, per `EncodedOrderAccount::SIZE` in the Rust source. */
export const ENCODED_ORDER_ACCOUNT_SIZE = ORDER_ACCOUNT_HEADER_SIZE + ENCODED_ORDER_INTENT_SIZE

export interface SolanaOrderAccount {
  cancelled: boolean
  /** Funded the PDA's rent, and the only account `ReclaimOrder` will pay it back to. */
  createdBy: PublicKey
}

/**
 * Decodes the header an order PDA carries in front of its intent, matching `EncodedOrderAccount` in
 * cow-settlement-interface. Throws when `data` is not an order account, so whatever decodes can be
 * treated as a live order.
 */
export function decodeSolanaOrderAccount(data: Uint8Array): SolanaOrderAccount {
  if (data.length !== ENCODED_ORDER_ACCOUNT_SIZE) {
    throw new Error(`Order account must be exactly ${ENCODED_ORDER_ACCOUNT_SIZE} bytes, got ${data.length}`)
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)

  if (view.getUint8(0) !== ORDER_ACCOUNT_DISCRIMINATOR) {
    throw new Error('Account data does not carry the order discriminator')
  }

  const cancelled = view.getUint8(OFFSET_CANCELLED)

  if (cancelled > 1) {
    throw new Error(`Order account carries an invalid cancelled flag: ${cancelled}`)
  }

  return {
    cancelled: cancelled === 1,
    createdBy: new PublicKey(data.subarray(OFFSET_CREATED_BY, OFFSET_CREATED_BY + 32)),
  }
}
