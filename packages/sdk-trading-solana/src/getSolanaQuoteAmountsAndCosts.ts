import {
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
 * `beforeNetworkCosts` and reports the costs under `costs.networkFee`; `afterNetworkCosts` onwards,
 * the signed amounts included, stay exactly what the quote said.
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

  const sellAmount = BigInt(orderParams.sellAmount)
  const buyAmount = BigInt(orderParams.buyAmount)

  if (orderParams.kind === OrderKind.SELL) {
    const buyAmountBeforeCosts = amountsAndCosts.beforeAllFees.buyAmount + costs
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
      beforeAllFees: { ...amountsAndCosts.beforeAllFees, buyAmount: buyAmountBeforeCosts },
      beforeNetworkCosts,
      afterProtocolFees: beforeNetworkCosts,
    }
  }

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
