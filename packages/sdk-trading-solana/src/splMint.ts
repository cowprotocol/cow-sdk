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
 * Quotes address tokens by SPL mint and native SOL has none, so the sentinel is answered with
 * `NoLiquidity` and WSOL stands in — both have 9 decimals, so amounts carry over unchanged. Only the
 * sell side carries the substitution into the intent, since a native sell is wrapped first; a native buy
 * is paid out as lamports and keeps the sentinel.
 */
export function toSplMint(mint: PublicKey): PublicKey {
  return isNativeSolMint(mint) ? WSOL_MINT : mint
}
