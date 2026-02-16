# CoW Protocol Order Amounts and Costs

This document explains how CoW Protocol calculates order amounts and costs,
from the initial `https://api.cow.fi/mainnet/api/v1/quote` API response to the final signed order.

## 1. What `/quote` API returns

The `/quote` endpoint returns [`OrderParameters`](../generated/models/OrderParameters.ts) with three amount fields:

| Field        | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| `sellAmount` | Amount of sell token the user wants to trade (before network costs)         |
| `buyAmount`  | Amount of buy token the user will receive (after network costs)             |
| `feeAmount`  | Estimated gas cost in sell token to settle the order on-chain               |

> **Important:** If protocol fee is enabled (`protocolFeeBps > 0`), the API returns amounts
> with protocol fee **already baked in**:
> - **SELL orders:** `buyAmount` has protocol fee already **deducted**
> - **BUY orders:** `sellAmount` has protocol fee already **added**

## 2. Order of applying costs

Starting from the raw quote, costs are applied in this order:

```
                      SELL ORDER                              BUY ORDER
                ┌─────────────────────┐               ┌─────────────────────┐
                │   beforeAllFees     │               │   beforeAllFees     │
  Amounts       │   sell · buy        │               │   sell · buy        │
  before any    │                     │               │                     │
  fees          └────────┬────────────┘               └────────┬────────────┘
                         │                                     │
                   ┌─────┴──────┐                        ┌─────┴──────┐
                   │Protocol fee│                        │Protocol fee│
                   │ -buy       │                        │ +sell      │
                   └─────┬──────┘                        └─────┬──────┘
                         │                                     │
               ┌─────────┴───────────┐               ┌────────┴────────────┐
               │ beforeNetworkCosts  │               │ beforeNetworkCosts  │
               │ sell · buy          │               │ sell · buy          │
               └─────────┬───────────┘               └────────┬────────────┘
                         │                                     │
                   ┌─────┴──────┐                        ┌─────┴──────┐
                   │Network fee │                        │Network fee │
                   │ +sell      │                        │ +sell      │
                   └─────┬──────┘                        └─────┬──────┘
                         │                                     │
               ┌─────────┴───────────┐               ┌────────┴────────────┐
               │ afterNetworkCosts   │               │ afterNetworkCosts   │
  What the API │ sell · buy          │  What the API │ sell · buy          │
  returns      └─────────┬───────────┘  returns      └────────┬────────────┘
                         │                                     │
                   ┌─────┴──────┐                        ┌─────┴──────┐
                   │Partner fee │                        │Partner fee │
                   │ -buy       │                        │ +sell      │
                   └─────┬──────┘                        └─────┴──────┘
                         │                                     │
               ┌─────────┴───────────┐               ┌────────┴────────────┐
               │ afterPartnerFees    │               │ afterPartnerFees    │
               │ sell · buy          │               │ sell · buy          │
               └─────────┬───────────┘               └────────┬────────────┘
                         │                                     │
                   ┌─────┴──────┐                        ┌─────┴──────┐
                   │ Slippage   │                        │ Slippage   │
                   │ -buy       │                        │ +sell      │
                   └─────┬──────┘                        └─────┬──────┘
                         │                                     │
               ┌─────────┴───────────┐               ┌────────┴────────────┐
               │ afterSlippage       │               │ afterSlippage       │
               │ sell · buy          │               │ sell · buy          │
               │ (signed order)      │               │ (signed order)      │
               └─────────────────────┘               └────────────────────-┘
```

**Key principle:** fees and costs always make the trade worse for the user:
- **SELL orders:** the user sells a fixed amount, so costs **reduce** `buyAmount`
- **BUY orders:** the user buys a fixed amount, so costs **increase** `sellAmount`

The one exception is `networkFee` (gas cost), which is **always added to `sellAmount`**
regardless of order kind.

## 3. How each cost is calculated

### 3.1 Protocol fee

Protocol fee is already baked into the `/quote` response. The SDK reconstructs it
from `protocolFeeBps` (provided alongside the quote) to display it separately.

**SELL orders** — fee is deducted from buy amount:

```
protocolFeeAmount = buyAmount * protocolFeeBps / (10000 - protocolFeeBps)
buyAmountBeforeProtocolFee = buyAmount + protocolFeeAmount
```

**BUY orders** — fee is added to sell amount:

```
sellAfterNetwork = sellAmount + feeAmount
protocolFeeAmount = sellAfterNetwork * protocolFeeBps / (10000 + protocolFeeBps)
sellAmountBeforeProtocolFee = sellAfterNetwork - protocolFeeAmount
```

> Source: [`getProtocolFeeAmount()`](./getProtocolFeeAmount.ts)

### 3.2 Network fee (gas cost)

The network fee (`feeAmount`) represents the estimated gas cost in sell token.
It is **always added to sell amount**, regardless of order kind:

```
sellAmountAfterNetworkCosts = sellAmountBeforeNetworkCosts + feeAmount
```

The buy amount before network costs is derived from the quote price. The price is
represented as a rational number ([`QuotePriceParams`](./quoteAmountsAndCosts.types.ts)) to avoid precision loss:

```
SELL: price = (buyAmountAfterNetworkCosts + protocolFeeAmount) / sellAmountBeforeNetworkCosts
BUY:  price = buyAmountAfterNetworkCosts / (sellAmountBeforeNetworkCosts - protocolFeeAmount)

buyAmountBeforeNetworkCosts = price.numerator * sellAmountAfterNetworkCosts / price.denominator
```

> Source: [`getQuoteAmountsWithNetworkCosts()`](./getQuoteAmountsWithNetworkCosts.ts)

### 3.3 Partner fee

Partner fee is calculated from the "surplus amount" — the amount on the non-fixed side,
before protocol fee was applied (to ensure the fee is based on the same volume):

```
SELL: partnerFeeAmount = buyAmountBeforeProtocolFee * partnerFeeBps / 10000
      afterPartnerFees.buyAmount = buyAmountAfterNetworkCosts - partnerFeeAmount

BUY:  partnerFeeAmount = sellAmountBeforeProtocolFee * partnerFeeBps / 10000
      afterPartnerFees.sellAmount = sellAmountAfterNetworkCosts + partnerFeeAmount
```

> Source: [`getQuoteAmountsAfterPartnerFee()`](./getQuoteAmountsAfterPartnerFee.ts)

### 3.4 Slippage

Slippage tolerance protects the user from price movements between quoting and execution.
It is applied to the non-fixed side after all other fees:

```
slippageAmount = amount * slippageBps / 10000

SELL: afterSlippage.buyAmount  = afterPartnerFees.buyAmount  - slippageAmount(buyAmount)
BUY:  afterSlippage.sellAmount = afterPartnerFees.sellAmount + slippageAmount(sellAmount)
```

> Source: [`getQuoteAmountsAfterSlippage()`](./getQuoteAmountsAfterSlippage.ts)

## 4. The final signed order

The [`afterSlippage`](../types.ts) amounts are what the user signs. When posting to the order book:

| Order field    | Value                                                                      |
|----------------|----------------------------------------------------------------------------|
| `sellAmount`   | `afterSlippage.sellAmount`                                                 |
| `buyAmount`    | `afterSlippage.buyAmount`                                                  |
| `feeAmount`    | `0` (must be zero — network costs are incorporated into the limit price)   |
| `kind`         | `sell` or `buy`                                                            |

> **Note:** `feeAmount` in the signed order must always be `0`. The network fee from the
> quote is a cost estimate used only for amount calculations — it is not included in
> the on-chain order struct.

## 5. Numeric example (SELL order)

Selling 0.16 WETH (18 decimals) for COW (6 decimals), no protocol/partner fees, no slippage:

```
Quote response:
  sellAmount = 156144455961718918  (0.1561 WETH)
  buyAmount  =         18632013982  (18632 COW)
  feeAmount  =   3855544038281082  (0.0039 WETH)

Step 1 — Network fee:
  sellAfterNetwork = 156144455961718918 + 3855544038281082 = 160000000000000000  (0.16 WETH)
  buyBeforeNetwork = buyAmount * sellAfterNetwork / sellAmount
                   = 18632013982 * 160000000000000000 / 156144455961718918
                   = 19091891979

Step 2 — Partner fee (0 bps): no change

Step 3 — Slippage (0 bps): no change

Signed order:
  sellAmount = 160000000000000000
  buyAmount  = 18632013982
  feeAmount  = 0
```

## Source files

| File                                                                            | Responsibility                                   |
|---------------------------------------------------------------------------------|--------------------------------------------------|
| [`getQuoteAmountsAndCosts.ts`](./getQuoteAmountsAndCosts.ts)                    | Main orchestrator, combines all steps            |
| [`getQuoteAmountsWithNetworkCosts.ts`](./getQuoteAmountsWithNetworkCosts.ts)    | Network fee calculation, quote price derivation  |
| [`getProtocolFeeAmount.ts`](./getProtocolFeeAmount.ts)                          | Reconstructs protocol fee from baked-in amounts  |
| [`getQuoteAmountsAfterPartnerFee.ts`](./getQuoteAmountsAfterPartnerFee.ts)      | Partner fee calculation                          |
| [`getQuoteAmountsAfterSlippage.ts`](./getQuoteAmountsAfterSlippage.ts)          | Slippage tolerance application                   |
| [`quoteAmountsAndCosts.types.ts`](./quoteAmountsAndCosts.types.ts)              | Type definitions for parameters and results      |
| [`../types.ts`](../types.ts)                                                    | [`QuoteAmountsAndCosts`](../types.ts), [`Amounts`](../types.ts), [`Costs`](../types.ts) interfaces |
