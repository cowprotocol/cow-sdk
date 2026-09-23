import { Keypair, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'
import { SOL_NATIVE_CURRENCY_ADDRESS, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'

import { buildSolanaLimitOrderOrder, SolanaLimitOrderParams } from './buildLimitOrder'
import { encodeOrderIntent, hashOrderIntent, toOrderId } from './orderIntent'
import { findOrderPda } from './orderPda'
import { getSolanaSettlementProgramId } from './statePda'

const OWNER = Keypair.generate().publicKey
const SELL_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC
const BUY_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') // USDT
const WSOL_MINT = new PublicKey(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)
const APP_DATA_BYTES = new Uint8Array(32).fill(0xab)

function buildParams(overrides: Partial<SolanaLimitOrderParams> = {}): SolanaLimitOrderParams {
  return {
    ownerAddress: OWNER,
    sellTokenAddress: SELL_MINT,
    buyTokenAddress: BUY_MINT,
    sellAmount: 1_000_000n,
    buyAmount: 999_000n,
    kind: OrderKind.SELL,
    validTo: 1_700_000_000,
    partiallyFillable: false,
    appData: APP_DATA_BYTES,
    ...overrides,
  }
}

describe('buildSolanaLimitOrderOrder', () => {
  it("signs the caller's exact sellAmount/buyAmount", async () => {
    const order = await buildSolanaLimitOrderOrder(buildParams({ sellAmount: 111n, buyAmount: 222n }))

    expect(order.intent.sellAmount).toBe(111n)
    expect(order.intent.buyAmount).toBe(222n)
  })

  it('resolves sellTokenAccount/buyTokenAccount as the owner/receiver associated token accounts', async () => {
    const order = await buildSolanaLimitOrderOrder(buildParams())

    expect(order.intent.sellTokenAccount.toBase58()).toBe(
      getAssociatedTokenAddressSync(SELL_MINT, OWNER, false, undefined).toBase58(),
    )
    expect(order.intent.buyTokenAccount.toBase58()).toBe(
      getAssociatedTokenAddressSync(BUY_MINT, OWNER, false, undefined).toBase58(),
    )
  })

  it('defaults the receiver to the owner when none is given', async () => {
    const order = await buildSolanaLimitOrderOrder(buildParams())

    expect(order.intent.buyTokenAccount.toBase58()).toBe(
      getAssociatedTokenAddressSync(BUY_MINT, OWNER, false, undefined).toBase58(),
    )
  })

  it("derives the buy token account from a distinct receiver, not the owner's", async () => {
    const receiver = Keypair.generate().publicKey

    const order = await buildSolanaLimitOrderOrder(buildParams({ receiverAddress: receiver }))

    const expectedBuyTokenAccount = getAssociatedTokenAddressSync(BUY_MINT, receiver, false, undefined)
    expect(order.intent.buyTokenAccount.toBase58()).toBe(expectedBuyTokenAccount.toBase58())
    expect(order.intent.buyTokenAccount.toBase58()).not.toBe(
      getAssociatedTokenAddressSync(BUY_MINT, OWNER, false, undefined).toBase58(),
    )
  })

  it("substitutes WSOL for a native SOL sell, matching what the wrap step produces", async () => {
    const order = await buildSolanaLimitOrderOrder(
      buildParams({ sellTokenAddress: new PublicKey(SOL_NATIVE_CURRENCY_ADDRESS) }),
    )

    expect(order.intent.sellMint.toBase58()).toBe(WSOL_MINT.toBase58())
    expect(order.intent.sellTokenAccount.toBase58()).toBe(
      getAssociatedTokenAddressSync(WSOL_MINT, OWNER, false, undefined).toBase58(),
    )
  })

  it('respects an explicit token program id for a Token-2022 mint', async () => {
    const order = await buildSolanaLimitOrderOrder(
      buildParams({ buyTokenProgramId: TOKEN_2022_PROGRAM_ID, receiverAddress: OWNER }),
    )

    expect(order.intent.buyTokenAccount.toBase58()).toBe(
      getAssociatedTokenAddressSync(BUY_MINT, OWNER, false, TOKEN_2022_PROGRAM_ID).toBase58(),
    )
  })

  it("signs the caller's exact appData bytes unchanged — no hashing, no merging against anything quoted", async () => {
    const order = await buildSolanaLimitOrderOrder(buildParams())

    expect(order.intent.appData).toBe(APP_DATA_BYTES)
    expect(order.intent.appData).toEqual(APP_DATA_BYTES)
  })

  it('rejects appData that is not exactly 32 bytes, matching the on-chain intent format', async () => {
    await expect(buildSolanaLimitOrderOrder(buildParams({ appData: new Uint8Array(31) }))).rejects.toThrow(
      /32 bytes/,
    )
  })

  it('carries through kind, validTo, and partiallyFillable exactly as given', async () => {
    const order = await buildSolanaLimitOrderOrder(
      buildParams({ kind: OrderKind.BUY, validTo: 1_800_000_000, partiallyFillable: true }),
    )

    expect(order.intent.kind).toBe(OrderKind.BUY)
    expect(order.intent.validTo).toBe(1_800_000_000)
    expect(order.intent.partiallyFillable).toBe(true)
  })

  it('always marks the intent as created on-chain', async () => {
    const order = await buildSolanaLimitOrderOrder(buildParams())

    expect(order.intent.createdOnChain).toBe(true)
  })

  it("derives uid/orderPda/instruction from the encoded intent, matching the primitives directly", async () => {
    const order = await buildSolanaLimitOrderOrder(buildParams())

    const expectedIntentBytes = encodeOrderIntent(order.intent)
    const expectedUid = await hashOrderIntent(expectedIntentBytes)
    const [expectedOrderPda] = findOrderPda(getSolanaSettlementProgramId(undefined), expectedUid)

    expect(order.uid).toEqual(expectedUid)
    expect(order.orderPda.toBase58()).toBe(expectedOrderPda.toBase58())
    expect(order.orderId).toBe(toOrderId(expectedUid))
    expect(Uint8Array.from(order.instruction.data.subarray(1))).toEqual(expectedIntentBytes)
  })

  it('resolves the program id via getSolanaSettlementProgramId for the requested env', async () => {
    // staging and prod currently resolve to the same deployed program (see contracts.ts) — assert equality
    // to the real resolver, not to a hardcoded address that would drift if that ever changes.
    const order = await buildSolanaLimitOrderOrder(buildParams({ env: 'staging' }))

    expect(order.instruction.programId.toBase58()).toBe(getSolanaSettlementProgramId('staging').toBase58())
  })

  it('funds the order rent from the owner, so a single wallet signs the whole transaction', async () => {
    const order = await buildSolanaLimitOrderOrder(buildParams())

    const accounts = order.instruction.keys.map((key) => key.pubkey.toBase58())
    expect(accounts.slice(0, 2)).toEqual([OWNER.toBase58(), OWNER.toBase58()])
  })

  it('returns the presign signing scheme, matching a swap order', async () => {
    const order = await buildSolanaLimitOrderOrder(buildParams())

    expect(order.signingScheme).toBe(SigningScheme.PRESIGN)
  })

  it('two calls with the same params produce the same uid, deterministically', async () => {
    const first = await buildSolanaLimitOrderOrder(buildParams())
    const second = await buildSolanaLimitOrderOrder(buildParams())

    expect(first.uid).toEqual(second.uid)
  })

  it('a different sellAmount changes the uid', async () => {
    const first = await buildSolanaLimitOrderOrder(buildParams({ sellAmount: 1_000_000n }))
    const second = await buildSolanaLimitOrderOrder(buildParams({ sellAmount: 1_000_001n }))

    expect(first.uid).not.toEqual(second.uid)
  })
})
