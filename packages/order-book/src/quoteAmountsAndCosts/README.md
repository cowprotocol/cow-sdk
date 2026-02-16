# CoW Protocol Order Amounts and Costs

This document explains how CoW Protocol calculates order amounts and costs,
from the initial `https://api.cow.fi/mainnet/api/v1/quote` API response to the final signed order.

## 1. What `/quote` API returns

The `/quote` endpoint returns [`OrderQuoteResponse`](../generated/models/OrderQuoteResponse.ts)
which contains [`OrderParameters`](../generated/models/OrderParameters.ts) (in the `quote` field)
along with additional metadata.

Quote API response example:
```json
{
    "quote": {
        "sellToken": "0x6b175474e89094c44da98b954eedeac495271d0f",
        "buyToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        "receiver": "0xfb3c7eb936caa12b5a884d612393969a557d4307",
        "sellAmount": "317204814000482464383280",
        "buyAmount": "157816891535942031188",
        "validTo": 1771249538,
        "appData": "{\"appCode\":\"CoW Swap\",\"environment\":\"production\",\"metadata\":{\"hooks\":{\"pre\":[{\"callData\":\"0x8fcbaf0c000000000000000000000000da5f16f4ab0410096a4403e7223988649fac38cf000000000000000000000000c92e8bdf79f0507f65a392b0ab4667716bfe011000000000000000000000000000000000000000000000000000000000000000250000000000000000000000000000000000000000000000000000000072fabfbd0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000001bc69041a5b4703e6f96480679a04ebb8adca12aa03e6d8f7bbbdb8467cdb0afc74bf6a9c150500aff2f25c070b220c1de0de702c6ec70dabfe7126d634548bbdd\",\"dappId\":\"cow-swap://libs/hook-dapp-lib/permit\",\"gasLimit\":\"80000\",\"target\":\"0x6B175474E89094C44Da98b954EedeAC495271d0F\"}]},\"orderClass\":{\"orderClass\":\"market\"},\"quote\":{\"slippageBips\":200,\"smartSlippage\":false},\"utm\":{\"utmSource\":\"imtoken\"}},\"version\":\"1.14.0\"}",
        "appDataHash": "0x96e951e996be0344c9d1a268449e318c24bb62134e8d644f1b1c1511612284ef",
        "feeAmount": "115999517535616720",
        "gasAmount": "236558.0000000000",
        "gasPrice": "181514322.0000000",
        "sellTokenPrice": "0.0004953452562941344",
        "kind": "sell",
        "partiallyFillable": false,
        "sellTokenBalance": "erc20",
        "buyTokenBalance": "erc20",
        "signingScheme": "eip712"
    },
    "from": "0xfb3c7eb936caa12b5a884d612393969a557d4307",
    "expiration": "2026-02-16T13:17:38.649008980Z",
    "id": 1081297372,
    "verified": true,
    "protocolFeeBps": "2"
}
```

An order example:
```
https://api.cow.fi/mainnet/api/v1/orders/0xeaed649f015a7d39c47cc9edf9e0d503cac55c9420cbf1951e3017c50a8d5c36d8da6bf26964af9d7eed9e03e53415d37aa9604568401277
```

The response `quote` field contains three amount fields:

| Field        | Description                                                                 |
|--------------|-----------------------------------------------------------------------------|
| `sellAmount` | Amount of sell token the user wants to trade (before network costs)         |
| `buyAmount`  | Amount of buy token the user will receive (after network costs)             |
| `feeAmount`  | Estimated gas cost in sell token to settle the order on-chain               |

The response also includes `protocolFeeBps` — the protocol fee percentage in BPS.
This value is server-determined and cannot be configured by the client.

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

## 3. BPS (Basis Points)

All percentage-based fees use **basis points (BPS)** — a standard unit where:

```
1 BPS     = 0.01%
100 BPS   = 1%
10000 BPS = 100%   (the constant ONE_HUNDRED_BPS = 10000)
```

To apply a BPS percentage to an amount:

```
feeAmount = amount * feeBps / 10000
```

For example, 50 BPS (0.5%) of 1,000,000: `1000000 * 50 / 10000 = 5000`

## 4. How each cost is calculated

### 4.1 Protocol fee

`protocolFeeBps` comes from the `/quote` API response field
[`OrderQuoteResponse.protocolFeeBps`](../generated/models/OrderQuoteResponse.ts).
It is server-determined and not configurable by the caller.

Protocol fee is already baked into the `/quote` response. The SDK reconstructs it
from `protocolFeeBps` to display it separately.

The challenge is that the API returns `amountAfterFee`, but we need to recover
the original `amountBeforeFee` and `feeAmount`. Since:

```
amountAfterFee = amountBeforeFee - amountBeforeFee * feeBps / 10000
               = amountBeforeFee * (1 - feeBps / 10000)
               = amountBeforeFee * (10000 - feeBps) / 10000
```

We can reverse it:

```
amountBeforeFee = amountAfterFee * 10000 / (10000 - feeBps)
feeAmount       = amountBeforeFee - amountAfterFee
                = amountAfterFee * feeBps / (10000 - feeBps)
```

**SELL orders** — protocol fee was deducted from buy amount by the API:

```
protocolFeeAmount          = buyAmount * protocolFeeBps / (10000 - protocolFeeBps)
buyAmountBeforeProtocolFee = buyAmount + protocolFeeAmount
```

**BUY orders** — protocol fee was added to sell amount by the API.
Here the fee increases the amount, so the denominator uses addition:

```
amountAfterFee  = amountBeforeFee + amountBeforeFee * feeBps / 10000
                = amountBeforeFee * (10000 + feeBps) / 10000

amountBeforeFee = amountAfterFee * 10000 / (10000 + feeBps)
feeAmount       = amountAfterFee * feeBps / (10000 + feeBps)
```

Applied to sell amount (where `sellAfterNetwork = sellAmount + feeAmount`):

```
protocolFeeAmount           = sellAfterNetwork * protocolFeeBps / (10000 + protocolFeeBps)
sellAmountBeforeProtocolFee = sellAfterNetwork - protocolFeeAmount
```

> Source: [`getProtocolFeeAmount()`](./getProtocolFeeAmount.ts)

### 4.2 Network fee (gas cost)

The network fee (`feeAmount`) represents the estimated gas cost in sell token.
It is **always added to sell amount**, regardless of order kind:

```
sellAmountAfterNetworkCosts = sellAmountBeforeNetworkCosts + feeAmount
```

To calculate `buyAmountBeforeNetworkCosts`, we need the quote price. The price is
the ratio of buy to sell tokens, but since the API amounts already include protocol fee,
we must account for it to get the true exchange rate.

The price is stored as a rational number ([`QuotePriceParams`](./quoteAmountsAndCosts.types.ts))
— a `numerator / denominator` pair — to avoid precision loss from floating-point division:

```
SELL: price = (buyAmountAfterNetworkCosts + protocolFeeAmount) / sellAmountBeforeNetworkCosts
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              restore the original buy amount (before protocol fee was deducted)

BUY:  price = buyAmountAfterNetworkCosts / (sellAmountBeforeNetworkCosts - protocolFeeAmount)
                                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                            restore the original sell amount (before protocol fee was added)
```

Then `buyAmountBeforeNetworkCosts` is computed via cross-multiplication (no floating-point):

```
buyAmountBeforeNetworkCosts = price.numerator * sellAmountAfterNetworkCosts / price.denominator
```

> Source: [`getQuoteAmountsWithNetworkCosts()`](./getQuoteAmountsWithNetworkCosts.ts)

### 4.3 Partner fee

`partnerFeeBps` is derived from [`TradeParameters.partnerFee`](../../../trading/src/types.ts)
which the caller passes when initiating a trade. It is converted to BPS via
[`getPartnerFeeBps()`](../../../trading/src/utils/getPartnerFeeBps.ts).

Partner fee is calculated from the "surplus amount" — the amount on the non-fixed side,
**before** protocol fee was applied. This ensures the partner fee is based on the full
trade volume, not the volume reduced by protocol fee:

```
SELL: surplusAmount   = buyAmountBeforeProtocolFee
      partnerFeeAmount = surplusAmount * partnerFeeBps / 10000
      afterPartnerFees.buyAmount = buyAmountAfterNetworkCosts - partnerFeeAmount

BUY:  surplusAmount   = sellAmountBeforeProtocolFee
      partnerFeeAmount = surplusAmount * partnerFeeBps / 10000
      afterPartnerFees.sellAmount = sellAmountAfterNetworkCosts + partnerFeeAmount
```

> Source: [`getQuoteAmountsAfterPartnerFee()`](./getQuoteAmountsAfterPartnerFee.ts)

### 4.4 Slippage

`slippagePercentBps` comes from [`TradeParameters.slippageBps`](../../../trading/src/types.ts).
If not provided by the caller, the SDK uses **auto slippage** — it fetches a quote first, then
calls [`suggestSlippageBps()`](../../../trading/src/suggestSlippageBps.ts) to determine an
appropriate value based on the fee-to-volume ratio and price impact.

Slippage tolerance protects the user from price movements between quoting and execution.
It is applied to the non-fixed side after all other fees:

```
slippageAmount(amount) = amount * slippageBps / 10000

SELL: afterSlippage.buyAmount  = afterPartnerFees.buyAmount  - slippageAmount(buyAmount)
BUY:  afterSlippage.sellAmount = afterPartnerFees.sellAmount + slippageAmount(sellAmount)
```

For example, with 200 BPS (2%) slippage on a sell order receiving 1000 COW:

```
slippageAmount = 1000 * 200 / 10000 = 20
afterSlippage.buyAmount = 1000 - 20 = 980 COW  (minimum the user will accept)
```

> Source: [`getQuoteAmountsAfterSlippage()`](./getQuoteAmountsAfterSlippage.ts)

## 5. The final signed order

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

## 6. Numeric example (SELL order)

Selling 0.16 WETH (18 decimals) for COW (6 decimals), with `protocolFeeBps = 20`,
`partnerFeeBps = 50`, and `slippageBps = 100` (1%):

```
Quote response (what the API returns):
  sellAmount     = 156144455961718918  (0.1561 WETH)
  buyAmount      =        18632013982  (18632 COW — protocol fee already deducted)
  feeAmount      =   3855544038281082  (0.0039 WETH)
  protocolFeeBps = 20
```

### Step 1 — Reconstruct protocol fee

The API already deducted protocol fee from `buyAmount`. We reverse it:

```
protocolFeeAmount = buyAmount * protocolFeeBps / (10000 - protocolFeeBps)
                  = 18632013982 * 20 / (10000 - 20)
                  = 37338705

buyAmountBeforeProtocolFee = 18632013982 + 37338705 = 18669352687
```

### Step 2 — Network fee

The network fee is always added to sell amount:

```
sellAmountAfterNetworkCosts = 156144455961718918 + 3855544038281082
                            = 160000000000000000  (0.16 WETH)
```

To find `buyAmountBeforeNetworkCosts`, we derive the quote price.
For SELL orders, the price numerator restores the original buy amount (before protocol fee):

```
price = (buyAmount + protocolFeeAmount) / sellAmount
      = 18669352687 / 156144455961718918    (kept as a rational number)

buyAmountBeforeNetworkCosts = price.numerator * sellAmountAfterNetworkCosts / price.denominator
                            = 18669352687 * 160000000000000000 / 156144455961718918
                            = 19130339348
```

At this point we have:

```
beforeAllFees:      sell = 156144455961718918   buy = 19130339348
beforeNetworkCosts: sell = 156144455961718918   buy = 18669352687
afterNetworkCosts:  sell = 160000000000000000   buy = 18632013982  (what the API returned)
```

### Step 3 — Partner fee (50 BPS = 0.5%)

Partner fee is calculated from `buyAmountBeforeProtocolFee` (the full trade volume):

```
partnerFeeAmount            = 18669352687 * 50 / 10000 = 93346763
afterPartnerFees.buyAmount  = 18632013982 - 93346763   = 18538667219
afterPartnerFees.sellAmount = 160000000000000000        (unchanged for SELL)
```

### Step 4 — Slippage (100 BPS = 1%)

Slippage is applied to the buy amount after all fees:

```
slippageAmount             = 18538667219 * 100 / 10000 = 185386672
afterSlippage.buyAmount    = 18538667219 - 185386672   = 18353280547
afterSlippage.sellAmount   = 160000000000000000         (unchanged for SELL)
```

### Signed order

```
sellAmount = 160000000000000000    (afterSlippage.sellAmount)
buyAmount  = 18353280547           (afterSlippage.buyAmount — minimum user will accept)
feeAmount  = 0                    (always zero in the signed order)
kind       = sell
```

## 7. Numeric example (BUY order)

Buying 2000 COW (6 decimals) with WETH (18 decimals), with `protocolFeeBps = 20`,
`partnerFeeBps = 50`, and `slippageBps = 100` (1%):

```
Quote response (what the API returns):
  sellAmount     = 168970833896526983  (0.1690 WETH — protocol fee already added)
  buyAmount      =         2000000000  (2000 COW)
  feeAmount      =   2947344072902629  (0.0029 WETH)
  protocolFeeBps = 20
```

### Step 1 — Reconstruct protocol fee

For BUY orders, the API added protocol fee to `sellAmount`. We reverse it.
Note that `sellAfterNetwork` is used because protocol fee was applied after network costs:

```
sellAmountAfterNetworkCosts = 168970833896526983 + 2947344072902629
                            = 171918177969429612

protocolFeeAmount = sellAfterNetwork * protocolFeeBps / (10000 + protocolFeeBps)
                  = 171918177969429612 * 20 / (10000 + 20)
                  = 343150055827204

sellAmountBeforeProtocolFee = 171918177969429612 - 343150055827204
                            = 171575027913602408
```

### Step 2 — Network fee

The network fee is always added to sell amount:

```
sellAmountAfterNetworkCosts = 168970833896526983 + 2947344072902629
                            = 171918177969429612  (0.1719 WETH)
```

For BUY orders, the price denominator restores the original sell amount (before protocol fee):

```
price = buyAmount / (sellAmount - protocolFeeAmount)
      = 2000000000 / 168627683840699779    (kept as a rational number)

buyAmountBeforeNetworkCosts = price.numerator * sellAmountAfterNetworkCosts / price.denominator
                            = 2000000000 * 171918177969429612 / 168627683840699779
                            = 2039026736
```

At this point we have:

```
beforeAllFees:      sell = 168627683840699779   buy = 2039026736
beforeNetworkCosts: sell = 171575027913602408   buy = 2039026736
afterNetworkCosts:  sell = 171918177969429612   buy = 2000000000  (what the API returned)
```

### Step 3 — Partner fee (50 BPS = 0.5%)

For BUY orders, partner fee is calculated from `sellAmountBeforeProtocolFee` and
**added** to sell amount (costs increase sell for BUY orders):

```
partnerFeeAmount            = 171575027913602408 * 50 / 10000 = 857875139568012
afterPartnerFees.sellAmount = 171918177969429612 + 857875139568012 = 172776053108997624
afterPartnerFees.buyAmount  = 2000000000                            (unchanged for BUY)
```

### Step 4 — Slippage (100 BPS = 1%)

For BUY orders, slippage is **added** to sell amount (user is willing to pay more):

```
slippageAmount             = 172776053108997624 * 100 / 10000 = 1727760531089976
afterSlippage.sellAmount   = 172776053108997624 + 1727760531089976 = 174503813640087600
afterSlippage.buyAmount    = 2000000000                             (unchanged for BUY)
```

### Signed order

```
sellAmount = 174503813640087600    (afterSlippage.sellAmount — maximum user will pay)
buyAmount  = 2000000000            (afterSlippage.buyAmount)
feeAmount  = 0                    (always zero in the signed order)
kind       = buy
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
