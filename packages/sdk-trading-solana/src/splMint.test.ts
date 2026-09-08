import { PublicKey } from '@solana/web3.js'
import { SOL_NATIVE_CURRENCY_ADDRESS, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'

import { toSplMint } from './splMint'

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
