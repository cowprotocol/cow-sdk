# `getQuoteAmountsAndCosts` breaking changes after @cowprotocol/cow-sdk@7.35

This document compares how each field in [`QuoteAmountsAndCosts`](../types.ts) is computed
between the `main` branch and the current (refactored) branch.

## Running example

All comparisons use this example unless noted otherwise:

```
Sell 1 ETH for 2000 USDC
  sellAmount = 0.99 ETH   (API value)
  buyAmount  = 2000 USDC   (API value)
  feeAmount  = 0.01 ETH
  slippage   = 5 BPS
  protocolFeeBps = 0
  partnerFeeBps  = 0
```

**Key API asymmetry** (reflected in the current implementation):
- **SELL:** API's `sellAmount` is already **after** network costs (fee subtracted from user's total)
- **BUY:** API's `sellAmount` is **before** network costs (only protocol fee is baked in)

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
| `sellAmount` | `BigInt(orderParams.sellAmount) - protocolFeeAmount` | `sellAmount - protocolFeeAmount` (same formula, pure bigint) |
| `buyAmount` | float-derived via `quotePrice * sellAfterNetwork` | `buyAmount` (raw API value) |

**What changed:** For SELL, main used the raw API `sellAmount` (which is already after network
costs). Current correctly restores `sellAmount + feeAmount` so `beforeAllFees` truly means
before ALL fees. For BUY, the formula is the same but no longer uses float-derived values.

---

## 2. `beforeNetworkCosts` / `afterProtocolFees`

These are aliases — both equal `afterProtocolFees` in the return value.
Represents amounts after protocol fee is deducted but before network costs are applied.

### SELL order

| | main | current |
|---|---|---|
| `sellAmount` | **0.99 ETH** (raw API `sellAmount` — mislabeled!) | **1.0 ETH** (`sellAmount + networkCostAmount`) |
| `buyAmount` | conditional: float-derived OR `buy + protocolFee` | `buyAmount` (raw API value) |

### BUY order

| | main | current |
|---|---|---|
| `sellAmount` | conditional: float-derived OR `sell - protocolFee` | `sellAmount` (raw API value) |
| `buyAmount` | float-derived | `buyAmount` (raw API value) |

**What changed:** Main had a **naming bug** for SELL — it called `orderParams.sellAmount`
`sellAmountBeforeNetworkCosts`, but the API value is already AFTER network costs. Current fixes
this: `beforeNetworkCosts.sellAmount` for SELL = `sellAmount + feeAmount` (the true before-costs
amount). For BUY, `beforeNetworkCosts.sellAmount` = `sellAmount` (which for BUY is truly before
network costs since the API doesn't bake network costs into BUY sellAmount).

---

## 3. `afterNetworkCosts`

Amounts after network costs are applied.

### SELL order

| | main | current |
|---|---|---|
| `sellAmount` | `sell + fee` = **1.0 ETH** | `sellAmount` = **0.99 ETH** (raw API value) |
| `buyAmount` | `BigInt(orderParams.buyAmount)` = **2000 USDC** | `buyAmount` = **2000 USDC** (raw API value) |

### BUY order

| | main | current |
|---|---|---|
| `sellAmount` | `sell + fee` = **1.01 ETH** | `sellAmount + networkCostAmount` = **1.01 ETH** |
| `buyAmount` | raw API = **2000 USDC** | `buyAmount` = **2000 USDC** |

**What changed:** For SELL, this is the **naming fix**. Main treated `afterNetworkCosts.sellAmount`
as `sell + fee`, but that's actually the user's total *before* costs. Current correctly uses
the raw API `sellAmount`, which already has network costs subtracted.

For BUY, the behavior is the **same** as main — `sellAmount + networkCostAmount`. The API's BUY
`sellAmount` doesn't include network costs, so they must be added explicitly.

---

## 4. `afterPartnerFees`

Amounts after partner fee is subtracted (SELL) or added (BUY).

### Fee base amount

Both branches use `beforeAllFees` for the fee base:

| | main | current |
|---|---|---|
| SELL base | conditional: float-derived OR `buy + protocolFee` | `beforeAllFees.buyAmount` = `buyAmount + protocolFeeAmount` |
| BUY base | conditional: float-derived OR `sell - protocolFee` | `beforeAllFees.sellAmount` = `sellAmount - protocolFeeAmount` |

### Subtraction/addition target

| | main | current |
|---|---|---|
| SELL: subtracted from | `buyAmount` (raw API) | `afterNetworkCosts.buyAmount` = `buyAmount` (raw API) |
| BUY: added to | `sell + fee` | `afterNetworkCosts.sellAmount` = `sell + fee` |

**What changed:** The partner fee logic is the same. The base amount is now always pure bigint
(no float fallback). For both SELL and BUY, the targets are effectively the same as main.

---

## 5. `afterSlippage`

Amounts after slippage tolerance is applied. Logic is identical in both branches:
apply `slippagePercentBps` to `afterPartnerFees`. Since `afterPartnerFees` values for the
surplus token are the same (see above), `afterSlippage` produces the same results.

### SELL order (no partner fee, 5 BPS slippage)

| | main | current |
|---|---|---|
| `sellAmount` | **1.0 ETH** (sell + fee, unchanged) | **0.99 ETH** (raw API, unchanged) |
| `buyAmount` | `2000 - slippage(2000)` = **1999 USDC** | `2000 - slippage(2000)` = **1999 USDC** |

### BUY order (no partner fee, 5 BPS slippage, buy 2000 USDC for ~1.0 ETH, fee = 0.01 ETH)

| | main | current |
|---|---|---|
| `sellAmount` | `(1.0 + 0.01) + slippage(1.0 + 0.01)` | `(1.0 + 0.01) + slippage(1.0 + 0.01)` |
| `buyAmount` | **2000 USDC** | **2000 USDC** |

**What changed:** The surplus-side amounts (buyAmount for SELL, sellAmount for BUY) produce
identical results. The non-surplus side differs for SELL — `sellAmount` is now the raw API
value (0.99) instead of `sell + fee` (1.0). This doesn't affect the signed order because
`amountsToSign` picks the correct value.

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
(buyAmount * networkCostAmount) / sellAmount
```
Pure bigint cross-multiplication using the raw API amounts.

---

## Summary of changes

| # | Change | Impact |
|---|--------|--------|
| 1 | **Precision**: All `number`-based math (`getBigNumber`, `quotePrice`) replaced with pure `bigint` | Eliminates floating-point precision loss on large token amounts |
| 2 | **SELL `afterNetworkCosts.sellAmount`**: Now the raw API value, not `sell + fee` | Correct semantic: API already subtracted network costs for SELL |
| 3 | **SELL `beforeAllFees.sellAmount`**: Now `sellAmount + feeAmount`, not raw API value | Correct semantic: truly before ALL fees |
| 4 | **BUY `afterNetworkCosts`**: Unchanged (`sell + fee`) | API doesn't bake network costs into BUY sellAmount |
| 5 | **`amountsToSign`**: New field with the correct amounts for the signed order | Consumers no longer need to figure out the correct combination |
| 6 | **`afterProtocolFees`**: New explicit field (alias for `beforeNetworkCosts`) | Makes the fee application chain more readable |
| 7 | **Partner fee base**: Always uses `beforeAllFees` in pure bigint | No more conditional float fallback |
