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
  const receiver = new PublicKey(new Uint8Array(32).fill(10))
  const sellMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
  const buyMint = new PublicKey('So11111111111111111111111111111111111111112')
  const sellTokenDecimals = 6
  const buyTokenDecimals = 9

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

    const { solanaQuote, quoteResults } = await getSolanaQuote({
      ownerAddress: owner,
      receiverAddress: receiver,
      sellTokenAddress: sellMint,
      sellTokenDecimals,
      buyTokenAddress: buyMint,
      buyTokenDecimals,
      amount: 1_000_000_000n,
      kind: OrderKind.SELL,
    })

    expect(solanaQuote.intent.sellAmount).toBe(1_000_000_000n)
    expect(solanaQuote.intent.buyAmount).toBe(9_707_507_795n)
    expect(solanaQuote.intent.kind).toBe(OrderKind.SELL)
    expect(solanaQuote.intent.createdOnChain).toBe(true)
    expect(solanaQuote.intent.owner.toBase58()).toBe(owner.toBase58())
    expect(solanaQuote.jupiterOrder.slippageBps).toBe(50)
    expect(solanaQuote.uid.length).toBe(32)

    const programId = new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID)
    const [expectedPda] = findOrderPda(programId, solanaQuote.uid)
    expect(solanaQuote.orderPda.toBase58()).toBe(expectedPda.toBase58())
    expect(solanaQuote.programId.toBase58()).toBe(programId.toBase58())

    expect(quoteResults.tradeParameters).toMatchObject({
      kind: OrderKind.SELL,
      owner: owner.toBase58(),
      sellToken: sellMint.toBase58(),
      sellTokenDecimals,
      buyToken: buyMint.toBase58(),
      buyTokenDecimals,
      amount: '1000000000',
      receiver: receiver.toBase58(),
      partiallyFillable: false,
    })
    expect(quoteResults.quoteResponse.quote).toMatchObject({
      sellToken: sellMint.toBase58(),
      buyToken: buyMint.toBase58(),
      receiver: receiver.toBase58(),
      sellAmount: '1000000000',
      buyAmount: '9707507795',
      kind: OrderKind.SELL,
    })
    expect(quoteResults.suggestedSlippageBps).toBe(50)
    expect(quoteResults.amountsAndCosts).toBeDefined()
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

    await getSolanaQuote({
      ownerAddress: owner,
      receiverAddress: receiver,
      sellTokenAddress: sellMint,
      sellTokenDecimals,
      buyTokenAddress: buyMint,
      buyTokenDecimals,
      amount: 9_707_507_795n,
      kind: OrderKind.BUY,
    })

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
    const { solanaQuote: classicQuote } = await getSolanaQuote({
      ownerAddress: owner,
      receiverAddress: receiver,
      sellTokenAddress: sellMint,
      sellTokenDecimals,
      buyTokenAddress: buyMint,
      buyTokenDecimals,
      amount: 1_000_000_000n,
      kind: OrderKind.SELL,
    })

    fetchMock.mockResponseOnce(JSON.stringify(jupiterResponse))
    const { solanaQuote: token2022Quote } = await getSolanaQuote({
      ownerAddress: owner,
      receiverAddress: receiver,
      sellTokenAddress: sellMint,
      sellTokenDecimals,
      buyTokenAddress: buyMint,
      buyTokenDecimals,
      amount: 1_000_000_000n,
      kind: OrderKind.SELL,
      sellTokenProgramId: TOKEN_2022_PROGRAM_ID,
      buyTokenProgramId: TOKEN_2022_PROGRAM_ID,
    })

    expect(token2022Quote.intent.sellTokenAccount.toBase58()).not.toBe(classicQuote.intent.sellTokenAccount.toBase58())
    expect(token2022Quote.intent.buyTokenAccount.toBase58()).not.toBe(classicQuote.intent.buyTokenAccount.toBase58())
  })
})
