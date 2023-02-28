import { gql } from 'graphql-request'

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

export const LAST_DAYS_VOLUME_QUERY = gql`
  query LastDaysVolume($days: Int!) {
    dailyTotals(orderBy: timestamp, orderDirection: desc, first: $days) {
      timestamp
      volumeUsd
    }
  }
`

export const LAST_HOURS_VOLUME_QUERY = gql`
  query LastHoursVolume($hours: Int!) {
    hourlyTotals(orderBy: timestamp, orderDirection: desc, first: $hours) {
      timestamp
      volumeUsd
    }
  }
`
