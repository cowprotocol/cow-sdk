import { Keypair, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'
import type { QuoteResults } from '@cowprotocol/sdk-trading'

import { buildSolanaSwapOrder } from './buildSwapOrder'
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

describe('buildSolanaSwapOrder', () => {
  it('builds the CreateOrder instruction for the quoted intent', async () => {
    const solanaQuote = await buildFixtureQuote()
    const quoteResults = buildFixtureQuoteResults()

    const order = await buildSolanaSwapOrder({ quoteResults, solanaQuote })

    expect(order.instruction.programId.toBase58()).toBe(solanaQuote.programId.toBase58())
    expect(order.instruction.data[0]).toBe(2)
    expect(Uint8Array.from(order.instruction.data.subarray(1))).toEqual(solanaQuote.intentBytes)
  })

  it('returns the order identity and scheme alongside the instruction', async () => {
    const solanaQuote = await buildFixtureQuote()
    const quoteResults = buildFixtureQuoteResults()

    const order = await buildSolanaSwapOrder({ quoteResults, solanaQuote })

    expect(order.orderId).toBe(toHex(solanaQuote.uid))
    expect(order.uid).toEqual(solanaQuote.uid)
    expect(order.orderPda.toBase58()).toBe(solanaQuote.orderPda.toBase58())
    expect(order.intent).toEqual(solanaQuote.intent)
    expect(order.signingScheme).toBe(SigningScheme.PRESIGN)
    expect(order.orderToSign).toBe(quoteResults.orderToSign)
  })

  it('funds the order rent from the owner, so a single wallet signs the whole transaction', async () => {
    const solanaQuote = await buildFixtureQuote()

    const order = await buildSolanaSwapOrder({ quoteResults: buildFixtureQuoteResults(), solanaQuote })

    // accounts[0] is the owner/authenticator, accounts[1] the rent payer (`createdBy`).
    const accounts = order.instruction.keys.map((key) => key.pubkey.toBase58())
    const ownerBase58 = solanaQuote.intent.owner.toBase58()

    expect(accounts.slice(0, 2)).toEqual([ownerBase58, ownerBase58])
  })

  it('leaves the quoted intent untouched', async () => {
    const solanaQuote = await buildFixtureQuote()
    const originalValidTo = solanaQuote.intent.validTo

    await buildSolanaSwapOrder({ quoteResults: buildFixtureQuoteResults(), solanaQuote }, {
      quoteRequest: { validTo: originalValidTo + 1_000 },
    })

    expect(solanaQuote.intent.validTo).toBe(originalValidTo)
  })

  it('overriding the receiver derives its associated token account and re-derives uid/orderPda to match', async () => {
    const buyTokenProgramId = TOKEN_2022_PROGRAM_ID
    const solanaQuote = await buildFixtureQuote(buyTokenProgramId)
    const newReceiver = Keypair.generate().publicKey

    const order = await buildSolanaSwapOrder({ quoteResults: buildFixtureQuoteResults(), solanaQuote }, {
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

    expect(order.intent.buyTokenAccount.toBase58()).toBe(expectedBuyTokenAccount.toBase58())
    expect(Uint8Array.from(order.instruction.data.subarray(1))).toEqual(encodeOrderIntent(expectedIntent))
    expect(order.orderPda.toBase58()).toBe(expectedOrderPda.toBase58())
    expect(order.orderPda.toBase58()).not.toBe(solanaQuote.orderPda.toBase58())
    expect(order.orderId).toBe(toHex(expectedUid))
    expect(order.orderId).not.toBe(toHex(solanaQuote.uid))
  })

  it('overriding validTo re-derives uid/orderPda to match the posted intent', async () => {
    const solanaQuote = await buildFixtureQuote()
    const newValidTo = solanaQuote.intent.validTo + 1_000

    const order = await buildSolanaSwapOrder({ quoteResults: buildFixtureQuoteResults(), solanaQuote }, {
      quoteRequest: { validTo: newValidTo },
    })

    const expectedIntent = { ...solanaQuote.intent, validTo: newValidTo }
    const expectedUid = await hashOrderIntent(encodeOrderIntent(expectedIntent))
    const [expectedOrderPda] = findOrderPda(solanaQuote.programId, expectedUid)

    expect(order.intent.validTo).toBe(newValidTo)
    expect(order.orderPda.toBase58()).toBe(expectedOrderPda.toBase58())
    expect(order.orderPda.toBase58()).not.toBe(solanaQuote.orderPda.toBase58())
    expect(order.orderId).toBe(toHex(expectedUid))
  })

  it('keeps the quoted uid/orderPda when advancedSettings overrides nothing relevant', async () => {
    const solanaQuote = await buildFixtureQuote()

    const order = await buildSolanaSwapOrder({ quoteResults: buildFixtureQuoteResults(), solanaQuote }, {
      quoteRequest: {},
    })

    expect(order.orderId).toBe(toHex(solanaQuote.uid))
    expect(order.orderPda.toBase58()).toBe(solanaQuote.orderPda.toBase58())
  })
})
