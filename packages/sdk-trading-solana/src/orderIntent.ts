import { PublicKey } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'

/**
 * TS port of `cow-settlement-interface`'s `OrderIntent` (interface/src/data/intent.rs, v0.3.0).
 * Every field here has a Rust counterpart with the same name; keep them in sync if the settlement
 * program's wire format changes.
 */
export interface SolanaOrderIntent {
  owner: PublicKey
  buyTokenAccount: PublicKey
  buyMint: PublicKey
  sellTokenAccount: PublicKey
  sellMint: PublicKey
  sellAmount: bigint
  buyAmount: bigint
  /** Unix timestamp seconds. */
  validTo: number
  kind: OrderKind
  partiallyFillable: boolean
  /**
   * Must be `true`: this is the flag the `CreateOrder` instruction authenticates against (the owner
   * signs the transaction themselves). The alternative — an off-chain Ed25519-presigned order anyone can
   * submit — is a different, unused authentication path.
   */
  createdOnChain: boolean
  /** Exactly 32 bytes, opaque to the settlement program. */
  appData: Uint8Array
}

/** Canonical byte size of an encoded `OrderIntent`, per `EncodedOrderIntent::SIZE` in the Rust source. */
export const ENCODED_ORDER_INTENT_SIZE = 213

const FLAG_CREATED_ON_CHAIN = 1 << 0
const FLAG_KIND_BUY = 1 << 1
const FLAG_PARTIALLY_FILLABLE = 1 << 2

/**
 * Encodes a `SolanaOrderIntent` into the 213-byte layout the settlement program reads, byte-for-byte
 * matching `EncodedOrderIntent::from(&OrderIntent)` in `cow-settlement-interface`.
 */
export function encodeOrderIntent(intent: SolanaOrderIntent): Uint8Array {
  if (intent.appData.length !== 32) {
    throw new Error('appData must be exactly 32 bytes')
  }

  const bytes = new Uint8Array(ENCODED_ORDER_INTENT_SIZE)
  const view = new DataView(bytes.buffer)
  let offset = 0

  const writePubkey = (pubkey: PublicKey): void => {
    bytes.set(pubkey.toBytes(), offset)
    offset += 32
  }
  const writeU64LE = (value: bigint): void => {
    view.setBigUint64(offset, value, true)
    offset += 8
  }

  writePubkey(intent.owner)
  writePubkey(intent.buyTokenAccount)
  writePubkey(intent.buyMint)
  writePubkey(intent.sellTokenAccount)
  writePubkey(intent.sellMint)
  writeU64LE(intent.sellAmount)
  writeU64LE(intent.buyAmount)

  view.setUint32(offset, intent.validTo, true)
  offset += 4

  let flags = 0
  if (intent.createdOnChain) flags |= FLAG_CREATED_ON_CHAIN
  if (intent.kind === OrderKind.BUY) flags |= FLAG_KIND_BUY
  if (intent.partiallyFillable) flags |= FLAG_PARTIALLY_FILLABLE
  bytes[offset] = flags
  offset += 1

  bytes.set(intent.appData, offset)

  return bytes
}

/**
 * SHA-256 of the encoded intent bytes — doubles as the order UID and the middle seed of the order PDA
 * (`OrderIntent::uid()` in the Rust source). Uses the Web Crypto API (available in both Node 20+ and
 * browsers) rather than a new hashing dependency.
 */
export async function hashOrderIntent(encoded: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return new Uint8Array(digest)
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
