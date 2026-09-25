import { CowEnv } from '@cowprotocol/sdk-config'
import { OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, PublicKeyInitData } from '@solana/web3.js'
import { SolanaSwapOrder } from './buildSwapOrder'
import { buildCreateOrderInstruction } from './createOrderInstruction'
import { encodeOrderIntent, hashOrderIntent, SolanaOrderIntent, toOrderId } from './orderIntent'
import { findOrderPda } from './orderPda'
import { toSplMint } from './splMint'
import { getSolanaSettlementProgramId } from './statePda'

export interface SolanaLimitOrderParams {
  env?: CowEnv
  ownerAddress: PublicKeyInitData
  /** Defaults to `ownerAddress`. */
  receiverAddress?: PublicKeyInitData
  sellTokenAddress: PublicKeyInitData
  buyTokenAddress: PublicKeyInitData
  /** The user's own price — not derived from a quote, since a limit order rests on-chain until a solver
   * fills it and has to carry the price the user chose, not a snapshot of the market at signing time. */
  sellAmount: bigint
  buyAmount: bigint
  kind: OrderKind
  /** Unix timestamp seconds the order expires at. */
  validTo: number
  partiallyFillable: boolean
  /**
   * The intent's opaque 32 bytes, used exactly as given — no hashing, no doc, no merging
   */
  appData: Uint8Array
  /** Token program owning `sellTokenAddress`'s accounts (classic SPL Token vs Token-2022). Defaults to the
   * classic SPL Token program — pass `TOKEN_2022_PROGRAM_ID` explicitly for Token-2022 mints, since the
   * associated token account address differs by program. */
  sellTokenProgramId?: PublicKeyInitData
  /** Same as `sellTokenProgramId`, for `buyTokenAddress`. */
  buyTokenProgramId?: PublicKeyInitData
}

/**
 * Builds everything needed to create a limit order on-chain at the caller's own price, without going
 * through `getSolanaQuote` at all — that function only ever signs the market-quoted amount (± slippage),
 * which is correct for a swap but wrong for a limit order. This function takes only what the intent
 * itself needs, computing the same token-account/mint resolution `getSolanaQuote` does internally, so a
 * limit order never depends on having quoted anything first.
 */
export async function buildSolanaLimitOrderOrder(params: SolanaLimitOrderParams): Promise<SolanaSwapOrder> {
  const owner = new PublicKey(params.ownerAddress)
  const receiver = new PublicKey(params.receiverAddress ?? params.ownerAddress)
  // Native SOL has no SPL mint; substitute WSOL, matching `getSolanaQuote` and what the wrap step produces.
  const sellMint = toSplMint(new PublicKey(params.sellTokenAddress))
  const buyMint = new PublicKey(params.buyTokenAddress)
  const sellTokenProgram = params.sellTokenProgramId ? new PublicKey(params.sellTokenProgramId) : undefined
  const buyTokenProgram = params.buyTokenProgramId ? new PublicKey(params.buyTokenProgramId) : undefined

  const programId = getSolanaSettlementProgramId(params.env)

  const intent: SolanaOrderIntent = {
    owner,
    sellTokenAccount: getAssociatedTokenAddressSync(sellMint, owner, false, sellTokenProgram),
    sellMint,
    buyTokenAccount: getAssociatedTokenAddressSync(buyMint, receiver, false, buyTokenProgram),
    buyMint,
    sellAmount: params.sellAmount,
    buyAmount: params.buyAmount,
    validTo: params.validTo,
    kind: params.kind,
    partiallyFillable: params.partiallyFillable,
    createdOnChain: true,
    appData: params.appData,
  }

  const intentBytes = encodeOrderIntent(intent)
  const uid = await hashOrderIntent(intentBytes)
  const [orderPda] = findOrderPda(programId, uid, params.env)

  const instruction = buildCreateOrderInstruction({
    programId,
    owner,
    createdBy: owner,
    orderPda,
    intent,
  })

  return {
    instruction,
    orderId: toOrderId(uid),
    uid,
    orderPda,
    intent,
    signingScheme: SigningScheme.PRESIGN,
    // No quote means no real order-to-sign payload yet — matches `getSolanaQuote`'s own stub for this
    // field (`{} as QuoteResults['orderToSign']`), which nothing in this package currently reads.
    orderToSign: {} as SolanaSwapOrder['orderToSign'],
  }
}
