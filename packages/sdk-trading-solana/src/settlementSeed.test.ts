import { getSettlementSeed } from './settlementSeed'

/** `SETTLEMENT_SEED_LEN` in cow-settlement-interface: 12-byte prefix + 7-byte version field. */
const SETTLEMENT_SEED_LEN = 19

describe('getSettlementSeed', () => {
  it('builds the version-embedded seed for prod', () => {
    // "settlement v" + "0.3" right-padded to the fixed 7-byte version field.
    expect(getSettlementSeed().length).toBe(SETTLEMENT_SEED_LEN)
    expect(new TextDecoder().decode(getSettlementSeed())).toBe('settlement v0.3    ')
    expect(getSettlementSeed('prod')).toEqual(getSettlementSeed())
  })

  it('builds a fixed-width seed for staging', () => {
    // Only the width is asserted: staging currently resolves to the same bytes as prod because both envs
    // share one deployment, but that is a property of today's config, not an invariant to lock in.
    expect(getSettlementSeed('staging').length).toBe(SETTLEMENT_SEED_LEN)
  })
})
