import fetchMock from 'jest-fetch-mock'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import {
  SOL_NATIVE_CURRENCY_ADDRESS,
  SOLANA_SETTLEMENT_PROGRAM_ID,
  SOLANA_SETTLEMENT_PROGRAM_ID_STAGING,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/sdk-config'

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

    // intent.sellAmount/buyAmount are amountsToSign from getQuoteAmountsAndCosts: sellAmount is
    // unaffected (no network/partner/protocol fees here), buyAmount is reduced by the 50 bps
    // slippage tolerance (9707507795 - 9707507795 * 50 / 10000 = 9658970257).
    expect(solanaQuote.intent.sellAmount).toBe(1_000_000_000n)
    expect(solanaQuote.intent.buyAmount).toBe(9_658_970_257n)
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

  it('defaults to the prod settlement program id when no env is given', async () => {
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

    const { solanaQuote } = await getSolanaQuote({
      ownerAddress: owner,
      receiverAddress: receiver,
      sellTokenAddress: sellMint,
      sellTokenDecimals,
      buyTokenAddress: buyMint,
      buyTokenDecimals,
      amount: 1_000_000_000n,
      kind: OrderKind.SELL,
    })

    expect(solanaQuote.programId.toBase58()).toBe(new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID).toBase58())
  })

  it('uses the staging settlement program id when env is "staging"', async () => {
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

    const { solanaQuote } = await getSolanaQuote(
      {
        ownerAddress: owner,
        receiverAddress: receiver,
        sellTokenAddress: sellMint,
        sellTokenDecimals,
        buyTokenAddress: buyMint,
        buyTokenDecimals,
        amount: 1_000_000_000n,
        kind: OrderKind.SELL,
      },
      { env: 'staging' },
    )

    expect(solanaQuote.programId.toBase58()).toBe(new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID_STAGING).toBase58())
  })

  it('rejects a non-positive validForSeconds without requesting a Jupiter quote', async () => {
    await expect(
      getSolanaQuote({
        ownerAddress: owner,
        receiverAddress: receiver,
        sellTokenAddress: sellMint,
        sellTokenDecimals,
        buyTokenAddress: buyMint,
        buyTokenDecimals,
        amount: 1_000_000_000n,
        kind: OrderKind.SELL,
        validForSeconds: -1,
      }),
    ).rejects.toThrow('validForSeconds must be a finite number greater than zero')

    expect(fetchMock).not.toHaveBeenCalled()
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

  describe('selling native SOL', () => {
    const wsolMint = new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)
    const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

    function mockJupiterOrder(): void {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          inputMint: wsolMint.toBase58(),
          outputMint: usdcMint.toBase58(),
          inAmount: '1000000000',
          outAmount: '150000000',
          swapMode: 'ExactIn',
          slippageBps: 50,
        }),
      )
    }

    function quoteNativeSell(): ReturnType<typeof getSolanaQuote> {
      return getSolanaQuote({
        ownerAddress: owner,
        receiverAddress: receiver,
        sellTokenAddress: SOL_NATIVE_CURRENCY_ADDRESS,
        sellTokenDecimals: 9,
        buyTokenAddress: usdcMint,
        buyTokenDecimals: 6,
        amount: 1_000_000_000n,
        kind: OrderKind.SELL,
      })
    }

    it('asks Jupiter for the WSOL mint, since the native sentinel is not a token mint', async () => {
      mockJupiterOrder()

      await quoteNativeSell()

      const calledUrl = new URL(fetchMock.mock.calls[0]?.[0] as string)
      expect(calledUrl.searchParams.get('inputMint')).toBe(wsolMint.toBase58())
      expect(calledUrl.searchParams.get('inputMint')).not.toBe(SOL_NATIVE_CURRENCY_ADDRESS)
    })

    it('builds the intent against the WSOL account the wrap step funds, not the System Program', async () => {
      mockJupiterOrder()

      const { solanaQuote } = await quoteNativeSell()

      expect(solanaQuote.intent.sellMint.toBase58()).toBe(wsolMint.toBase58())
      expect(solanaQuote.intent.sellTokenAccount.toBase58()).toBe(
        getAssociatedTokenAddressSync(wsolMint, owner, false, undefined).toBase58(),
      )
      expect(solanaQuote.intent.sellTokenAccount.toBase58()).not.toBe(
        getAssociatedTokenAddressSync(new PublicKey(SOL_NATIVE_CURRENCY_ADDRESS), owner, false, undefined).toBase58(),
      )
    })

    it('reports the requested sell token back, so callers do not see it as a changed parameter', async () => {
      mockJupiterOrder()

      const { quoteResults } = await quoteNativeSell()

      expect(quoteResults.tradeParameters.sellToken).toBe(SOL_NATIVE_CURRENCY_ADDRESS)
    })

    it('places the order against WSOL, which is what actually gets settled', async () => {
      mockJupiterOrder()

      const { quoteResults } = await quoteNativeSell()

      expect(quoteResults.quoteResponse.quote.sellToken).toBe(wsolMint.toBase58())
    })

    it('leaves an SPL sell mint untouched', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          inputMint: usdcMint.toBase58(),
          outputMint: wsolMint.toBase58(),
          inAmount: '150000000',
          outAmount: '1000000000',
          swapMode: 'ExactIn',
          slippageBps: 50,
        }),
      )

      const { solanaQuote, quoteResults } = await getSolanaQuote({
        ownerAddress: owner,
        receiverAddress: receiver,
        sellTokenAddress: usdcMint,
        sellTokenDecimals: 6,
        buyTokenAddress: wsolMint,
        buyTokenDecimals: 9,
        amount: 150_000_000n,
        kind: OrderKind.SELL,
      })

      const calledUrl = new URL(fetchMock.mock.calls[0]?.[0] as string)
      expect(calledUrl.searchParams.get('inputMint')).toBe(usdcMint.toBase58())
      expect(solanaQuote.intent.sellMint.toBase58()).toBe(usdcMint.toBase58())
      expect(quoteResults.tradeParameters.sellToken).toBe(usdcMint.toBase58())
    })
  })

  it('derives buyTokenAccount for the receiver and sellTokenAccount for the owner', async () => {
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

    const { solanaQuote } = await getSolanaQuote({
      ownerAddress: owner,
      receiverAddress: receiver,
      sellTokenAddress: sellMint,
      sellTokenDecimals,
      buyTokenAddress: buyMint,
      buyTokenDecimals,
      amount: 1_000_000_000n,
      kind: OrderKind.SELL,
    })

    expect(solanaQuote.intent.buyTokenAccount.toBase58()).toBe(
      getAssociatedTokenAddressSync(buyMint, receiver, false).toBase58(),
    )
    expect(solanaQuote.intent.sellTokenAccount.toBase58()).toBe(
      getAssociatedTokenAddressSync(sellMint, owner, false).toBase58(),
    )
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
