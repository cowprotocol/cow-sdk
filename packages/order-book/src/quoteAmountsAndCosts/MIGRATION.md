# `getQuoteAmountsAndCosts` breaking changes after @cowprotocol/cow-sdk@7.35

This document compares how each field in [`QuoteAmountsAndCosts`](../types.ts) is computed
between the `main` branch and the current (refactored) branch.

## Running example

All comparisons use this example unless noted otherwise:

```
Sell 1 ETH for 2000 USDC
  sellAmount = 0.99 ETH   (API value, after network costs)
  buyAmount  = 2000 USDC   (API value)
  feeAmount  = 0.01 ETH
  slippage   = 5 BPS
  protocolFeeBps = 0
  partnerFeeBps  = 0
```

---

## 1. `beforeAllFees`

True spot price amounts — what the trade would look like with zero fees.

### SELL order

| | main | current |
|---|---|---|
| `sellAmount` | `BigInt(orderParams.sellAmount)` = **0.99 ETH** | `sellAmount + networkCostAmount` = **1.0 ETH** |
| `buyAmount` | float-derived via `quotePrice * sellAfterNetwork` | `buyAmount + protocolFeeAmount` = **2000 USDC** |

### BUY order

| | main | current |
|---|---|---|
| `sellAmount` | `BigInt(orderParams.sellAmount)` minus float-derived protocolFee | `sellBeforeNetworkCosts - protocolFeeAmount` (pure bigint) |
| `buyAmount` | float-derived via `quotePrice * sellAfterNetwork` | `buyAmount` (raw API value) |

**What changed:** Main used the raw API `sellAmount` (which is already after network costs).
Current correctly restores `sellAmount + feeAmount` for SELL, `sellAmount - feeAmount` for BUY.
This is a **semantic fix** — `beforeAllFees` now truly means before ALL fees.

---

## 2. `beforeNetworkCosts` / `afterProtocolFees`

These are aliases — both equal `afterProtocolFees` in the return value.
Represents amounts after protocol fee is deducted but before network costs are applied.

### SELL order

| | main | current |
|---|---|---|
| `sellAmount` | **0.99 ETH** (raw API `sellAmount` — mislabeled!) | **1.0 ETH** (`sellAmount + networkCostAmount`) |
| `buyAmount` | conditional: float-derived OR `buy + protocolFee` | `buyAmount + protocolFeeAmount` = **2000 USDC** |

### BUY order

| | main | current |
|---|---|---|
| `sellAmount` | conditional: float-derived OR `sell - protocolFee` | `sellAmount - feeAmount` |
| `buyAmount` | float-derived | `buyAmount` (raw API value) |

**What changed:** Main had a **naming bug** — it named `orderParams.sellAmount` as
`sellAmountBeforeNetworkCosts`, but this value is actually AFTER network costs (the API
bakes network costs in). The old code then added `feeAmount` to get `sellAmountAfterNetworkCosts`,
which was really `sellAmount + feeAmount`. Current branch fixes this:
API's `sellAmount` IS `afterNetworkCosts`, and `beforeNetworkCosts = sellAmount ± feeAmount`.

---

## 3. `afterNetworkCosts`

What the API returns — amounts with network costs already applied.

### SELL order

| | main | current |
|---|---|---|
| `sellAmount` | `sell + fee` = **1.0 ETH** | `sellAmount` = **0.99 ETH** (raw API value) |
| `buyAmount` | `BigInt(orderParams.buyAmount)` = **2000 USDC** | `buyAmount + protocolFeeAmount` = **2000 USDC** |

### BUY order

| | main | current |
|---|---|---|
| `sellAmount` | `sell + fee` | raw API `sellAmount` |
| `buyAmount` | raw API | raw API |

**What changed:** This is the **naming fix inversion**. Main treated
`afterNetworkCosts.sellAmount` as `sell + fee` (i.e., the total the user pays including the
fee on top). Current correctly treats API's `sellAmount` as already-after-network-costs.

---

## 4. `afterPartnerFees`

Amounts after partner fee is subtracted (SELL) or added (BUY).

### Fee base amount

| | main | current |
|---|---|---|
| SELL base | conditional: float-derived OR `buy + protocolFee` | `beforeAllFees.buyAmount` = `buy + protocolFee` |
| BUY base | conditional: float-derived OR `sell - protocolFee` | `beforeAllFees.sellAmount` = `sellBeforeNetwork - protocolFee` |

### Subtraction/addition target

| | main | current |
|---|---|---|
| SELL: subtracted from | `buyAmountAfterNetworkCosts` = raw API buy | `afterNetworkCosts.buyAmount` = `buy + protocolFee` |
| BUY: added to | `sellAmountAfterNetworkCosts` = sell + fee | `afterNetworkCosts.sellAmount` = raw API sell |

**What changed:** The partner fee calculation logic is the same, but the base amount
and target amount are different due to the naming fix. Now consistently uses `beforeAllFees`
(true spot price) for the base and `afterNetworkCosts` for the target. No more conditional
float fallback.

---

## 5. `afterSlippage`

Amounts after slippage tolerance is applied. Logic is identical in both branches:
apply `slippagePercentBps` to `afterPartnerFees`. But since `afterPartnerFees` values
differ (see above), the final amounts differ too.

### SELL order (no partner fee, 5 BPS slippage)

| | main | current |
|---|---|---|
| `sellAmount` | **1.0 ETH** (sell + fee, unchanged) | **0.99 ETH** (raw API, unchanged) |
| `buyAmount` | `2000 - slippage(2000)` = **1999 USDC** | `2000 - slippage(2000)` = **1999 USDC** |

### BUY order (no partner fee, 5 BPS slippage, buy 2000 USDC for ~1.0 ETH, fee = 0.01 ETH)

| | main | current |
|---|---|---|
| `sellAmount` | `(1.0 + 0.01) + slippage(1.0 + 0.01)` | `1.0 + slippage(1.0)` |
| `buyAmount` | **2000 USDC** | **2000 USDC** |

---

## 6. `amountsToSign` (new in current branch)

**Main branch:** Did not exist. Consumers had to figure out which amounts to put in the signed order.

**Current branch:**

```
SELL: { sellAmount: beforeAllFees.sellAmount, buyAmount: afterSlippage.buyAmount }
BUY:  { sellAmount: afterSlippage.sellAmount, buyAmount: beforeAllFees.buyAmount }
```

- **SELL:** sign with `sellAmount = 1.0 ETH` (before all fees — settlement contract subtracts
  network costs), `buyAmount = 1999 USDC` (minimum after slippage)
- **BUY:** sign with `sellAmount = afterSlippage` (maximum willing to pay),
  `buyAmount = 2000 USDC` (exact amount wanted)

---

## 7. `costs.networkFee.amountInBuyCurrency`

**Main branch:**
```
getBigNumber(quotePrice * networkCostAmount.num, buyDecimals).big
```
Double precision loss: `quotePrice` is a `number`, `networkCostAmount.num` is a `number`,
multiply them, then convert back to bigint.

**Current branch:**
```
(quotePriceParams.numerator * networkCostAmount) / quotePriceParams.denominator
```
Pure bigint cross-multiplication. `numerator = buyAmount`, `denominator = sellAmount`.

---

## Summary of changes

| # | Change | Impact |
|---|--------|--------|
| 1 | **Precision**: All `number`-based math (`getBigNumber`, `quotePrice`) replaced with pure `bigint` | Eliminates floating-point precision loss on large token amounts |
| 2 | **Naming fix**: `afterNetworkCosts.sellAmount` is now the raw API value (correct), not `sell + fee` (was wrong) | All downstream calculations use correct base values |
| 3 | **`beforeAllFees` fix**: Now truly represents spot price — `sellAmount + feeAmount` for SELL | Was just the raw API value before (which is after network costs) |
| 4 | **`amountsToSign`**: New field that explicitly gives the amounts to put in the signed order | Consumers no longer need to figure out the correct combination |
| 5 | **Partner fee base**: Always uses `beforeAllFees` (spot price) instead of a conditional with float fallback | Simpler, more predictable, no precision loss |
| 6 | **`afterProtocolFees`**: New explicit field (alias for `beforeNetworkCosts`) for clarity | Makes the fee application chain more readable |
