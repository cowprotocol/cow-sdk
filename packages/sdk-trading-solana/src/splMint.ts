import { PublicKey } from '@solana/web3.js'
import { SOL_NATIVE_CURRENCY_ADDRESS, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'

/** The chain's native-currency sentinel — the System Program address, which is not a token mint. */
const NATIVE_SOL_MINT = new PublicKey(SOL_NATIVE_CURRENCY_ADDRESS)
const WSOL_MINT = new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)

/**
 * Whether `mint` names native SOL rather than a real mint. The settlement program reads the same address
 * as `ENCODED_NATIVE_SOL_TRANSFER`, so an intent carrying it moves lamports instead of tokens.
 */
export function isNativeSolMint(mint: PublicKey): boolean {
  return mint.equals(NATIVE_SOL_MINT)
}

/**
 * Map native SOL to WSOL, and leave any other mint alone.
 *
 * Use it where native SOL needs a real mint, such as deriving a token account or asking a price feed.
 * Both have 9 decimals, so amounts carry over unchanged. Do not use it on order book requests: the
 * order book handles native SOL itself, and prices it differently.
 */
export function toSplMint(mint: PublicKey): PublicKey {
  return isNativeSolMint(mint) ? WSOL_MINT : mint
}
