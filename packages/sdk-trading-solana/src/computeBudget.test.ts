import { ComputeBudgetProgram, Connection, Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
  buildComputeBudgetInstructions,
  COMPUTE_UNIT_LIMIT_PER_INSTRUCTION,
  DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS,
  getPriorityFeeLamports,
  resolveSolanaComputeBudget,
  SPONSORED_PRIORITY_FEE_CEILING_LAMPORTS,
} from './computeBudget'

const FEE_PAYER = Keypair.generate().publicKey
const WRITABLE = Keypair.generate().publicKey
const READONLY = Keypair.generate().publicKey

const INSTRUCTIONS = [
  new TransactionInstruction({
    programId: Keypair.generate().publicKey,
    keys: [
      { pubkey: WRITABLE, isSigner: false, isWritable: true },
      { pubkey: READONLY, isSigner: false, isWritable: false },
      { pubkey: WRITABLE, isSigner: false, isWritable: true },
    ],
    data: Buffer.alloc(0),
  }),
]

interface ConnectionMock {
  connection: Connection
  simulateTransaction: jest.Mock
  getRecentPrioritizationFees: jest.Mock
}

function mockConnection(unitsConsumed: number | null, prioritizationFees: number[]): ConnectionMock {
  const simulateTransaction = jest.fn().mockResolvedValue({ value: { err: null, unitsConsumed } })
  const getRecentPrioritizationFees = jest
    .fn()
    .mockResolvedValue(prioritizationFees.map((prioritizationFee, slot) => ({ slot, prioritizationFee })))

  return {
    connection: { simulateTransaction, getRecentPrioritizationFees } as unknown as Connection,
    simulateTransaction,
    getRecentPrioritizationFees,
  }
}

describe('getPriorityFeeLamports', () => {
  it('converts micro-lamports per unit into whole lamports, rounding up', () => {
    expect(getPriorityFeeLamports({ unitLimit: 100_000, unitPriceMicroLamports: 10_000 })).toBe(1000)
    expect(getPriorityFeeLamports({ unitLimit: 1, unitPriceMicroLamports: 1 })).toBe(1)
  })

  it('matches what the wallets observed on staging charged the funder', () => {
    expect(getPriorityFeeLamports({ unitLimit: 200_000, unitPriceMicroLamports: 375_000 })).toBe(75_000)
  })
})

describe('buildComputeBudgetInstructions', () => {
  it('sets both the limit and the price', () => {
    const instructions = buildComputeBudgetInstructions({ unitLimit: 123_456, unitPriceMicroLamports: 7_000 })

    expect(instructions).toHaveLength(2)
    expect(instructions[0]?.programId.equals(ComputeBudgetProgram.programId)).toBe(true)
    expect(instructions[1]?.programId.equals(ComputeBudgetProgram.programId)).toBe(true)
    expect(instructions.map((instruction) => instruction.data[0])).toEqual([2, 3])
  })
})

describe('resolveSolanaComputeBudget', () => {
  it('takes the limit from the simulation, with headroom for wallet-injected guard instructions', async () => {
    const { connection } = mockConnection(40_000, [0])

    const { unitLimit } = await resolveSolanaComputeBudget(connection, {
      instructions: INSTRUCTIONS,
      feePayer: FEE_PAYER,
    })

    expect(unitLimit).toBe(110_000)
  })

  it('simulates the bundle under an explicit maximum limit so the runtime default does not cap the answer', async () => {
    const { connection, simulateTransaction } = mockConnection(40_000, [0])

    await resolveSolanaComputeBudget(connection, { instructions: INSTRUCTIONS, feePayer: FEE_PAYER })

    const [transaction, config] = simulateTransaction.mock.calls[0]
    expect(config).toEqual({ sigVerify: false, replaceRecentBlockhash: true })
    expect(transaction.message.compiledInstructions).toHaveLength(INSTRUCTIONS.length + 1)
  })

  it('prices the units off what recent blocks paid, above the default floor', async () => {
    const { connection } = mockConnection(10_000, [0, 0, 50_000, 60_000, 70_000])

    const { unitPriceMicroLamports } = await resolveSolanaComputeBudget(connection, {
      instructions: INSTRUCTIONS,
      feePayer: FEE_PAYER,
    })

    expect(unitPriceMicroLamports).toBe(60_000)
  })

  it('keeps the price at the floor on an idle network', async () => {
    const { connection } = mockConnection(10_000, [0, 0, 0])

    const { unitPriceMicroLamports } = await resolveSolanaComputeBudget(connection, {
      instructions: INSTRUCTIONS,
      feePayer: FEE_PAYER,
    })

    expect(unitPriceMicroLamports).toBe(DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS)
  })

  it('asks only about the accounts the bundle writes to, the fee payer among them, deduplicated', async () => {
    const { connection, getRecentPrioritizationFees } = mockConnection(10_000, [0])

    await resolveSolanaComputeBudget(connection, { instructions: INSTRUCTIONS, feePayer: FEE_PAYER })

    expect(getRecentPrioritizationFees).toHaveBeenCalledWith({ lockedWritableAccounts: [FEE_PAYER, WRITABLE] })
  })

  it('lowers the price so the priority fee stays under the maximum, however busy the network is', async () => {
    const { connection } = mockConnection(600_000, Array(10).fill(10_000_000))

    const budget = await resolveSolanaComputeBudget(connection, {
      instructions: INSTRUCTIONS,
      feePayer: FEE_PAYER,
      maxPriorityFeeLamports: 20_000,
    })

    expect(getPriorityFeeLamports(budget)).toBeLessThanOrEqual(20_000)
    expect(getPriorityFeeLamports(budget)).toBeLessThan(SPONSORED_PRIORITY_FEE_CEILING_LAMPORTS)
  })

  it('skips the network lookup when the caller prices the units itself', async () => {
    const { connection, getRecentPrioritizationFees } = mockConnection(10_000, [500_000])

    const { unitPriceMicroLamports } = await resolveSolanaComputeBudget(connection, {
      instructions: INSTRUCTIONS,
      feePayer: FEE_PAYER,
      unitPriceMicroLamports: 1_234,
    })

    expect(unitPriceMicroLamports).toBe(1_234)
    expect(getRecentPrioritizationFees).not.toHaveBeenCalled()
  })

  it('falls back to the defaults when the simulation reports no units', async () => {
    const { connection } = mockConnection(null, [0])

    const budget = await resolveSolanaComputeBudget(connection, { instructions: INSTRUCTIONS, feePayer: FEE_PAYER })

    expect(budget).toEqual({
      unitLimit: COMPUTE_UNIT_LIMIT_PER_INSTRUCTION,
      unitPriceMicroLamports: DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS,
    })
  })

  it('scales the fallback limit by the bundle, which is what the runtime would have granted anyway', async () => {
    const { connection } = mockConnection(null, [0])

    const { unitLimit } = await resolveSolanaComputeBudget(connection, {
      instructions: [...INSTRUCTIONS, ...INSTRUCTIONS, ...INSTRUCTIONS],
      feePayer: FEE_PAYER,
    })

    expect(unitLimit).toBe(3 * COMPUTE_UNIT_LIMIT_PER_INSTRUCTION)
  })

  it('falls back to the defaults rather than throwing when the RPC is unreachable', async () => {
    const connection = {
      simulateTransaction: jest.fn().mockRejectedValue(new Error('503')),
      getRecentPrioritizationFees: jest.fn().mockRejectedValue(new Error('503')),
    } as unknown as Connection

    const budget = await resolveSolanaComputeBudget(connection, { instructions: INSTRUCTIONS, feePayer: FEE_PAYER })

    expect(budget).toEqual({
      unitLimit: COMPUTE_UNIT_LIMIT_PER_INSTRUCTION,
      unitPriceMicroLamports: DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS,
    })
  })

  // A `catch` cannot cover a request that never settles, and this one runs ahead of the wallet prompt.
  it('falls back to the defaults rather than hanging when a lookup never settles', async () => {
    const connection = {
      simulateTransaction: jest.fn(() => new Promise(() => undefined)),
      getRecentPrioritizationFees: jest.fn(() => new Promise(() => undefined)),
    } as unknown as Connection

    const budget = await resolveSolanaComputeBudget(connection, {
      instructions: INSTRUCTIONS,
      feePayer: FEE_PAYER,
      rpcTimeoutMs: 1,
    })

    expect(budget).toEqual({
      unitLimit: COMPUTE_UNIT_LIMIT_PER_INSTRUCTION,
      unitPriceMicroLamports: DEFAULT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS,
    })
  })

  it('falls back to the defaults when the simulation itself fails', async () => {
    const connection = {
      simulateTransaction: jest.fn().mockResolvedValue({ value: { err: { InstructionError: [0, 'Custom'] } } }),
      getRecentPrioritizationFees: jest.fn().mockResolvedValue([]),
    } as unknown as Connection

    const { unitLimit } = await resolveSolanaComputeBudget(connection, {
      instructions: INSTRUCTIONS,
      feePayer: new PublicKey(FEE_PAYER),
    })

    expect(unitLimit).toBe(COMPUTE_UNIT_LIMIT_PER_INSTRUCTION)
  })
})
