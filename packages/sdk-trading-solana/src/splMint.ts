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
 * CoW Protocol's quote addresses tokens by SPL mint and native SOL has none — asking for the sentinel is
 * answered with `NoLiquidity`. Callers pass the sentinel, so substitute WSOL, the same adjustment
 * `getQuote` makes for EVM eth-flow orders via `adjustEthFlowOrderParams`. Both have 9 decimals, so
 * amounts carry over unchanged.
 *
 * The two sides then diverge, and the intent is where that shows:
 *
 * - Selling native SOL, the substitution has to reach the intent too. `sellTokenAccount` is the
 *   associated token account of this mint, and only the WSOL one can ever hold the wrapped lamports the
 *   caller's wrap step produces.
 * - Buying native SOL, it must not. Since v0.4.1 the settlement program pays the buy side out as
 *   lamports, so the intent keeps the sentinel and names a plain account rather than a token account.
 */
export function toSplMint(mint: PublicKey): PublicKey {
  return isNativeSolMint(mint) ? WSOL_MINT : mint
}
