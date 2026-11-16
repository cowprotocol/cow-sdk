import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

/**
 * Associated token account of `owner` for `mint`.
 *
 * Derived with `allowOwnerOffCurve`: an owner or receiver may be a program address rather than a
 * keypair — a multisig vault is a PDA, so it is off the ed25519 curve by construction — and the default
 * guard rejects one with `TokenOwnerOffCurveError`. That guard only ever caught a token account passed
 * where an owner belongs, which it cannot do reliably anyway, since a token account can be on-curve.
 *
 * `tokenProgram` is required on purpose. The address is a PDA of `(owner, tokenProgram, mint)`, so
 * defaulting it silently names an account that cannot exist for a Token-2022 mint — an order carrying
 * one is created on chain and can never settle, because the settlement only creates the account the
 * mint's own program derives.
 */
export function deriveAta(mint: PublicKey, owner: PublicKey, tokenProgram: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(mint, owner, true, tokenProgram)
}
