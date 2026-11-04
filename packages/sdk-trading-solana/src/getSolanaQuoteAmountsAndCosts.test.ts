import { getQuoteAmountsAndCosts, OrderKind, SolanaQuoteCosts, SolanaQuoteResponse } from '@cowprotocol/sdk-order-book'

import { getSolanaQuoteAmountsAndCosts } from './getSolanaQuoteAmountsAndCosts'

const SELL_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const BUY_MINT = 'So11111111111111111111111111111111111111112'

function quoteResponse(
  overrides: Partial<SolanaQuoteResponse['quote']> = {},
  protocolFeeBps?: string,
): SolanaQuoteResponse {
  return {
    quote: {
      sellToken: SELL_MINT,
      buyToken: BUY_MINT,
      sellAmount: '1000000000',
      buyAmount: '9707507795',
      validTo: 1_700_001_800,
      appData: '{}',
      feeAmount: '0',
      kind: OrderKind.SELL,
      partiallyFillable: false,
      ...overrides,
    },
    expiration: '2024-01-01T00:30:00.000Z',
    verified: false,
    ...(protocolFeeBps ? { protocolFeeBps } : undefined),
  } as SolanaQuoteResponse
}

function costs(networkFees: string, buyTokenAtaCosts: string, protocolFee = '0'): SolanaQuoteCosts {
  return {
    token: BUY_MINT,
    networkFees,
    buyTokenAtaCosts,
    protocolFee,
    total: String(BigInt(networkFees) + BigInt(buyTokenAtaCosts) + BigInt(protocolFee)),
  }
}

function plain(response: SolanaQuoteResponse, protocolFeeBps = 0): ReturnType<typeof getQuoteAmountsAndCosts> {
  return getQuoteAmountsAndCosts({
    orderParams: response.quote,
    slippagePercentBps: 50,
    partnerFeeBps: 0,
    protocolFeeBps,
  })
}

describe('getSolanaQuoteAmountsAndCosts', () => {
  describe('sell order', () => {
    const response = quoteResponse({ costs: costs('11732551', '919115681') })
    const result = getSolanaQuoteAmountsAndCosts({ quoteResponse: response, slippagePercentBps: 50 })
    const generic = plain(response)

    it('adds the costs back to the buy amount before costs', () => {
      expect(result.beforeAllFees).toEqual({ sellAmount: 1_000_000_000n, buyAmount: 10_638_356_027n })
      expect(result.beforeNetworkCosts).toEqual({ sellAmount: 1_000_000_000n, buyAmount: 10_638_356_027n })
      expect(result.afterProtocolFees).toEqual(result.beforeNetworkCosts)
    })

    it('reports the costs as the network fee, in both currencies', () => {
      expect(result.costs.networkFee).toEqual({
        amountInBuyCurrency: 930_848_232n,
        // 930848232 * 1000000000 / (9707507795 + 930848232)
        amountInSellCurrency: 87_499_255n,
      })
    })

    it('keeps the amounts after costs and the signed amounts as the quote said', () => {
      expect(result.afterNetworkCosts).toEqual({ sellAmount: 1_000_000_000n, buyAmount: 9_707_507_795n })
      expect(result.afterPartnerFees).toEqual(generic.afterPartnerFees)
      expect(result.afterSlippage).toEqual(generic.afterSlippage)
      expect(result.amountsToSign).toEqual(generic.amountsToSign)
    })
  })

  describe('buy order', () => {
    const response = quoteResponse({
      kind: OrderKind.BUY,
      costs: { ...costs('20000000', '30000000'), token: SELL_MINT },
    })
    const result = getSolanaQuoteAmountsAndCosts({ quoteResponse: response, slippagePercentBps: 50 })
    const generic = plain(response)

    it('takes the costs off the sell amount before costs', () => {
      expect(result.beforeAllFees).toEqual({ sellAmount: 950_000_000n, buyAmount: 9_707_507_795n })
      expect(result.beforeNetworkCosts).toEqual({ sellAmount: 950_000_000n, buyAmount: 9_707_507_795n })
      expect(result.afterProtocolFees).toEqual(result.beforeNetworkCosts)
    })

    it('reports the costs as the network fee, in both currencies', () => {
      expect(result.costs.networkFee).toEqual({
        amountInSellCurrency: 50_000_000n,
        // 50000000 * 9707507795 / 950000000
        amountInBuyCurrency: 510_921_462n,
      })
    })

    it('keeps the amounts after costs and the signed amounts as the quote said', () => {
      expect(result.afterNetworkCosts).toEqual({ sellAmount: 1_000_000_000n, buyAmount: 9_707_507_795n })
      expect(result.afterSlippage).toEqual(generic.afterSlippage)
      expect(result.amountsToSign).toEqual(generic.amountsToSign)
    })

    it('never takes the sell amount before costs below zero', () => {
      const malformed = quoteResponse({
        kind: OrderKind.BUY,
        sellAmount: '10',
        costs: { ...costs('20', '0'), token: SELL_MINT },
      })
      const { beforeAllFees, costs: reported } = getSolanaQuoteAmountsAndCosts({
        quoteResponse: malformed,
        slippagePercentBps: 0,
      })

      expect(beforeAllFees.sellAmount).toBe(0n)
      expect(reported.networkFee).toEqual({ amountInSellCurrency: 10n, amountInBuyCurrency: 0n })
    })
  })

  it('matches the generic breakdown when the quote reports no costs', () => {
    const response = quoteResponse()

    expect(getSolanaQuoteAmountsAndCosts({ quoteResponse: response, slippagePercentBps: 50 })).toEqual(plain(response))
  })

  it('leaves the protocol fee out of the costs, since protocolFeeBps already accounts for it', () => {
    const response = quoteResponse({ costs: costs('0', '0', '5000') })

    expect(getSolanaQuoteAmountsAndCosts({ quoteResponse: response, slippagePercentBps: 50 })).toEqual(plain(response))
  })

  it('reads the protocol fee bps from the quote response', () => {
    const response = quoteResponse({}, '2')
    const result = getSolanaQuoteAmountsAndCosts({ quoteResponse: response, slippagePercentBps: 50 })

    expect(result.costs.protocolFee.bps).toBe(2)
    expect(result).toEqual(plain(response, 2))
  })
})
