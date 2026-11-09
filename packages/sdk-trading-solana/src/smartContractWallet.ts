import { PublicKey } from '@solana/web3.js'

/**
 * Whether `owner` is program-owned rather than an ordinary keypair — the Solana counterpart of an EVM
 * smart contract wallet, a Squads multisig vault being the common case.
 *
 * Such an address is program-derived and has no private key: its authority exists only inside a CPI
 * from the program that owns it, which is why a vault's order reaches the chain nested in
 * `VaultTransactionExecute` rather than as a top-level instruction it signed itself. Program-derived
 * addresses are off the ed25519 curve by construction, and that is what tells them apart.
 *
 * `false` for anything that is not a Solana address at all, rather than throwing: a caller holding a
 * bare string often cannot know whether it is one, and `PublicKey.isOnCurve` answers a non-base58
 * input with `Non-base58 character`.
 */
export function isSolanaSmartContractWallet(owner: PublicKey | string): boolean {
  try {
    return !PublicKey.isOnCurve(owner)
  } catch {
    return false
  }
}
