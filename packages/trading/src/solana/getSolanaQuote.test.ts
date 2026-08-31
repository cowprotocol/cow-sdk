import fetchMock from 'jest-fetch-mock'
import { PublicKey } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { SOLANA_SETTLEMENT_PROGRAM_ID } from '@cowprotocol/sdk-config'

import { getSolanaQuote } from './getSolanaQuote'
import { findOrderPda } from './orderPda'

fetchMock.enableMocks()

beforeEach(() => {
  fetchMock.mockClear()
})

describe('getSolanaQuote', () => {
  const owner = new PublicKey(new Uint8Array(32).fill(9))
  const sellMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
  const buyMint = new PublicKey('So11111111111111111111111111111111111111112')

  it('builds a quote from real Jupiter amounts', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        inputMint: sellMint.toBase58(),
        outputMint: buyMint.toBase58(),
        inAmount: '1000000000',
        outAmount: '9707507795',
        swapMode: 'ExactIn',
        slippageBps: 50,
      }),
    )

    const quote = await getSolanaQuote({ owner, sellMint, buyMint, amount: 1_000_000_000n, kind: OrderKind.SELL })

    expect(quote.intent.sellAmount).toBe(1_000_000_000n)
    expect(quote.intent.buyAmount).toBe(9_707_507_795n)
    expect(quote.intent.kind).toBe(OrderKind.SELL)
    expect(quote.intent.createdOnChain).toBe(true)
    expect(quote.intent.owner.toBase58()).toBe(owner.toBase58())
    expect(quote.jupiterOrder.slippageBps).toBe(50)
    expect(quote.uid.length).toBe(32)

    const programId = new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID)
    const [expectedPda] = findOrderPda(programId, quote.uid)
    expect(quote.orderPda.toBase58()).toBe(expectedPda.toBase58())
    expect(quote.programId.toBase58()).toBe(programId.toBase58())
  })

  it('requests an ExactOut quote for a BUY order', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        inputMint: sellMint.toBase58(),
        outputMint: buyMint.toBase58(),
        inAmount: '1000000000',
        outAmount: '9707507795',
        swapMode: 'ExactOut',
        slippageBps: 50,
      }),
    )

    await getSolanaQuote({ owner, sellMint, buyMint, amount: 9_707_507_795n, kind: OrderKind.BUY })

    const calledUrl = new URL(fetchMock.mock.calls[0]?.[0] as string)
    expect(calledUrl.searchParams.get('swapMode')).toBe('ExactOut')
  })

  it('derives different token accounts for Token-2022 mints than for classic SPL Token mints', async () => {
    const jupiterResponse = {
      inputMint: sellMint.toBase58(),
      outputMint: buyMint.toBase58(),
      inAmount: '1000000000',
      outAmount: '9707507795',
      swapMode: 'ExactIn',
      slippageBps: 50,
    }

    fetchMock.mockResponseOnce(JSON.stringify(jupiterResponse))
    const classicQuote = await getSolanaQuote({
      owner,
      sellMint,
      buyMint,
      amount: 1_000_000_000n,
      kind: OrderKind.SELL,
    })

    fetchMock.mockResponseOnce(JSON.stringify(jupiterResponse))
    const token2022Quote = await getSolanaQuote({
      owner,
      sellMint,
      buyMint,
      amount: 1_000_000_000n,
      kind: OrderKind.SELL,
      sellTokenProgramId: TOKEN_2022_PROGRAM_ID,
      buyTokenProgramId: TOKEN_2022_PROGRAM_ID,
    })

    expect(token2022Quote.intent.sellTokenAccount.toBase58()).not.toBe(
      classicQuote.intent.sellTokenAccount.toBase58(),
    )
    expect(token2022Quote.intent.buyTokenAccount.toBase58()).not.toBe(classicQuote.intent.buyTokenAccount.toBase58())
  })
})
