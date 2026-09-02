import { PublicKey } from '@solana/web3.js'
import { OrderKind } from '@cowprotocol/sdk-order-book'

import { encodeOrderIntent, ENCODED_ORDER_INTENT_SIZE, hashOrderIntent, SolanaOrderIntent, toHex } from './orderIntent'

// Fixture ported verbatim from `cow-settlement-interface`'s own regression tests
// (interface/src/data/intent.rs `sample_intent` + `encoding_regression`/`uid_digest_regression`),
// so this test proves the TS port produces byte-identical output to the Rust program's own encoder.
function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

const SAMPLE_INTENT: SolanaOrderIntent = {
  owner: fillPubkey(0x11),
  buyTokenAccount: fillPubkey(0x22),
  buyMint: fillPubkey(0x33),
  sellTokenAccount: fillPubkey(0x44),
  sellMint: fillPubkey(0x55),
  sellAmount: 0x0123_4567_89ab_cdefn,
  buyAmount: 0xfedc_ba98_7654_3210n,
  validTo: 0xdead_beef,
  kind: OrderKind.BUY,
  partiallyFillable: true,
  createdOnChain: true,
  appData: new Uint8Array(32).fill(0x66),
}

describe('encodeOrderIntent', () => {
  it('produces the 213-byte canonical layout the settlement program expects', () => {
    const encoded = encodeOrderIntent(SAMPLE_INTENT)

    expect(encoded.length).toBe(ENCODED_ORDER_INTENT_SIZE)
    expect(Array.from(encoded.subarray(0, 32))).toEqual(new Array(32).fill(0x11)) // owner
    expect(Array.from(encoded.subarray(32, 64))).toEqual(new Array(32).fill(0x22)) // buy_token_account
    expect(Array.from(encoded.subarray(64, 96))).toEqual(new Array(32).fill(0x33)) // buy_mint
    expect(Array.from(encoded.subarray(96, 128))).toEqual(new Array(32).fill(0x44)) // sell_token_account
    expect(Array.from(encoded.subarray(128, 160))).toEqual(new Array(32).fill(0x55)) // sell_mint
    expect(toHex(encoded.subarray(160, 168))).toBe('efcdab8967452301') // sell_amount, LE
    expect(toHex(encoded.subarray(168, 176))).toBe('1032547698badcfe') // buy_amount, LE
    expect(toHex(encoded.subarray(176, 180))).toBe('efbeadde') // valid_to, LE
    expect(encoded[180]).toBe(0b0000_0111) // flags: created_on_chain | kind(Buy=1<<1) | partially_fillable
    expect(Array.from(encoded.subarray(181, 213))).toEqual(new Array(32).fill(0x66)) // app_data
  })

  it('rejects app_data that is not exactly 32 bytes', () => {
    expect(() => encodeOrderIntent({ ...SAMPLE_INTENT, appData: new Uint8Array(31) })).toThrow(
      'appData must be exactly 32 bytes',
    )
  })

  it('accepts validTo at the uint32 boundaries', () => {
    expect(() => encodeOrderIntent({ ...SAMPLE_INTENT, validTo: 0 })).not.toThrow()
    expect(() => encodeOrderIntent({ ...SAMPLE_INTENT, validTo: 0xffffffff })).not.toThrow()
  })

  it('rejects a negative validTo instead of wrapping', () => {
    expect(() => encodeOrderIntent({ ...SAMPLE_INTENT, validTo: -1 })).toThrow('validTo must be an integer')
  })

  it('rejects a validTo above the uint32 range instead of silently wrapping modulo 2^32', () => {
    // DataView.setUint32 would otherwise wrap this to 0, encoding an intent that never expires.
    expect(() => encodeOrderIntent({ ...SAMPLE_INTENT, validTo: 0x1_0000_0000 })).toThrow('validTo must be an integer')
  })
})

describe('hashOrderIntent', () => {
  it("matches the settlement program's own SHA-256 digest for the sample intent", async () => {
    const encoded = encodeOrderIntent(SAMPLE_INTENT)
    const uid = await hashOrderIntent(encoded)

    expect(toHex(uid)).toBe('de4096c6c100056f1e4636ea4fafefad40fc1d0b37692fe3ca1e0db3644b86bd')
  })
})
