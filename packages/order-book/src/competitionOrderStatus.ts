import type { CompetitionOrderStatus as GeneratedCompetitionOrderStatus } from './generated'

/**
 * Auction progress of an order, as served by `GET /api/v1/orders/{uid}/status`.
 */
export type CompetitionOrderStatus = Omit<GeneratedCompetitionOrderStatus, 'type'> & {
  type: CompetitionOrderStatus.type
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CompetitionOrderStatus {
  export enum type {
    OPEN = 'open',
    SCHEDULED = 'scheduled',
    ACTIVE = 'active',
    SOLVED = 'solved',
    EXECUTING = 'executing',
    TRADED = 'traded',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
  }
}
