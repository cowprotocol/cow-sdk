import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'

/**
 * Priority fee the order book refuses a sponsored creation above, in lamports. A deployment may
 * configure its own; this is the code default, and only a fee strictly above it is refused.
 */
export const SPONSORED_PRIORITY_FEE_CEILING_LAMPORTS = 100_000

/** Micro-lamports per compute unit used when the network reports no recent prioritization fee. */
export const DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS = 10_000

/** Compute units Solana's runtime grants per instruction to a transaction that sets no limit of its own. */
export const DEFAULT_COMPUTE_UNIT_LIMIT = 200_000

/** Lamports a resolved budget keeps its priority fee under, a fifth of the order book's own ceiling. */
export const DEFAULT_MAX_PRIORITY_FEE_LAMPORTS = 20_000

const MAX_COMPUTE_UNIT_LIMIT = 1_400_000

const DEFAULT_RPC_TIMEOUT_MS = 3_000

// Simulation measures our own bundle. Phantom and Solflare append Lighthouse guard instructions to the
// transaction the user signs, and those execute under this same limit.
const SIMULATED_UNITS_MARGIN = 1.5
const WALLET_GUARD_UNITS = 50_000

// `getRecentPrioritizationFees` reports one fee per recent slot, most of them zero on an idle network.
const PRIORITIZATION_FEE_PERCENTILE = 0.75
const MAX_LOCKED_WRITABLE_ACCOUNTS = 128

export interface SolanaComputeBudget {
  /** Compute units the transaction may consume, as `SetComputeUnitLimit` sets them. */
  unitLimit: number
  /** Micro-lamports charged per compute unit, as `SetComputeUnitPrice` sets them. */
  unitPriceMicroLamports: number
}

export interface ResolveSolanaComputeBudgetParams {
  /** The bundle the budget is for, without its compute budget instructions. */
  instructions: TransactionInstruction[]
  /** Fee payer of the transaction carrying `instructions`: the sponsor on a sponsored order. */
  feePayer: PublicKey
  /** Skips the network's recent-fee lookup and prices the units at this instead. */
  unitPriceMicroLamports?: number
  /** Defaults to {@link DEFAULT_MAX_PRIORITY_FEE_LAMPORTS}. The price is lowered to respect it. */
  maxPriorityFeeLamports?: number
  /** How long each lookup may take before its fallback is used, in ms. Defaults to 3,000. */
  rpcTimeoutMs?: number
}

/** Lamports the priority fee of a transaction carrying `budget` costs its fee payer. */
export function getPriorityFeeLamports({ unitLimit, unitPriceMicroLamports }: SolanaComputeBudget): number {
  return Math.ceil((unitLimit * unitPriceMicroLamports) / 1_000_000)
}

/**
 * The `SetComputeUnitLimit` and `SetComputeUnitPrice` instructions for `budget`, to prepend to a
 * transaction's own instructions.
 *
 * Both, never one: a wallet asked to sign a transaction that carries no compute budget adds its own,
 * and on a sponsored order that spends the funder's lamports rather than the signer's — enough of
 * them to be refused by the ceiling above. Phantom leaves the fee alone once both are present, and
 * the MetaMask Solana snap re-estimates the limit when only one is.
 */
export function buildComputeBudgetInstructions({
  unitLimit,
  unitPriceMicroLamports,
}: SolanaComputeBudget): TransactionInstruction[] {
  return [
    ComputeBudgetProgram.setComputeUnitLimit({ units: unitLimit }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: unitPriceMicroLamports }),
  ]
}

/**
 * Prices `instructions` for the network they are about to be sent to: the limit from simulating them,
 * the price from what recent blocks actually paid, and the two together held under
 * `maxPriorityFeeLamports` so the order book accepts the placement.
 *
 * Falls back to what the runtime would have granted anyway, and to
 * {@link DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS}, when a lookup fails or outlasts `rpcTimeoutMs` —
 * an unpriced budget is still worth setting, since it is what stops the wallet from setting one, and
 * a hung RPC must not hold up the signature it runs ahead of.
 *
 * Costs two concurrent RPC calls, so resolve a budget before taking the blockhash the user's signing
 * window is counted from.
 */
export async function resolveSolanaComputeBudget(
  connection: Connection,
  {
    instructions,
    feePayer,
    unitPriceMicroLamports,
    maxPriorityFeeLamports,
    rpcTimeoutMs,
  }: ResolveSolanaComputeBudgetParams,
): Promise<SolanaComputeBudget> {
  const maxPriorityFee = maxPriorityFeeLamports ?? DEFAULT_MAX_PRIORITY_FEE_LAMPORTS
  const timeoutMs = rpcTimeoutMs ?? DEFAULT_RPC_TIMEOUT_MS

  const [unitLimit, price] = await Promise.all([
    withTimeout(simulateUnitLimit(connection, instructions, feePayer), timeoutMs, fallbackUnitLimit(instructions)),
    unitPriceMicroLamports ??
      withTimeout(
        fetchUnitPrice(connection, instructions, feePayer),
        timeoutMs,
        DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS,
      ),
  ])

  const affordablePrice = Math.floor((maxPriorityFee * 1_000_000) / unitLimit)

  return { unitLimit, unitPriceMicroLamports: Math.floor(Math.max(0, Math.min(price, affordablePrice))) }
}

async function simulateUnitLimit(
  connection: Connection,
  instructions: TransactionInstruction[],
  feePayer: PublicKey,
): Promise<number> {
  // Without a limit of its own the simulation is capped at the runtime default and reports that cap
  // rather than what the bundle costs, and the blockhash the node substitutes needs a placeholder.
  const message = new TransactionMessage({
    payerKey: feePayer,
    recentBlockhash: PublicKey.default.toBase58(),
    instructions: [ComputeBudgetProgram.setComputeUnitLimit({ units: MAX_COMPUTE_UNIT_LIMIT }), ...instructions],
  }).compileToV0Message()

  try {
    const { value } = await connection.simulateTransaction(new VersionedTransaction(message), {
      sigVerify: false,
      replaceRecentBlockhash: true,
    })

    if (value.err || !value.unitsConsumed) return fallbackUnitLimit(instructions)

    return Math.min(Math.ceil(value.unitsConsumed * SIMULATED_UNITS_MARGIN) + WALLET_GUARD_UNITS, MAX_COMPUTE_UNIT_LIMIT)
  } catch {
    return fallbackUnitLimit(instructions)
  }
}

// Without a `SetComputeUnitLimit` the runtime grants DEFAULT_COMPUTE_UNIT_LIMIT per instruction, so a flat
// 200,000 would budget a multi-instruction bundle below what it would have been given for free.
function fallbackUnitLimit(instructions: TransactionInstruction[]): number {
  return Math.min(DEFAULT_COMPUTE_UNIT_LIMIT * Math.max(1, instructions.length), MAX_COMPUTE_UNIT_LIMIT)
}

async function fetchUnitPrice(
  connection: Connection,
  instructions: TransactionInstruction[],
  feePayer: PublicKey,
): Promise<number> {
  try {
    const fees = await connection.getRecentPrioritizationFees({
      lockedWritableAccounts: getWritableAccounts(instructions, feePayer),
    })
    const recent = fees.map(({ prioritizationFee }) => prioritizationFee)

    return Math.max(DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS, percentile(recent, PRIORITIZATION_FEE_PERCENTILE))
  } catch {
    return DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS
  }
}

// The fee payer is write-locked by every transaction, and on a sponsored order it is the funder — the one
// account every other placement contends for, so leaving it out prices away the contention that matters.
function getWritableAccounts(instructions: TransactionInstruction[], feePayer: PublicKey): PublicKey[] {
  const writable = new Map<string, PublicKey>([[feePayer.toBase58(), feePayer]])

  for (const { keys } of instructions) {
    for (const { pubkey, isWritable } of keys) {
      if (isWritable) writable.set(pubkey.toBase58(), pubkey)
    }
  }

  return [...writable.values()].slice(0, MAX_LOCKED_WRITABLE_ACCOUNTS)
}

// A rejected lookup is already handled where it is made; this covers one that never settles at all,
// which `catch` cannot, and which would otherwise hold the wallet prompt open indefinitely.
async function withTimeout<T>(work: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      work,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

function percentile(values: number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b)

  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))] ?? 0
}
