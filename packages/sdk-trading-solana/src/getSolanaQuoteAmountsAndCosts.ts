import {
  getQuoteAmountsAfterPartnerFee,
  getQuoteAmountsAfterSlippage,
  getQuoteAmountsAndCosts,
  OrderKind,
  QuoteAmountsAndCosts,
  SolanaQuoteCosts,
  SolanaQuoteResponse,
} from '@cowprotocol/sdk-order-book'

export interface SolanaQuoteAmountsAndCostsParams {
  quoteResponse: SolanaQuoteResponse
  slippagePercentBps: number
  partnerFeeBps?: number
}

/**
 * `getQuoteAmountsAndCosts` for a Solana quote, with the quote's `costs` put back into the breakdown.
 *
 * A Solana quote reports `feeAmount: '0'` and nets its costs (network fees and the receiver's token
 * account rent) out of the amounts instead: a sell order's `buyAmount` has them subtracted, a buy
 * order's `sellAmount` has them added on top. Read as-is, the breakdown would report no network
 * fee and pre-cost stages equal to the post-cost ones. This restores `beforeAllFees` and
 * `beforeNetworkCosts` and reports the costs under `costs.networkFee`. `afterNetworkCosts` stays
 * exactly what the quote said. The partner fee is taken from `beforeAllFees` with the costs, so
 * with a partner fee the signed amounts differ from the generic breakdown; without one they match it.
 *
 * `costs.protocolFee` is left out: the protocol fee reaches the amounts through `protocolFeeBps`, so
 * counting it here as well would take it twice.
 */
export function getSolanaQuoteAmountsAndCosts(params: SolanaQuoteAmountsAndCostsParams): QuoteAmountsAndCosts {
  const { quoteResponse, slippagePercentBps, partnerFeeBps = 0 } = params
  const orderParams = quoteResponse.quote

  const amountsAndCosts = getQuoteAmountsAndCosts({
    orderParams,
    slippagePercentBps,
    partnerFeeBps,
    protocolFeeBps: getSolanaProtocolFeeBps(quoteResponse),
  })

  const costs = getSolanaCostsTotal(orderParams.costs)

  if (costs === 0n) return amountsAndCosts

  const withCosts =
    orderParams.kind === OrderKind.SELL
      ? addSellOrderCosts(amountsAndCosts, costs, orderParams)
      : addBuyOrderCosts(amountsAndCosts, costs, orderParams)

  return applyPartnerFeeAndSlippage(withCosts, partnerFeeBps, slippagePercentBps)
}

type SolanaOrderParams = SolanaQuoteResponse['quote']

function addSellOrderCosts(
  amountsAndCosts: QuoteAmountsAndCosts,
  costs: bigint,
  orderParams: SolanaOrderParams,
): QuoteAmountsAndCosts {
  const sellAmount = BigInt(orderParams.sellAmount)
  const buyAmount = BigInt(orderParams.buyAmount)

  const beforeNetworkCosts = {
    ...amountsAndCosts.beforeNetworkCosts,
    buyAmount: amountsAndCosts.beforeNetworkCosts.buyAmount + costs,
  }

  return {
    ...amountsAndCosts,
    costs: {
      ...amountsAndCosts.costs,
      networkFee: {
        // `sellAmount` buys `buyAmount + costs` before costs, which prices each cost atom at
        // `sellAmount / (buyAmount + costs)` of the sell token.
        amountInSellCurrency: (costs * sellAmount) / (buyAmount + costs),
        amountInBuyCurrency: costs,
      },
    },
    beforeAllFees: { ...amountsAndCosts.beforeAllFees, buyAmount: amountsAndCosts.beforeAllFees.buyAmount + costs },
    beforeNetworkCosts,
    afterProtocolFees: beforeNetworkCosts,
  }
}

function addBuyOrderCosts(
  amountsAndCosts: QuoteAmountsAndCosts,
  costs: bigint,
  orderParams: SolanaOrderParams,
): QuoteAmountsAndCosts {
  const sellAmount = BigInt(orderParams.sellAmount)
  const buyAmount = BigInt(orderParams.buyAmount)

  const sellAmountBeforeCosts = sellAmount > costs ? sellAmount - costs : 0n
  const costsDelta = sellAmount - sellAmountBeforeCosts
  const beforeNetworkCosts = {
    ...amountsAndCosts.beforeNetworkCosts,
    sellAmount: amountsAndCosts.beforeNetworkCosts.sellAmount - costsDelta,
  }

  return {
    ...amountsAndCosts,
    costs: {
      ...amountsAndCosts.costs,
      networkFee: {
        amountInSellCurrency: costsDelta,
        // Mirror of the sell case: `sellAmountBeforeCosts` buys `buyAmount`.
        amountInBuyCurrency: sellAmountBeforeCosts > 0n ? (costsDelta * buyAmount) / sellAmountBeforeCosts : 0n,
      },
    },
    beforeAllFees: {
      ...amountsAndCosts.beforeAllFees,
      sellAmount: amountsAndCosts.beforeAllFees.sellAmount - costsDelta,
    },
    beforeNetworkCosts,
    afterProtocolFees: beforeNetworkCosts,
  }
}

/**
 * The generic breakdown takes the partner fee from `beforeAllFees` without the costs. Recomputes it,
 * and everything after it, from `beforeAllFees` with the costs, as on EVM where the partner fee
 * base includes network costs. With no partner fee this changes nothing.
 */
function applyPartnerFeeAndSlippage(
  amountsAndCosts: QuoteAmountsAndCosts,
  partnerFeeBps: number,
  slippageBps: number,
): QuoteAmountsAndCosts {
  const { isSell, beforeAllFees, afterNetworkCosts } = amountsAndCosts

  const { afterPartnerFees, partnerFeeAmount } = getQuoteAmountsAfterPartnerFee({
    afterNetworkCosts,
    beforeAllFees,
    isSell,
    partnerFeeBps,
  })
  const { afterSlippage } = getQuoteAmountsAfterSlippage({ afterPartnerFees, isSell, slippageBps })

  return {
    ...amountsAndCosts,
    costs: {
      ...amountsAndCosts.costs,
      partnerFee: { amount: partnerFeeAmount, bps: partnerFeeBps },
    },
    afterPartnerFees,
    afterSlippage,
    amountsToSign: isSell
      ? { sellAmount: beforeAllFees.sellAmount, buyAmount: afterSlippage.buyAmount }
      : { sellAmount: afterSlippage.sellAmount, buyAmount: beforeAllFees.buyAmount },
  }
}

function getSolanaProtocolFeeBps(quoteResponse: SolanaQuoteResponse): number {
  return quoteResponse.protocolFeeBps ? Number(quoteResponse.protocolFeeBps) : 0
}

function getSolanaCostsTotal(costs: SolanaQuoteCosts | undefined): bigint {
  if (!costs) return 0n

  return toAtoms(costs.networkFees) + toAtoms(costs.buyTokenAtaCosts)
}

function toAtoms(value: string | undefined): bigint {
  try {
    const atoms = BigInt(value ?? '0')
    return atoms > 0n ? atoms : 0n
  } catch {
    return 0n
  }
}
