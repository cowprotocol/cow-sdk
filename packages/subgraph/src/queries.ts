import { gql } from 'graphql-request'

/**
 * GraphQL query for the total number of tokens, orders, traders, settlements, volume, and fees.
 */
export const TOTALS_QUERY = gql`
  query Totals {
    totals {
      tokens
      orders
      traders
      settlements
      volumeUsd
      volumeEth
      feesUsd
      feesEth
    }
  }
`

/**
 * GraphQL query for the total volume over the last N days.
 * @param days The number of days to query.
 */
export const LAST_DAYS_VOLUME_QUERY = gql`
  query LastDaysVolume($days: Int!) {
    dailyTotals(orderBy: timestamp, orderDirection: desc, first: $days) {
      timestamp
      volumeUsd
    }
  }
`

/**
 * GraphQL query for the total volume over the last N hours.
 * @param hours The number of hours to query.
 */
export const LAST_HOURS_VOLUME_QUERY = gql`
  query LastHoursVolume($hours: Int!) {
    hourlyTotals(orderBy: timestamp, orderDirection: desc, first: $hours) {
      timestamp
      volumeUsd
    }
  }
`
