import { PublicKey } from '@solana/web3.js'
import { SOL_NATIVE_CURRENCY_ADDRESS, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'

/** The chain's native-currency sentinel — the System Program address, which is not a token mint. */
const NATIVE_SOL_MINT = new PublicKey(SOL_NATIVE_CURRENCY_ADDRESS)
const WSOL_MINT = new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)

/**
 * Jupiter routes and the settlement intent both address tokens by SPL mint, and native SOL has none.
 * Callers pass the native sentinel, so substitute WSOL — the same adjustment `getQuote` makes for EVM
 * eth-flow orders via `adjustEthFlowOrderParams`. Both have 9 decimals, so amounts carry over unchanged.
 *
 * This has to happen before the order intent is built, not just before the Jupiter call: the intent's
 * `sellTokenAccount` is the associated token account of this mint, and only the WSOL one can ever hold
 * the wrapped lamports the caller's wrap step produces.
 */
export function toSplMint(mint: PublicKey): PublicKey {
  return mint.equals(NATIVE_SOL_MINT) ? WSOL_MINT : mint
}
