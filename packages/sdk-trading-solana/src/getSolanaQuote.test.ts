import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { OrderKind, OrderBookApi, OrderQuoteRequest, OrderQuoteResponse, PriceQuality } from '@cowprotocol/sdk-order-book'
import {
  SOL_NATIVE_CURRENCY_ADDRESS,
  SOLANA_SETTLEMENT_PROGRAM_ID,
  SOLANA_SETTLEMENT_PROGRAM_ID_STAGING,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/sdk-config'

import { getSolanaQuote } from './getSolanaQuote'
import { findOrderPda } from './orderPda'

describe('getSolanaQuote', () => {
  const owner = new PublicKey(new Uint8Array(32).fill(9))
  const receiver = new PublicKey(new Uint8Array(32).fill(10))
  const sellMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
  const buyMint = new PublicKey('So11111111111111111111111111111111111111112')
  const sellTokenDecimals = 6
  const buyTokenDecimals = 9

  const getQuoteMock = jest.fn<Promise<OrderQuoteResponse>, [OrderQuoteRequest]>()
  const orderBookApiMock = { getQuote: getQuoteMock } as unknown as OrderBookApi

  beforeEach(() => {
    getQuoteMock.mockReset()
  })

  function mockQuoteResponse(overrides: Partial<OrderQuoteResponse['quote']> = {}): void {
    getQuoteMock.mockResolvedValueOnce({
      quote: {
        sellToken: sellMint.toBase58(),
        buyToken: buyMint.toBase58(),
        receiver: receiver.toBase58(),
        sellAmount: '1000000000',
        buyAmount: '9707507795',
        validTo: 1_700_001_800,
        appData: '{}',
        feeAmount: '0',
        kind: OrderKind.SELL,
        partiallyFillable: false,
        ...overrides,
      },
      from: owner.toBase58(),
      expiration: '2024-01-01T00:30:00.000Z',
      verified: false,
    } as OrderQuoteResponse)
  }

  it('builds a quote from a CoW Protocol quote response', async () => {
    mockQuoteResponse()

    const { solanaQuote, quoteResults } = await getSolanaQuote(
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
      { orderBookApi: orderBookApiMock },
    )

    // intent.sellAmount/buyAmount are amountsToSign from getQuoteAmountsAndCosts: sellAmount is
    // unaffected (no network/partner/protocol fees here), buyAmount is reduced by the default 50 bps
    // slippage tolerance (9707507795 - 9707507795 * 50 / 10000 = 9658970257).
    expect(solanaQuote.intent.sellAmount).toBe(1_000_000_000n)
    expect(solanaQuote.intent.buyAmount).toBe(9_658_970_257n)
    expect(solanaQuote.intent.kind).toBe(OrderKind.SELL)
    expect(solanaQuote.intent.createdOnChain).toBe(true)
    expect(solanaQuote.intent.owner.toBase58()).toBe(owner.toBase58())
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

  describe('quote request', () => {
    it('requests a sell quote with sellAmountBeforeFee', async () => {
      mockQuoteResponse()

      await getSolanaQuote(
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
        { orderBookApi: orderBookApiMock },
      )

      expect(getQuoteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'sell',
          sellAmountBeforeFee: '1000000000',
          from: owner.toBase58(),
          sellToken: sellMint.toBase58(),
          buyToken: buyMint.toBase58(),
          receiver: receiver.toBase58(),
        }),
      )
    })

    it('requests a buy quote with buyAmountAfterFee', async () => {
      mockQuoteResponse({ kind: OrderKind.BUY, sellAmount: '9707507795', buyAmount: '1000000000' })

      await getSolanaQuote(
        {
          ownerAddress: owner,
          receiverAddress: receiver,
          sellTokenAddress: sellMint,
          sellTokenDecimals,
          buyTokenAddress: buyMint,
          buyTokenDecimals,
          amount: 9_707_507_795n,
          kind: OrderKind.BUY,
        },
        { orderBookApi: orderBookApiMock },
      )

      expect(getQuoteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'buy',
          buyAmountAfterFee: '9707507795',
        }),
      )
    })

    describe('priceQuality', () => {
      function quoteWithPriceQuality(
        priceQuality?: PriceQuality,
        advancedSettings?: { quoteRequest: { priceQuality: PriceQuality } },
      ): ReturnType<typeof getSolanaQuote> {
        return getSolanaQuote(
          {
            ownerAddress: owner,
            receiverAddress: receiver,
            sellTokenAddress: sellMint,
            sellTokenDecimals,
            buyTokenAddress: buyMint,
            buyTokenDecimals,
            amount: 1_000_000_000n,
            kind: OrderKind.SELL,
            ...(priceQuality === undefined ? undefined : { priceQuality }),
          },
          { orderBookApi: orderBookApiMock, advancedSettings },
        )
      }

      it('defaults to VERIFIED when neither the caller nor advancedSettings set one', async () => {
        mockQuoteResponse()

        await quoteWithPriceQuality()

        expect(getQuoteMock).toHaveBeenCalledWith(expect.objectContaining({ priceQuality: PriceQuality.VERIFIED }))
      })

      it('falls back to advancedSettings.quoteRequest.priceQuality when the caller sets none', async () => {
        mockQuoteResponse()

        await quoteWithPriceQuality(undefined, { quoteRequest: { priceQuality: PriceQuality.FAST } })

        expect(getQuoteMock).toHaveBeenCalledWith(expect.objectContaining({ priceQuality: PriceQuality.FAST }))
      })

      it('prefers the caller-supplied priceQuality over advancedSettings.quoteRequest.priceQuality', async () => {
        mockQuoteResponse()

        await quoteWithPriceQuality(PriceQuality.OPTIMAL, { quoteRequest: { priceQuality: PriceQuality.FAST } })

        expect(getQuoteMock).toHaveBeenCalledWith(expect.objectContaining({ priceQuality: PriceQuality.OPTIMAL }))
      })
    })
  })

  describe('slippageBps', () => {
    function quoteWithSlippage(slippageBps?: number): ReturnType<typeof getSolanaQuote> {
      return getSolanaQuote(
        {
          ownerAddress: owner,
          receiverAddress: receiver,
          sellTokenAddress: sellMint,
          sellTokenDecimals,
          buyTokenAddress: buyMint,
          buyTokenDecimals,
          amount: 1_000_000_000n,
          kind: OrderKind.SELL,
          ...(slippageBps === undefined ? undefined : { slippageBps }),
        },
        { orderBookApi: orderBookApiMock },
      )
    }

    it('signs the caller tolerance instead of the default', async () => {
      mockQuoteResponse()

      const { solanaQuote } = await quoteWithSlippage(50)

      // 9707507795 - 9707507795 * 50 / 10000 = 9658970257
      expect(solanaQuote.intent.buyAmount).toBe(9_658_970_257n)
    })

    // Consumers read `suggestedSlippageBps` as a recommendation and turn it into "smart" slippage, so
    // handing the caller their own input back would make the app advise whatever it just chose.
    it('never reports the caller tolerance as the provider suggestion', async () => {
      mockQuoteResponse()

      const { quoteResults } = await quoteWithSlippage(500)

      expect(quoteResults.suggestedSlippageBps).toBe(50)
    })

    it('reports the caller tolerance in tradeParameters, so a change to it forces a requote', async () => {
      mockQuoteResponse()

      const { quoteResults } = await quoteWithSlippage(50)

      expect(quoteResults.tradeParameters.slippageBps).toBe(50)
    })

    it('falls back to the default slippage bps when the caller sets none', async () => {
      mockQuoteResponse()

      const { quoteResults } = await quoteWithSlippage()

      expect(quoteResults.suggestedSlippageBps).toBe(50)
      // Not a user override, so it must not drive requoting.
      expect(quoteResults.tradeParameters.slippageBps).toBeUndefined()
    })

    it('rejects a negative tolerance without requesting a quote', async () => {
      await expect(quoteWithSlippage(-1)).rejects.toThrow(
        'slippageBps must be a finite number greater than or equal to zero',
      )

      expect(getQuoteMock).not.toHaveBeenCalled()
    })
  })

  describe('advancedSettings.getSlippageSuggestion', () => {
    function quoteWithAdvancedSettings(
      getSlippageSuggestion?: jest.Mock,
      priceQuality?: PriceQuality,
    ): ReturnType<typeof getSolanaQuote> {
      return getSolanaQuote(
        {
          ownerAddress: owner,
          receiverAddress: receiver,
          sellTokenAddress: sellMint,
          sellTokenDecimals,
          buyTokenAddress: buyMint,
          buyTokenDecimals,
          amount: 1_000_000_000n,
          kind: OrderKind.SELL,
          ...(priceQuality === undefined ? undefined : { priceQuality }),
        },
        {
          orderBookApi: orderBookApiMock,
          ...(getSlippageSuggestion === undefined ? undefined : { advancedSettings: { getSlippageSuggestion } }),
        },
      )
    }

    it('uses the callback result to re-derive the suggested slippage, instead of the flat default', async () => {
      mockQuoteResponse()
      const getSlippageSuggestion = jest.fn().mockResolvedValue({ slippageBps: 200 })

      const { quoteResults } = await quoteWithAdvancedSettings(getSlippageSuggestion)

      expect(getSlippageSuggestion).toHaveBeenCalledWith({
        chainId: SupportedChainId.SOLANA,
        sellToken: sellMint.toBase58(),
        buyToken: buyMint.toBase58(),
        sellAmount: 1_000_000_000n,
        buyAmount: 9_707_507_795n,
      })
      // With a zero fee, the fee+volume heuristic scales linearly with the requested multiplier, so a
      // 200 bps suggestion from the callback comes back out as exactly 200 bps.
      expect(quoteResults.suggestedSlippageBps).toBe(200)
    })

    it('falls back to the default when the callback resolves no slippage', async () => {
      mockQuoteResponse()
      const getSlippageSuggestion = jest.fn().mockResolvedValue({ slippageBps: null })

      const { quoteResults } = await quoteWithAdvancedSettings(getSlippageSuggestion)

      expect(quoteResults.suggestedSlippageBps).toBe(50)
    })

    it('falls back to the default when the callback rejects', async () => {
      mockQuoteResponse()
      const getSlippageSuggestion = jest.fn().mockRejectedValue(new Error('boom'))

      const { quoteResults } = await quoteWithAdvancedSettings(getSlippageSuggestion)

      expect(quoteResults.suggestedSlippageBps).toBe(50)
    })

    it('skips the callback for a FAST quote, so it never waits on a full quote-derived suggestion', async () => {
      mockQuoteResponse()
      const getSlippageSuggestion = jest.fn().mockResolvedValue({ slippageBps: 200 })

      const { quoteResults } = await quoteWithAdvancedSettings(getSlippageSuggestion, PriceQuality.FAST)

      expect(getSlippageSuggestion).not.toHaveBeenCalled()
      expect(quoteResults.suggestedSlippageBps).toBe(50)
    })

    it('skips the callback entirely when none is given', async () => {
      mockQuoteResponse()

      const { quoteResults } = await quoteWithAdvancedSettings()

      expect(quoteResults.suggestedSlippageBps).toBe(50)
    })
  })

  it('defaults to the prod settlement program id when no env is given', async () => {
    mockQuoteResponse()

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
      { orderBookApi: orderBookApiMock },
    )

    expect(solanaQuote.programId.toBase58()).toBe(new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID).toBase58())
  })

  it('uses the staging settlement program id when env is "staging"', async () => {
    mockQuoteResponse()

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
      { env: 'staging', orderBookApi: orderBookApiMock },
    )

    expect(solanaQuote.programId.toBase58()).toBe(new PublicKey(SOLANA_SETTLEMENT_PROGRAM_ID_STAGING).toBase58())
  })

  it('rejects a non-positive validForSeconds without requesting a quote', async () => {
    await expect(
      getSolanaQuote(
        {
          ownerAddress: owner,
          receiverAddress: receiver,
          sellTokenAddress: sellMint,
          sellTokenDecimals,
          buyTokenAddress: buyMint,
          buyTokenDecimals,
          amount: 1_000_000_000n,
          kind: OrderKind.SELL,
          validForSeconds: -1,
        },
        { orderBookApi: orderBookApiMock },
      ),
    ).rejects.toThrow('validForSeconds must be a finite number greater than zero')

    expect(getQuoteMock).not.toHaveBeenCalled()
  })

  describe('selling native SOL', () => {
    const wsolMint = new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)
    const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

    function quoteNativeSell(): ReturnType<typeof getSolanaQuote> {
      return getSolanaQuote(
        {
          ownerAddress: owner,
          receiverAddress: receiver,
          sellTokenAddress: SOL_NATIVE_CURRENCY_ADDRESS,
          sellTokenDecimals: 9,
          buyTokenAddress: usdcMint,
          buyTokenDecimals: 6,
          amount: 1_000_000_000n,
          kind: OrderKind.SELL,
        },
        { orderBookApi: orderBookApiMock },
      )
    }

    function mockNativeSellQuoteResponse(): void {
      getQuoteMock.mockResolvedValueOnce({
        quote: {
          sellToken: wsolMint.toBase58(),
          buyToken: usdcMint.toBase58(),
          receiver: receiver.toBase58(),
          sellAmount: '1000000000',
          buyAmount: '150000000',
          validTo: 1_700_001_800,
          appData: '{}',
          feeAmount: '0',
          kind: OrderKind.SELL,
          partiallyFillable: false,
        },
        from: owner.toBase58(),
        expiration: '2024-01-01T00:30:00.000Z',
        verified: false,
      } as OrderQuoteResponse)
    }

    it('quotes against the WSOL mint, since the native sentinel is not a token mint', async () => {
      mockNativeSellQuoteResponse()

      await quoteNativeSell()

      expect(getQuoteMock).toHaveBeenCalledWith(
        expect.objectContaining({ sellToken: wsolMint.toBase58() }),
      )
      expect(getQuoteMock.mock.calls[0]?.[0].sellToken).not.toBe(SOL_NATIVE_CURRENCY_ADDRESS)
    })

    it('builds the intent against the WSOL account the wrap step funds, not the System Program', async () => {
      mockNativeSellQuoteResponse()

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
      mockNativeSellQuoteResponse()

      const { quoteResults } = await quoteNativeSell()

      expect(quoteResults.tradeParameters.sellToken).toBe(SOL_NATIVE_CURRENCY_ADDRESS)
    })

    it('places the order against WSOL, which is what actually gets settled', async () => {
      mockNativeSellQuoteResponse()

      const { quoteResults } = await quoteNativeSell()

      expect(quoteResults.quoteResponse.quote.sellToken).toBe(wsolMint.toBase58())
    })

    it('leaves an SPL sell mint untouched', async () => {
      getQuoteMock.mockResolvedValueOnce({
        quote: {
          sellToken: usdcMint.toBase58(),
          buyToken: wsolMint.toBase58(),
          receiver: receiver.toBase58(),
          sellAmount: '150000000',
          buyAmount: '1000000000',
          validTo: 1_700_001_800,
          appData: '{}',
          feeAmount: '0',
          kind: OrderKind.SELL,
          partiallyFillable: false,
        },
        from: owner.toBase58(),
        expiration: '2024-01-01T00:30:00.000Z',
        verified: false,
      } as OrderQuoteResponse)

      const { solanaQuote, quoteResults } = await getSolanaQuote(
        {
          ownerAddress: owner,
          receiverAddress: receiver,
          sellTokenAddress: usdcMint,
          sellTokenDecimals: 6,
          buyTokenAddress: wsolMint,
          buyTokenDecimals: 9,
          amount: 150_000_000n,
          kind: OrderKind.SELL,
        },
        { orderBookApi: orderBookApiMock },
      )

      expect(getQuoteMock).toHaveBeenCalledWith(expect.objectContaining({ sellToken: usdcMint.toBase58() }))
      expect(solanaQuote.intent.sellMint.toBase58()).toBe(usdcMint.toBase58())
      expect(quoteResults.tradeParameters.sellToken).toBe(usdcMint.toBase58())
    })
  })

  describe('buying native SOL', () => {
    const wsolMint = new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)
    const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

    function quoteNativeBuy(): ReturnType<typeof getSolanaQuote> {
      return getSolanaQuote(
        {
          ownerAddress: owner,
          receiverAddress: receiver,
          sellTokenAddress: usdcMint,
          sellTokenDecimals: 6,
          buyTokenAddress: SOL_NATIVE_CURRENCY_ADDRESS,
          buyTokenDecimals: 9,
          amount: 150_000_000n,
          kind: OrderKind.SELL,
        },
        { orderBookApi: orderBookApiMock },
      )
    }

    function mockNativeBuyQuoteResponse(): void {
      getQuoteMock.mockResolvedValueOnce({
        quote: {
          sellToken: usdcMint.toBase58(),
          buyToken: wsolMint.toBase58(),
          receiver: receiver.toBase58(),
          sellAmount: '150000000',
          buyAmount: '1000000000',
          validTo: 1_700_001_800,
          appData: '{}',
          feeAmount: '0',
          kind: OrderKind.SELL,
          partiallyFillable: false,
        },
        from: owner.toBase58(),
        expiration: '2024-01-01T00:30:00.000Z',
        verified: false,
      } as OrderQuoteResponse)
    }

    it('quotes against the WSOL mint, since the book answers NoLiquidity for the sentinel', async () => {
      mockNativeBuyQuoteResponse()

      await quoteNativeBuy()

      expect(getQuoteMock).toHaveBeenCalledWith(expect.objectContaining({ buyToken: wsolMint.toBase58() }))
      expect(getQuoteMock.mock.calls[0]?.[0].buyToken).not.toBe(SOL_NATIVE_CURRENCY_ADDRESS)
    })

    it('keeps the sentinel in the intent, which is what makes the program pay lamports', async () => {
      mockNativeBuyQuoteResponse()

      const { solanaQuote } = await quoteNativeBuy()

      expect(solanaQuote.intent.buyMint.toBase58()).toBe(SOL_NATIVE_CURRENCY_ADDRESS)
      expect(solanaQuote.intent.buyMint.toBase58()).not.toBe(wsolMint.toBase58())
    })

    it('names the receiver account itself, not an associated token account', async () => {
      mockNativeBuyQuoteResponse()

      const { solanaQuote } = await quoteNativeBuy()

      expect(solanaQuote.intent.buyTokenAccount.toBase58()).toBe(receiver.toBase58())
      expect(solanaQuote.intent.buyTokenAccount.toBase58()).not.toBe(
        getAssociatedTokenAddressSync(wsolMint, receiver, false, undefined).toBase58(),
      )
    })

    it('reports the requested buy token back, so callers do not see it as a changed parameter', async () => {
      mockNativeBuyQuoteResponse()

      const { quoteResults } = await quoteNativeBuy()

      expect(quoteResults.tradeParameters.buyToken).toBe(SOL_NATIVE_CURRENCY_ADDRESS)
    })

    it('leaves an explicit WSOL buy as a token trade, associated token account and all', async () => {
      mockNativeBuyQuoteResponse()

      const { solanaQuote, quoteResults } = await getSolanaQuote(
        {
          ownerAddress: owner,
          receiverAddress: receiver,
          sellTokenAddress: usdcMint,
          sellTokenDecimals: 6,
          buyTokenAddress: wsolMint,
          buyTokenDecimals: 9,
          amount: 150_000_000n,
          kind: OrderKind.SELL,
        },
        { orderBookApi: orderBookApiMock },
      )

      expect(solanaQuote.intent.buyMint.toBase58()).toBe(wsolMint.toBase58())
      expect(solanaQuote.intent.buyTokenAccount.toBase58()).toBe(
        getAssociatedTokenAddressSync(wsolMint, receiver, false, undefined).toBase58(),
      )
      expect(quoteResults.tradeParameters.buyToken).toBe(wsolMint.toBase58())
    })
  })

  it('derives buyTokenAccount for the receiver and sellTokenAccount for the owner', async () => {
    mockQuoteResponse()

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
      { orderBookApi: orderBookApiMock },
    )

    expect(solanaQuote.intent.buyTokenAccount.toBase58()).toBe(
      getAssociatedTokenAddressSync(buyMint, receiver, false).toBase58(),
    )
    expect(solanaQuote.intent.sellTokenAccount.toBase58()).toBe(
      getAssociatedTokenAddressSync(sellMint, owner, false).toBase58(),
    )
  })

  it('derives different token accounts for Token-2022 mints than for classic SPL Token mints', async () => {
    mockQuoteResponse()
    const { solanaQuote: classicQuote } = await getSolanaQuote(
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
      { orderBookApi: orderBookApiMock },
    )

    mockQuoteResponse()
    const { solanaQuote: token2022Quote } = await getSolanaQuote(
      {
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
      },
      { orderBookApi: orderBookApiMock },
    )

    expect(token2022Quote.intent.sellTokenAccount.toBase58()).not.toBe(classicQuote.intent.sellTokenAccount.toBase58())
    expect(token2022Quote.intent.buyTokenAccount.toBase58()).not.toBe(classicQuote.intent.buyTokenAccount.toBase58())
  })
})
