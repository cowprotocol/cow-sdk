import { CompetitionOrderStatus as GeneratedCompetitionOrderStatus } from './generated'
import { CompetitionOrderStatus } from './competitionOrderStatus'

describe('CompetitionOrderStatus', () => {
  it('keeps every generated member name and value', () => {
    expect(CompetitionOrderStatus.type).toMatchObject(GeneratedCompetitionOrderStatus.type)
  })

  it('adds the Solana order book `expired` type', () => {
    expect(CompetitionOrderStatus.type.EXPIRED).toBe('expired')
    expect(GeneratedCompetitionOrderStatus.type).not.toHaveProperty('EXPIRED')
  })

  it('accepts an expired status payload', () => {
    const status: CompetitionOrderStatus = { type: CompetitionOrderStatus.type.EXPIRED }

    expect(status.type).toBe('expired')
  })
})
