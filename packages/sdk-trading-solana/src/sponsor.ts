import { PublicKey } from '@solana/web3.js'
import { CowEnv, SOLANA_ORDER_SPONSOR, SOLANA_ORDER_SPONSOR_STAGING } from '@cowprotocol/sdk-config'

/**
 * The address that pays for sponsored orders in `env` — pass it as `sponsor` to
 * `buildSolanaSwapOrder`, and name it as the transaction's fee payer.
 *
 * Sponsorship stays opt-in: an order built without a `sponsor` is paid for by its owner, as before.
 */
export function getSolanaOrderSponsor(env?: CowEnv): PublicKey {
  return new PublicKey(env === 'staging' ? SOLANA_ORDER_SPONSOR_STAGING : SOLANA_ORDER_SPONSOR)
}
