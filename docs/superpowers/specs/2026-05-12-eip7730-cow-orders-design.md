# EIP-7730 Clear-Signing Metadata for CoW Protocol Orders

**Status:** Draft
**Date:** 2026-05-12
**Owner:** alexandr@cow.fi
**Reference:** [EIP-7730](https://eips.ethereum.org/EIPS/eip-7730)

## Goal

Author EIP-7730 clear-signing metadata for the CoW Protocol `Order` EIP-712 message so that compatible wallets (Ledger devices, hardware wallets, and software wallets that consume the Ledger clear-signing registry) can render human-readable order details on the signing screen instead of raw bytes.

The deliverable is a **single registry-ready JSON file**. No SDK runtime changes, no new package, no automated test pipeline in this scope.

## Non-Goals

- Cancellation messages (`OrderCancellation`, `OrderCancellations`) — out of scope; can be added in a follow-up spec.
- Staging (Barn) deployment metadata — production only.
- SDK package exposing the metadata at runtime.
- Automated generator from a single source — the JSON is short enough to author by hand.
- Submission to the Ledger registry — this spec produces the file; submission is a separate manual step.

## Background

CoW Protocol orders are submitted off-chain as EIP-712 typed-data signatures. The signed struct is:

```
Order(
  address sellToken,
  address buyToken,
  address receiver,
  uint256 sellAmount,
  uint256 buyAmount,
  uint32  validTo,
  bytes32 appData,
  uint256 feeAmount,
  string  kind,
  bool    partiallyFillable,
  string  sellTokenBalance,
  string  buyTokenBalance
)
```

Source: `packages/contracts-ts/src/order.ts:53-66` (`ORDER_TYPE_FIELDS`).

The EIP-712 domain is:

| Field | Value |
|---|---|
| `name` | `Gnosis Protocol` |
| `version` | `v2` |
| `chainId` | per chain |
| `verifyingContract` | settlement contract (same address on all production chains) |

Domain source: `ContractsTs.domain` invoked from `packages/order-signing/src/utils.ts:225`.

## Deliverable

### File

`packages/order-signing/metadata/eip7730/eip712-cow-order.json`

### Deployments

One file, with `context.eip712.deployments` listing all 11 production chains. Same verifying contract `0x9008D19f58AAbD9eD0D60971565AA8510560ab41` everywhere.

| Chain | chainId |
|---|---|
| Ethereum Mainnet | 1 |
| BNB Smart Chain | 56 |
| Gnosis Chain | 100 |
| Polygon | 137 |
| Base | 8453 |
| Plasma | 9745 |
| Arbitrum One | 42161 |
| Avalanche | 43114 |
| Ink | 57073 |
| Linea | 59144 |
| Sepolia | 11155111 |

Source: `packages/config/src/chains/types.ts:26-36` (chainId constants) and `packages/config/src/chains/const/contracts.ts:10,16` (`COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS`).

### File structure (top level)

```jsonc
{
  "$schema": "https://eips.ethereum.org/assets/eip-7730/erc7730-v1.schema.json",
  "context":  { /* eip712 schema + domain + deployments */ },
  "metadata": { /* owner, info, enums */ },
  "display":  { /* formats.Order */ }
}
```

## Field display mapping

EIP-7730 renders the fields of `display.formats.Order.fields` in array order. CoW order display order, top to bottom on the signing screen:

| # | Order field | EIP-7730 format | Label | Notes |
|---|---|---|---|---|
| 1 | `kind` | `enum` → `$.metadata.enums.kind` | Order type | `sell`/`buy` |
| 2 | `sellAmount` | `tokenAmount`, `tokenPath: "sellToken"` | Sell | Wallet resolves decimals/symbol from `sellToken` |
| 3 | `buyAmount` | `tokenAmount`, `tokenPath: "buyToken"` | Buy at least | Same pattern |
| 4 | `receiver` | `addressName` (with `types`/`sources` per EIP-7730 schema) | Receiver | Wallet may resolve to ENS/known name; exact `types` array values chosen at JSON-authoring time per the schema |
| 5 | `validTo` | `date`, `encoding: "timestamp"` | Valid until | Unix seconds (uint32) |
| 6 | `partiallyFillable` | `raw` | Allow partial fills | Bool rendered natively |
| 7 | `sellTokenBalance` | `enum` → `$.metadata.enums.balance` | Sell balance source | erc20/external/internal |
| 8 | `buyTokenBalance`  | `enum` → `$.metadata.enums.balance` | Buy balance destination | erc20/internal only in practice |
| 9 | `appData` | `raw` | App data hash | bytes32 keccak of IPFS JSON; not on-device resolvable |

**Fields omitted from `fields` list:**

- `sellToken` — referenced as `tokenPath` by `sellAmount`. EIP-7730 convention: omit address from explicit rows when it serves as a token path for an amount.
- `buyToken` — same, referenced by `buyAmount`.

These two are added to `display.formats.Order.excluded` to explicitly mark them as intentionally not displayed (so wallets don't warn about field-count mismatch).

**`feeAmount`:**

Excluded from display via `display.formats.Order.excluded`. Rationale: CoW Protocol v2 collects fees via solver surplus, not via the `feeAmount` field. For end-user orders submitted through the protocol the field is `0`. Hiding it reduces signing-screen noise; the `excluded` array is signed metadata that explicitly asserts protocol-owner intent.

Final `excluded` array: `["sellToken", "buyToken", "feeAmount"]`.

## Enums

```jsonc
"metadata": {
  "enums": {
    "kind": {
      "sell": "Sell order — sell exact sellAmount for at least buyAmount",
      "buy":  "Buy order — buy exact buyAmount for at most sellAmount"
    },
    "balance": {
      "erc20":    "Standard ERC-20 balance",
      "external": "Balancer Vault external balance (sell side only)",
      "internal": "Balancer Vault internal balance"
    }
  }
}
```

`buyTokenBalance` only legally accepts `erc20`/`internal` (see `normalizeBuyTokenBalance` in `packages/contracts-ts/src/order.ts:107`). Reusing the single `balance` enum is intentional — invalid values cannot be reached via the SDK normalization path.

## Metadata.info

```jsonc
"metadata": {
  "owner": "CoW Protocol",
  "info": {
    "legalName": "CoW DAO",
    "url": "https://cow.fi",
    "deploymentDate": "2022-03-01"
  }
}
```

`deploymentDate` is the mainnet GPv2 launch date and applies as the earliest deployment across all listed chains. **Verify before submission:** confirm exact `legalName` (`CoW DAO` vs other legal entity) and `deploymentDate` with the CoW team — values above are placeholders pending confirmation.

## Validation

No automated tests in this scope. Pre-submission checks done manually before opening a registry PR:

1. JSON validates against `https://eips.ethereum.org/assets/eip-7730/erc7730-v1.schema.json` (editor lint via `$schema`).
2. Lint with Ledger's reference tooling: `pip install erc7730 && erc7730 lint packages/order-signing/metadata/eip7730/eip712-cow-order.json`.
3. Visual check in Ledger's clear-signing simulator using a sample CoW order payload.

These steps are documented in a short `README.md` colocated with the JSON file (e.g., `packages/order-signing/metadata/eip7730/README.md`) so future contributors can repeat them.

## Out of scope follow-ups

- Cancellation message metadata (`OrderCancellation`, `OrderCancellations`).
- Staging (Barn) deployment file at settlement address `0xf553d092b50bdcbddeD1A99aF2cA29FBE5E2CB13`.
- Submitting the file to the Ledger clear-signing registry (separate PR to that repo).
- Runtime exposure via a new `@cowprotocol/sdk-*` package.
