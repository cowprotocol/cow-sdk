import { sortManualRoutes } from './sortManualRoutes'
import { BungeeQuoteAPIResponse } from './types'

type ManualRoutes = BungeeQuoteAPIResponse['result']['manualRoutes']
type ManualRoute = ManualRoutes[number]

const REGULAR_CCTP_NAME = 'Circle CCTP V2'
const FAST_CCTP_NAME = 'Circle CCTP V2 Fast'
const ACROSS_NAME = 'Across'

/**
 * Builds a minimal manual route with only the fields sortManualRoutes reads.
 * The rest of the shape is irrelevant to sorting, so it is cast away.
 */
function makeRoute(params: { name: string; amount: string; effectiveReceivedInUsd: number }): ManualRoute {
  const { name, amount, effectiveReceivedInUsd } = params

  return {
    output: {
      amount,
      effectiveReceivedInUsd,
    },
    routeDetails: {
      name,
    },
  } as unknown as ManualRoute
}

function names(routes: ManualRoutes): string[] {
  return routes.map((route) => route.routeDetails.name)
}

describe('sortManualRoutes', () => {
  describe('CCTP V2 family (regular vs fast)', () => {
    it('prefers the fast route when the received amount is below the fast threshold ($5k)', () => {
      const regular = makeRoute({ name: REGULAR_CCTP_NAME, amount: '100', effectiveReceivedInUsd: 4999 })
      const fast = makeRoute({ name: FAST_CCTP_NAME, amount: '100', effectiveReceivedInUsd: 4999 })

      expect(names(sortManualRoutes([fast, regular]))).toEqual([FAST_CCTP_NAME, REGULAR_CCTP_NAME])
      expect(names(sortManualRoutes([regular, fast]))).toEqual([FAST_CCTP_NAME, REGULAR_CCTP_NAME])
    })

    it('prefers the regular route when the received amount is at or above the threshold ($5k)', () => {
      const regular = makeRoute({ name: REGULAR_CCTP_NAME, amount: '100', effectiveReceivedInUsd: 5000 })
      const fast = makeRoute({ name: FAST_CCTP_NAME, amount: '100', effectiveReceivedInUsd: 5000 })

      expect(names(sortManualRoutes([regular, fast]))).toEqual([REGULAR_CCTP_NAME, FAST_CCTP_NAME])
      expect(names(sortManualRoutes([fast, regular]))).toEqual([REGULAR_CCTP_NAME, FAST_CCTP_NAME])
    })

    it('prefers the regular route for amounts well above the threshold', () => {
      const regular = makeRoute({ name: REGULAR_CCTP_NAME, amount: '100', effectiveReceivedInUsd: 50000 })
      const fast = makeRoute({ name: FAST_CCTP_NAME, amount: '100', effectiveReceivedInUsd: 50000 })

      expect(names(sortManualRoutes([regular, fast]))).toEqual([REGULAR_CCTP_NAME, FAST_CCTP_NAME])
    })
  })

  describe('non-CCTP routes', () => {
    it('sorts by output amount descending', () => {
      const low = makeRoute({ name: ACROSS_NAME, amount: '100', effectiveReceivedInUsd: 1 })
      const high = makeRoute({ name: ACROSS_NAME, amount: '300', effectiveReceivedInUsd: 1 })
      const mid = makeRoute({ name: ACROSS_NAME, amount: '200', effectiveReceivedInUsd: 1 })

      expect(sortManualRoutes([low, high, mid]).map((r) => r.output.amount)).toEqual(['300', '200', '100'])
    })

    it('sorts by output amount descending for unknown bridge names', () => {
      const low = makeRoute({ name: 'Unknown Bridge', amount: '100', effectiveReceivedInUsd: 1 })
      const high = makeRoute({ name: 'Unknown Bridge', amount: '500', effectiveReceivedInUsd: 1 })

      expect(sortManualRoutes([low, high]).map((r) => r.output.amount)).toEqual(['500', '100'])
    })
  })

  describe('mixed routes', () => {
    it('falls back to output amount when only one route is in the CCTP family', () => {
      const cctp = makeRoute({ name: FAST_CCTP_NAME, amount: '100', effectiveReceivedInUsd: 10000 })
      const across = makeRoute({ name: ACROSS_NAME, amount: '300', effectiveReceivedInUsd: 1 })

      // Not both CCTP → sorted by amount desc, so Across (300) comes first
      expect(names(sortManualRoutes([cctp, across]))).toEqual([ACROSS_NAME, FAST_CCTP_NAME])
    })
  })

  describe('edge cases', () => {
    it('returns the same array reference (sorts in place)', () => {
      const routes: ManualRoutes = [makeRoute({ name: ACROSS_NAME, amount: '100', effectiveReceivedInUsd: 1 })]

      expect(sortManualRoutes(routes)).toBe(routes)
    })

    it('handles an empty array', () => {
      expect(sortManualRoutes([])).toEqual([])
    })

    it('handles a single route', () => {
      const routes = [makeRoute({ name: ACROSS_NAME, amount: '100', effectiveReceivedInUsd: 1 })]

      expect(names(sortManualRoutes(routes))).toEqual([ACROSS_NAME])
    })
  })
})
