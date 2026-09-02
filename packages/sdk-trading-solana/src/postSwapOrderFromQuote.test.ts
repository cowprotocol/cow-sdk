import { Keypair, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'
import type { QuoteResults } from '@cowprotocol/sdk-trading'

import { postSolanaSwapOrderFromQuote } from './postSwapOrderFromQuote'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent, toHex } from './orderIntent'
import { findOrderPda } from './orderPda'
import { SolanaQuote } from './types'

function fillPubkey(byte: number): PublicKey {
  return new PublicKey(new Uint8Array(32).fill(byte))
}

async function buildFixtureQuote(buyTokenProgramId?: PublicKey): Promise<SolanaQuote> {
  const programId = fillPubkey(0x01)
  const intent: SolanaOrderIntent = {
    owner: fillPubkey(0x11),
    buyTokenAccount: fillPubkey(0x22),
    buyMint: fillPubkey(0x33),
    sellTokenAccount: fillPubkey(0x44),
    sellMint: fillPubkey(0x55),
    sellAmount: 100n,
    buyAmount: 200n,
    validTo: 1_700_000_000,
    kind: OrderKind.SELL,
    partiallyFillable: false,
    createdOnChain: true,
    appData: new Uint8Array(32),
  }
  const intentBytes = encodeOrderIntent(intent)
  const uid = await hashOrderIntent(intentBytes)
  const [orderPda] = findOrderPda(programId, uid)

  return {
    intent,
    intentBytes,
    uid,
    orderPda,
    programId,
    jupiterOrder: {
      inputMint: intent.sellMint.toBase58(),
      outputMint: intent.buyMint.toBase58(),
      inAmount: '100',
      outAmount: '200',
      swapMode: 'ExactIn',
      slippageBps: 0,
    },
    buyTokenProgramId,
  }
}

function buildFixtureQuoteResults(orderToSign: unknown = { fake: 'orderToSign' }): QuoteResults {
  return { orderToSign } as unknown as QuoteResults
}

describe('postSolanaSwapOrderFromQuote', () => {
  it('signs and sends the CreateOrder instruction, returning the order posting result', async () => {
    const solanaQuote = await buildFixtureQuote()
    const quoteResults = buildFixtureQuoteResults()
    const signAndSend = jest.fn().mockResolvedValue({ signature: 'fake-signature' })

    const result = await postSolanaSwapOrderFromQuote({ quoteResults, solanaQuote }, signAndSend)

    expect(signAndSend).toHaveBeenCalledTimes(1)
    const instruction = signAndSend.mock.calls[0][0]
    expect(instruction.programId.toBase58()).toBe(solanaQuote.programId.toBase58())
    expect(instruction.data[0]).toBe(2)

    expect(result).toEqual({
      orderId: toHex(solanaQuote.uid),
      txHash: 'fake-signature',
      signature: 'fake-signature',
      signingScheme: SigningScheme.PRESIGN,
      orderToSign: quoteResults.orderToSign,
    })
  })

  it('propagates a signAndSend rejection', async () => {
    const solanaQuote = await buildFixtureQuote()
    const quoteResults = buildFixtureQuoteResults()
    const signAndSend = jest.fn().mockRejectedValue(new Error('user rejected'))

    await expect(postSolanaSwapOrderFromQuote({ quoteResults, solanaQuote }, signAndSend)).rejects.toThrow(
      'user rejected',
    )
  })

  it('invokes signingStepManager hooks around signing', async () => {
    const solanaQuote = await buildFixtureQuote()
    const quoteResults = buildFixtureQuoteResults()
    const signAndSend = jest.fn().mockResolvedValue({ signature: 'fake-signature' })
    const calls: string[] = []
    const signingStepManager = {
      beforeOrderSign: jest.fn(() => {
        calls.push('before')
      }),
      afterOrderSign: jest.fn(() => {
        calls.push('after')
      }),
    }

    await postSolanaSwapOrderFromQuote({ quoteResults, solanaQuote }, signAndSend, undefined, signingStepManager)

    expect(signingStepManager.beforeOrderSign).toHaveBeenCalledTimes(1)
    expect(signingStepManager.afterOrderSign).toHaveBeenCalledTimes(1)
    expect(calls).toEqual(['before', 'after'])
  })

  it('overriding the receiver derives its associated token account and re-derives uid/orderPda to match', async () => {
    const buyTokenProgramId = TOKEN_2022_PROGRAM_ID
    const solanaQuote = await buildFixtureQuote(buyTokenProgramId)
    const quoteResults = buildFixtureQuoteResults()
    const signAndSend = jest.fn().mockResolvedValue({ signature: 'fake-signature' })
    const newReceiver = Keypair.generate().publicKey

    const result = await postSolanaSwapOrderFromQuote({ quoteResults, solanaQuote }, signAndSend, {
      quoteRequest: { receiver: newReceiver.toBase58() },
    })

    const expectedBuyTokenAccount = getAssociatedTokenAddressSync(
      solanaQuote.intent.buyMint,
      newReceiver,
      false,
      buyTokenProgramId,
    )
    const expectedIntent = { ...solanaQuote.intent, buyTokenAccount: expectedBuyTokenAccount }
    const expectedUid = await hashOrderIntent(encodeOrderIntent(expectedIntent))
    const [expectedOrderPda] = findOrderPda(solanaQuote.programId, expectedUid)

    const instruction = signAndSend.mock.calls[0][0]
    expect(Uint8Array.from(instruction.data.subarray(1))).toEqual(encodeOrderIntent(expectedIntent))
    expect(instruction.keys[2].pubkey.toBase58()).toBe(expectedOrderPda.toBase58())
    expect(instruction.keys[2].pubkey.toBase58()).not.toBe(solanaQuote.orderPda.toBase58())

    expect(result.orderId).toBe(toHex(expectedUid))
    expect(result.orderId).not.toBe(toHex(solanaQuote.uid))
  })

  it('overriding validTo re-derives uid/orderPda to match the posted intent', async () => {
    const solanaQuote = await buildFixtureQuote()
    const quoteResults = buildFixtureQuoteResults()
    const signAndSend = jest.fn().mockResolvedValue({ signature: 'fake-signature' })
    const newValidTo = solanaQuote.intent.validTo + 1_000

    const result = await postSolanaSwapOrderFromQuote({ quoteResults, solanaQuote }, signAndSend, {
      quoteRequest: { validTo: newValidTo },
    })

    const expectedIntent = { ...solanaQuote.intent, validTo: newValidTo }
    const expectedUid = await hashOrderIntent(encodeOrderIntent(expectedIntent))
    const [expectedOrderPda] = findOrderPda(solanaQuote.programId, expectedUid)

    const instruction = signAndSend.mock.calls[0][0]
    expect(instruction.keys[2].pubkey.toBase58()).toBe(expectedOrderPda.toBase58())
    expect(instruction.keys[2].pubkey.toBase58()).not.toBe(solanaQuote.orderPda.toBase58())

    expect(result.orderId).toBe(toHex(expectedUid))
    expect(result.orderId).not.toBe(toHex(solanaQuote.uid))
  })
})
