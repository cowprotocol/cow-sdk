import { PublicKey } from '@solana/web3.js'
import { SOL_NATIVE_CURRENCY_ADDRESS, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'

import { isNativeSolMint, toSplMint } from './splMint'

describe('isNativeSolMint', () => {
  it('recognises the native SOL sentinel', () => {
    expect(isNativeSolMint(new PublicKey(SOL_NATIVE_CURRENCY_ADDRESS))).toBe(true)
  })

  it('does not treat WSOL as native, so a wrapped trade keeps its token account', () => {
    expect(isNativeSolMint(new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address))).toBe(false)
  })

  it('rejects an ordinary SPL mint', () => {
    expect(isNativeSolMint(new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'))).toBe(false)
  })
})

describe('toSplMint', () => {
  const wsolMint = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address

  it('substitutes WSOL for the native SOL sentinel', () => {
    expect(toSplMint(new PublicKey(SOL_NATIVE_CURRENCY_ADDRESS)).toBase58()).toBe(wsolMint)
  })

  it('leaves an SPL mint untouched', () => {
    const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

    expect(toSplMint(new PublicKey(usdcMint)).toBase58()).toBe(usdcMint)
  })

  it('leaves WSOL itself untouched, so an explicit WSOL trade is not rewritten', () => {
    expect(toSplMint(new PublicKey(wsolMint)).toBase58()).toBe(wsolMint)
  })
})
