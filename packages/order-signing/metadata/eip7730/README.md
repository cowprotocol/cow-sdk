# EIP-7730 Clear-Signing Metadata

This directory contains [EIP-7730](https://eips.ethereum.org/EIPS/eip-7730) clear-signing metadata for CoW Protocol EIP-712 messages.

## Files

- `eip712-cow-order.json` — clear-signing metadata for the `Order` EIP-712 message (order placement). Covers all production chains where CoW Protocol is deployed.

## Validation

Before submitting to the Ledger clear-signing registry, validate the JSON locally:

```bash
pip install erc7730
erc7730 lint packages/order-signing/metadata/eip7730/eip712-cow-order.json
```

The `$schema` field in each JSON file also enables editor-side validation in VS Code / JetBrains IDEs.

## Submission

These files are designed for submission to the [Ledger clear-signing registry](https://github.com/LedgerHQ/clear-signing-erc7730-registry). Submission is a manual PR to that repository; this monorepo holds the source of truth.

## Last validation

- `erc7730 lint` passed locally on 2026-05-12 against `eip712-cow-order.json`.

## Verification checklist (before registry submission)

The following values in `eip712-cow-order.json` are not pinned to source-of-truth in this repo and should be confirmed by a CoW Protocol maintainer before the registry PR is opened:

- [ ] `metadata.info.legalName` — currently `"CoW DAO"`. Confirm this is the correct legal entity name.
- [ ] `metadata.info.deploymentDate` — currently `"2022-03-01T00:00:00Z"`. Confirm against the earliest GPv2 mainnet deployment timestamp.
- [ ] `metadata.info.url` — currently `"https://cow.fi"`. Confirm this is the canonical project URL Ledger should display.
