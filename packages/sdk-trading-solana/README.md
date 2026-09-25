<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" alt="CoW Protocol logo" />
</p>

# Solana Trading SDK

## Test coverage

| Statements                                                                              | Branches                                                                            | Functions                                                                             | Lines                                                                         |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| ![Statements](https://img.shields.io/badge/statements-87.82%25-yellow.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-87.91%25-yellow.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-62.74%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-94.37%25-brightgreen.svg?style=flat) |

`@cowprotocol/sdk-trading-solana` is CoW Protocol's Solana settlement client: it turns a quote
into an on-chain `CreateOrder` instruction against the CoW Protocol Solana
settlement program.

**Experimental.** The settlement program (`cow-settlement-interface` / `solana-programs`) is a young,
actively evolving deployment — expect breaking changes to the intent wire format, PDA seeds and this
package's API across minor versions. The currently deployed program id is exported as
[`SOLANA_SETTLEMENT_PROGRAM_ID`](https://github.com/cowprotocol/cow-sdk/blob/main/packages/config/src/chains/const/contracts.ts)
from `@cowprotocol/sdk-config` — see it on
[Solana Explorer](https://explorer.solana.com/address/FYp8R5K4B3B1Kfr7QuWzMz4TwoT7wptjYtxgCrY5sRXb).

```
npm install @cowprotocol/sdk-trading-solana
```

A runnable end-to-end example lives in [`examples/nodejs/solana`](../../examples/nodejs/solana).

## Making a trade

### Step 0 — approve the settlement program as SPL delegate

The settlement program moves funds out of the seller's token account via a CPI, which SPL Token
only allows for an approved `delegate`. Before any order on a given sell-token account can settle,
that account's owner must approve the settlement **state PDA** (not the program id itself) as
delegate, for at least the amount being sold. `approveCowProtocol` builds that instruction without
sending it, deriving the sell-token account and delegate for you:

```ts
const sdk = new SolanaTradingSdk() // same env as the SDK instance used for the quote below

const approveInstruction = sdk.approveCowProtocol({
  ownerAddress: owner,
  sellTokenAddress: sellMint,
  approveAmount, // at least the order's sellAmount
})
```

This approval is **not one-time**: like any SPL delegate, each settled order decrements the
delegate's remaining allowance by the amount actually transferred, so approving once for exactly one
order's `sellAmount` leaves nothing for the next one. Check the sell-token account's current
`delegate`/`delegatedAmount` before building an order, and reapprove (topping the allowance back up)
whenever it's insufficient — approving a new amount replaces the previous allowance rather than
adding to it. Separately, because the delegate PDA is derived from the settlement program's
major/minor version (`getSettlementSeed`), a program upgrade that bumps that version changes the
delegate address entirely, requiring a fresh approval regardless of remaining allowance. This step
can be sent as its own transaction ahead of time, or bundled with the `CreateOrder` instruction in
the same transaction — see [Step 2](#step-2--create-the-order) below.

### Step 1 — get a quote

Quoting needs no signer, just the addresses and amount:

```ts
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

const sdk = new SolanaTradingSdk() // pass `{ env: 'staging' }` to target staging

const { quoteResults, solanaQuote, buildOrder, postSwapOrderFromQuote } = await sdk.getQuote({
  ownerAddress, // the seller's wallet — signs the CreateOrder transaction
  sellTokenAddress,
  sellTokenDecimals,
  buyTokenAddress,
  buyTokenDecimals,
  amount, // bigint — sell-side amount for a SELL order, buy-side amount for a BUY order
  kind: OrderKind.SELL,
})
```

- `quoteResults` mirrors the EVM SDK's [`QuoteResults`](../trading/src/types.ts) (trade parameters, suggested slippage, amounts
  and costs) so UI code can share formatting logic across chains.
- `solanaQuote` is the Solana-specific quote: the order **intent** that was built from the quote
  response, its encoded bytes, its `uid`, the order PDA it will live at, and the raw upstream quote
  (real amounts/slippage) the intent was derived from.
- Native SOL is accepted as the sentinel address; it's substituted with wrapped SOL (WSOL) before
  quoting and building the intent, since Solana has no native-token mint to reference on-chain.
- Passing `sellTokenProgramId` / `buyTokenProgramId` (e.g. `TOKEN_2022_PROGRAM_ID`) is required for
  Token-2022 mints, since the associated token account address differs by program.

### Step 2 — create the order

Two ways to get the order on-chain, depending on whether you need to bundle it with other
instructions:

**Let the SDK submit it as its own transaction** — pass a signing/sending function at the point of
signing:

```ts
const result = await postSwapOrderFromQuote(signAndSend)
// result.orderId, result.txHash / result.signature
```

`signAndSend` has the shape `(instruction: TransactionInstruction) => Promise<{ signature: string }>`
— build, sign and send the transaction however fits your app (a `Connection` + `Keypair`, a wallet
adapter, a Squads/Safe-style multisig flow, etc).

**Bundle the order with your own instructions** — a Solana order is created by a single instruction,
so it can share one transaction with, say, the Step 0 delegate approval, a native-SOL wrap, or
anything else. `buildOrder` returns that instruction without sending it:

```ts
const { instruction, orderId, orderPda, uid } = await buildOrder()

await sendMyTransaction([approveInstruction, instruction])
```

This is the recommended path whenever the sell-token account's delegate allowance needs
topping up for this trade, since it lets the delegate approval and the order creation land
atomically in one transaction.

Both paths accept the same optional `advancedSettings` (currently `quoteRequest.receiver` and
`quoteRequest.validTo`) and apply them identically — overriding `receiver` or `validTo` re-derives
the order's `uid` and PDA so they still match the intent actually being created:

```ts
await postSwapOrderFromQuote(signAndSend, { quoteRequest: { receiver: otherWallet.toBase58() } })
```

### Step 3 — read back the result

Both `postSwapOrderFromQuote` and `buildOrder` return an `orderId` — the `uid` as the `0x`-prefixed
hex string the CoW order-book API uses for EVM orders too, so it can be handled uniformly by shared
UI/state code. `solanaQuote.orderPda` is the on-chain account the order lives at once the
`CreateOrder` instruction lands.

## Limit orders

`getQuote`'s `buildOrder` always signs the market-quoted amount (± slippage) — correct for a swap,
but wrong for a limit order that should rest on-chain at a price the caller chooses, not a snapshot
of the market at signing time. `buildLimitOrder` builds that same kind of `CreateOrder` instruction
directly from the caller's own `sellAmount`/`buyAmount`, without calling `getQuote` at all:

```ts
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

const sdk = new SolanaTradingSdk()

const { instruction, orderId, orderPda, uid } = await sdk.buildLimitOrder({
  ownerAddress,
  sellTokenAddress,
  buyTokenAddress,
  sellAmount, // bigint — the caller's own price, not a quoted amount
  buyAmount,
  kind: OrderKind.SELL,
  validTo, // unix timestamp, seconds — when the order expires
  partiallyFillable,
  appData, // exactly 32 bytes, used as-is — see below
})

await sendMyTransaction([approveInstruction, instruction])
```

- Takes the same token-account/mint resolution as `getQuote` (native SOL → WSOL substitution,
  `receiverAddress` defaulting to `ownerAddress`, `sellTokenProgramId`/`buyTokenProgramId` for
  Token-2022 mints), but needs no upstream quote and no signer to build.
- `appData` is used exactly as given — no hashing, no doc, no merging against a quoted value.
  Solana has no agreed `appData` convention yet.
  `hashAppDataDoc` is available if you want to derive them from an app-data doc yourself.
- Still requires [Step 0](#step-0--approve-the-settlement-program-as-spl-delegate) before the order
  can settle, and the returned `instruction` can be bundled with that approval the same way
  `buildOrder`'s can.
- Uses the `env` the `SolanaTradingSdk` instance was constructed with, unless overridden per call via
  `env` in the params.

## The intent model

Every Solana order is, at its core, a `SolanaOrderIntent` — a fixed-layout struct that is the direct
TypeScript counterpart of `OrderIntent` in `cow-settlement-interface` (`interface/src/data/intent.rs`).
Unlike an EVM order (an EIP-712 message the owner signs off-chain and the order-book stores), a
Solana intent is never signed as data — it's written directly into an on-chain account by an
instruction the owner's wallet signs.

```ts
interface SolanaOrderIntent {
  owner: PublicKey // signs the CreateOrder transaction
  buyTokenAccount: PublicKey // receives the buy-side proceeds — implicitly encodes the receiver
  buyMint: PublicKey
  sellTokenAccount: PublicKey // funds pulled from here — must be owned by `owner`; implicitly encodes the spender
  sellMint: PublicKey
  sellAmount: bigint
  buyAmount: bigint
  validTo: number // unix timestamp, seconds
  kind: OrderKind // SELL | BUY
  partiallyFillable: boolean
  createdOnChain: boolean // must be true — see "Authentication" below
  appData: Uint8Array // exactly 32 bytes, opaque to the settlement program; no convention defined yet, sent as zeroes
}
```

### Encoding

`encodeOrderIntent` packs the intent into the exact 213-byte (`ENCODED_ORDER_INTENT_SIZE`) little-endian
layout the settlement program reads (`EncodedOrderIntent::from(&OrderIntent)`):

| Bytes | Field                            |
| ----- | --------------------------------- |
| 32    | `owner`                           |
| 32    | `buyTokenAccount`                 |
| 32    | `buyMint`                         |
| 32    | `sellTokenAccount`                |
| 32    | `sellMint`                        |
| 8     | `sellAmount` (u64 LE)             |
| 8     | `buyAmount` (u64 LE)              |
| 4     | `validTo` (u32 LE)                |
| 1     | flags (bit 0 `createdOnChain`, bit 1 `kind === BUY`, bit 2 `partiallyFillable`) |
| 32    | `appData`                         |

### Identity: uid and the order PDA

`hashOrderIntent` takes the SHA-256 digest of the encoded intent bytes. That 32-byte digest is both:

- the order's **uid** (`toOrderId` formats it as the `0x`-prefixed id used across the SDK), and
- the middle seed of the order's **program-derived address** (`findOrderPda`), alongside a
  version-embedded settlement seed (`getSettlementSeed`, `"settlement v" + version`, padded to a
  fixed width so seeds from different versions can't collide) and a trailing `"order"` seed.

Because the uid is a hash of the intent's content, any change to the intent — including an
`advancedSettings` override to `receiver` or `validTo` — changes the uid and therefore the PDA the
order will be created at. `buildSolanaSwapOrder` re-derives both whenever `advancedSettings`
actually changes the intent, so the instruction it returns always targets the PDA matching the
intent it encodes.

### The `CreateOrder` instruction

`buildCreateOrderInstruction` builds the instruction that writes the intent on-chain, matching
`CreateOrder::into::<Instruction>()`:

- **data**: `[discriminator = 2, ...213 intent bytes]`
- **accounts**: `owner` (readonly signer), `createdBy` (writable signer — funds the new order PDA's
  rent; may equal `owner`), `orderPda` (writable), the System Program

### Authentication: why `createdOnChain` must be `true`

`cow-settlement-interface` supports two ways an intent can be authenticated: created on-chain (the
owner signs the `CreateOrder` transaction themselves) or via an off-chain Ed25519-presigned order
that anyone can submit on the owner's behalf. This SDK only implements the former —
`encodeOrderIntent` always sets the on-chain flag, and the settlement program authenticates the
order against the transaction's own signature rather than a separate signed payload. This is the
Solana counterpart of an EVM `PRESIGN` order (`buildSolanaSwapOrder` reports
`signingScheme: SigningScheme.PRESIGN` for exactly this reason) rather than an EIP-712 `EIP712` one.

## Example app

[`examples/nodejs/solana`](../../examples/nodejs/solana) is a runnable, end-to-end demo: it gets a
quote, approves the settlement program's delegate, builds the `CreateOrder` instruction, bundles
both into one transaction and submits it. **It targets mainnet-beta by default and trades real
funds** — see that example's own README for setup, including how to point it at devnet instead.

## Why Solana trading looks different from EVM trading

On EVM chains, `TradingSdk` gets a quote from the CoW order-book API, has the caller sign an
EIP-712 typed order, and POSTs the signed order to the order-book, which later settles it. Solana
has neither an order-book API to post to nor an implicit global signer:

- **Quotes don't come from the CoW order-book (yet).** `SolanaTradingSdk.getQuote` currently sources
  pricing and route discovery from an external quoting API, then builds a CoW Protocol order
  **intent** from the result. That API is used for quoting only — orders are never submitted through
  it, only ever created via the CoW settlement program. This is expected to move onto the CoW
  order-book API directly as Solana support matures.
- **Orders are created entirely on-chain.** There is no signed order body to POST. Creating an order
  means submitting a single `CreateOrder` instruction that writes the order intent into a new
  program-derived account (the order PDA). The transaction signature that lands on-chain *is* the
  order's authentication.
- **No bound signer.** The EVM SDK gets its signer from a global adapter set once at app startup.
  This package has no such adapter: quoting needs no signer at all, and a signing/sending function
  (`SolanaSignAndSend`) is passed only at the point of actually submitting a transaction. That also
  means a quote can be turned into a raw `TransactionInstruction` (via `buildOrder`) without ever
  involving a signer, so it can be composed into a larger transaction built and sent by the caller.
