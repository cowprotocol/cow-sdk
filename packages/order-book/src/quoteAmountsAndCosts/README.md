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
| `sellAmount` | Amount of sell token (see below for SELL vs BUY interpretation)             |
| `buyAmount`  | Amount of buy token the user will receive                                   |
| `feeAmount`  | Estimated gas cost in sell token to settle the order on-chain               |

**How `sellAmount` differs between SELL and BUY orders:**
- **SELL orders:** `sellAmount` is **after** network costs — the API already subtracted `feeAmount`
  from the user's total. So `sellAmount + feeAmount` = user's original amount.
- **BUY orders:** `sellAmount` is **before** network costs — `feeAmount` is provided separately
  and must be added to get the total the user will pay.

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
               │ (= afterProtocol)   │               │ (= afterProtocol)   │
               │ sell · buy          │               │ sell · buy          │
               └─────────┬───────────┘               └────────┬────────────┘
                         │                                     │
                   ┌─────┴──────┐                        ┌─────┴──────┐
                   │Network fee │                        │Network fee │
                   │ -sell -buy │                        │ +sell      │
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
                   └─────┬──────┘                        └─────┬──────┘
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
               └─────────────────────┘               └─────────────────────┘

                   amountsToSign:                        amountsToSign:
                   sell = beforeAllFees                   sell = afterSlippage
                   buy  = afterSlippage                   buy  = beforeAllFees
```

**Key principle:** fees and costs always make the trade worse for the user:
- **SELL orders:** the user sells a fixed amount, so costs **reduce** `buyAmount`
- **BUY orders:** the user buys a fixed amount, so costs **increase** `sellAmount`

**Network fee asymmetry:**
- For **SELL** orders, the API already subtracted `feeAmount` from `sellAmount`, so
  going from `beforeNetworkCosts` to `afterNetworkCosts` is a **decrease** in both
  sellAmount and buyAmount (buyAmount is reduced by the network cost converted to buy currency).
- For **BUY** orders, `feeAmount` is separate, so going from `beforeNetworkCosts` to
  `afterNetworkCosts` is an **increase** in sellAmount. `buyAmount` is unaffected.

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
The way it affects amounts differs between order kinds:

**SELL orders:** The API already subtracted `feeAmount` from `sellAmount`, and `buyAmount`
is correlated to this reduced `sellAmount`. The SDK reconstructs both original amounts:

```
networkCostAmountInBuyCurrency = buyAmount * feeAmount / sellAmount

beforeNetworkCosts.sellAmount  = sellAmount + feeAmount                   (restore the user's total)
beforeNetworkCosts.buyAmount   = buyAmount + networkCostAmountInBuyCurrency (restore buy side too)
afterNetworkCosts.sellAmount   = sellAmount                                (what the API returned)
afterNetworkCosts.buyAmount    = buyAmount                                 (what the API returned)
```

**BUY orders:** The API's `sellAmount` does not include `feeAmount`. The SDK adds it:

```
beforeNetworkCosts.sellAmount = sellAmount                (what the API returned)
afterNetworkCosts.sellAmount  = sellAmount + feeAmount    (total user will pay)
```

For BUY orders, `buyAmount` is unaffected by network costs.

The network fee in buy currency is computed via cross-multiplication:

```
costs.networkFee.amountInBuyCurrency = buyAmount * feeAmount / sellAmount
```

> Source: [`getQuoteAmountsAndCosts()`](./getQuoteAmountsAndCosts.ts)

### 4.3 Partner fee

`partnerFeeBps` is derived from [`TradeParameters.partnerFee`](../../../trading/src/types.ts)
which the caller passes when initiating a trade. It is converted to BPS via
[`getPartnerFeeBps()`](../../../trading/src/utils/getPartnerFeeBps.ts).

Partner fee is calculated from `beforeAllFees` — the spot price amounts before any fees
were applied. This ensures the partner fee is based on the full trade volume:

```
SELL: partnerFeeAmount = beforeAllFees.buyAmount  * partnerFeeBps / 10000
      afterPartnerFees.buyAmount  = afterNetworkCosts.buyAmount  - partnerFeeAmount
      afterPartnerFees.sellAmount = afterNetworkCosts.sellAmount  (unchanged)

BUY:  partnerFeeAmount = beforeAllFees.sellAmount * partnerFeeBps / 10000
      afterPartnerFees.sellAmount = afterNetworkCosts.sellAmount + partnerFeeAmount
      afterPartnerFees.buyAmount  = afterNetworkCosts.buyAmount   (unchanged)
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

The [`amountsToSign`](../types.ts) field provides the correct amounts for the signed order:

```
SELL: amountsToSign = { sellAmount: beforeAllFees.sellAmount, buyAmount: afterSlippage.buyAmount }
BUY:  amountsToSign = { sellAmount: afterSlippage.sellAmount, buyAmount: beforeAllFees.buyAmount }
```

- **SELL:** The settlement contract subtracts network costs from `sellAmount`, so we sign with
  `beforeAllFees.sellAmount` (the user's full amount). `buyAmount` is the minimum after all
  fees and slippage.
- **BUY:** The user pays up to `afterSlippage.sellAmount` (includes all fees and slippage
  tolerance). `buyAmount` is the exact amount they want to receive.

When posting to the order book:

| Order field    | Value                                                                      |
|----------------|----------------------------------------------------------------------------|
| `sellAmount`   | `amountsToSign.sellAmount`                                                 |
| `buyAmount`    | `amountsToSign.buyAmount`                                                  |
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
  sellAmount     = 156144455961718918  (0.1561 WETH — after network costs)
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
```

### Step 2 — Compute all amount stages

For SELL orders, `sellAmount` from the API is already after network costs, and `buyAmount`
is correlated to that reduced `sellAmount`. We restore both originals:

```
networkCostAmountInBuyCurrency = buyAmount * feeAmount / sellAmount
                               = 18632013982 * 3855544038281082 / 156144455961718918
                               = 460064688

beforeAllFees:
  sellAmount = sellAmount + feeAmount                                          = 160000000000000000
  buyAmount  = buyAmount + networkCostAmountInBuyCurrency + protocolFeeAmount  = 18632013982 + 460064688 + 37338705 = 19129417375

beforeNetworkCosts (= afterProtocolFees):
  sellAmount = beforeAllFees.sellAmount                    = 160000000000000000
  buyAmount  = beforeAllFees.buyAmount - protocolFeeAmount = 19129417375 - 37338705 = 19092078670

afterNetworkCosts:
  sellAmount = sellAmount                                  = 156144455961718918  (raw API value)
  buyAmount  = buyAmount                                   = 18632013982  (raw API value)
```

### Step 3 — Partner fee (50 BPS = 0.5%)

Partner fee is calculated from `beforeAllFees.buyAmount` (the full trade volume):

```
partnerFeeAmount            = 19129417375 * 50 / 10000 = 95647086
afterPartnerFees.sellAmount = 156144455961718918        (unchanged for SELL)
afterPartnerFees.buyAmount  = 18632013982 - 95647086   = 18536366896
```

### Step 4 — Slippage (100 BPS = 1%)

Slippage is applied to the buy amount after all fees:

```
slippageAmount             = 18536366896 * 100 / 10000 = 185363668
afterSlippage.sellAmount   = 156144455961718918         (unchanged for SELL)
afterSlippage.buyAmount    = 18536366896 - 185363668   = 18351003228
```

### Signed order

```
amountsToSign.sellAmount = 160000000000000000  (beforeAllFees.sellAmount)
amountsToSign.buyAmount  = 18351003228         (afterSlippage.buyAmount — minimum user will accept)
feeAmount                = 0                   (always zero in the signed order)
kind                     = sell
```

## 7. Numeric example (BUY order)

Buying 2000 COW (6 decimals) with WETH (18 decimals), with `protocolFeeBps = 20`,
`partnerFeeBps = 50`, and `slippageBps = 100` (1%):

```
Quote response (what the API returns):
  sellAmount     = 168970833896526983  (0.1690 WETH — protocol fee already added, before network costs)
  buyAmount      =         2000000000  (2000 COW)
  feeAmount      =   2947344072902629  (0.0029 WETH)
  protocolFeeBps = 20
```

### Step 1 — Reconstruct protocol fee

For BUY orders, the API added protocol fee to `sellAmount`. We reverse it.
Note that `sellAfterNetwork = sellAmount + feeAmount` is used because the protocol fee
formula accounts for the full sell-side amount:

```
sellAfterNetwork  = 168970833896526983 + 2947344072902629 = 171918177969429612

protocolFeeAmount = sellAfterNetwork * protocolFeeBps / (10000 + protocolFeeBps)
                  = 171918177969429612 * 20 / (10000 + 20)
                  = 343150055827204
```

### Step 2 — Compute all amount stages

For BUY orders, `sellAmount` from the API is before network costs (but includes protocol fee).
Network costs are added on top:

```
beforeAllFees:
  sellAmount = sellAmount - protocolFeeAmount  = 168970833896526983 - 343150055827204 = 168627683840699779
  buyAmount  = buyAmount                       = 2000000000

beforeNetworkCosts (= afterProtocolFees):
  sellAmount = sellAmount                      = 168970833896526983  (raw API value)
  buyAmount  = buyAmount                       = 2000000000

afterNetworkCosts:
  sellAmount = sellAmount + feeAmount          = 168970833896526983 + 2947344072902629 = 171918177969429612
  buyAmount  = buyAmount                       = 2000000000
```

### Step 3 — Partner fee (50 BPS = 0.5%)

For BUY orders, partner fee is calculated from `beforeAllFees.sellAmount` and
**added** to sell amount (costs increase sell for BUY orders):

```
partnerFeeAmount            = 168627683840699779 * 50 / 10000 = 843138419203498
afterPartnerFees.sellAmount = 171918177969429612 + 843138419203498 = 172761316388633110
afterPartnerFees.buyAmount  = 2000000000                            (unchanged for BUY)
```

### Step 4 — Slippage (100 BPS = 1%)

For BUY orders, slippage is **added** to sell amount (user is willing to pay more):

```
slippageAmount             = 172761316388633110 * 100 / 10000 = 1727613163886331
afterSlippage.sellAmount   = 172761316388633110 + 1727613163886331 = 174488929552519441
afterSlippage.buyAmount    = 2000000000                             (unchanged for BUY)
```

### Signed order

```
amountsToSign.sellAmount = 174488929552519441  (afterSlippage.sellAmount — maximum user will pay)
amountsToSign.buyAmount  = 2000000000          (beforeAllFees.buyAmount)
feeAmount                = 0                   (always zero in the signed order)
kind                     = buy
```

## Source files

| File                                                                            | Responsibility                                   |
|---------------------------------------------------------------------------------|--------------------------------------------------|
| [`getQuoteAmountsAndCosts.ts`](./getQuoteAmountsAndCosts.ts)                    | Main orchestrator, combines all steps            |
| [`getProtocolFeeAmount.ts`](./getProtocolFeeAmount.ts)                          | Reconstructs protocol fee from baked-in amounts  |
| [`getQuoteAmountsAfterPartnerFee.ts`](./getQuoteAmountsAfterPartnerFee.ts)      | Partner fee calculation                          |
| [`getQuoteAmountsAfterSlippage.ts`](./getQuoteAmountsAfterSlippage.ts)          | Slippage tolerance application                   |
| [`quoteAmountsAndCosts.types.ts`](./quoteAmountsAndCosts.types.ts)              | Type definitions for parameters and results      |
| [`../types.ts`](../types.ts)                                                    | [`QuoteAmountsAndCosts`](../types.ts), [`Amounts`](../types.ts), [`Costs`](../types.ts) interfaces |
