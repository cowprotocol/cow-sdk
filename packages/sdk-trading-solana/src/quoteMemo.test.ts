import { buildSolanaQuoteMemoInstruction, SOLANA_QUOTE_MEMO_PREFIX, SPL_MEMO_PROGRAM_ID } from './quoteMemo'

describe('buildSolanaQuoteMemoInstruction', () => {
  it('addresses the SPL Memo program and names no account', () => {
    const instruction = buildSolanaQuoteMemoInstruction(161211)

    expect(instruction.programId.toBase58()).toBe(SPL_MEMO_PROGRAM_ID.toBase58())
    expect(instruction.keys).toEqual([])
  })

  it('carries the prefixed quote id as UTF-8 text', () => {
    const instruction = buildSolanaQuoteMemoInstruction(161211)

    expect(instruction.data.toString('utf8')).toBe('cow:quote:161211')
    expect(SOLANA_QUOTE_MEMO_PREFIX).toBe('cow:quote:')
  })

  it('writes the id in decimal, whatever its magnitude', () => {
    expect(buildSolanaQuoteMemoInstruction(0).data.toString('utf8')).toBe('cow:quote:0')
    expect(buildSolanaQuoteMemoInstruction(Number.MAX_SAFE_INTEGER).data.toString('utf8')).toBe(
      `cow:quote:${Number.MAX_SAFE_INTEGER}`,
    )
  })

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 2])(
    'refuses %p, which no order book quote id can be',
    (quoteId) => {
      expect(() => buildSolanaQuoteMemoInstruction(quoteId)).toThrow('quoteId must be a non-negative integer')
    },
  )
})
