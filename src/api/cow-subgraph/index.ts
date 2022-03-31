import log from 'loglevel'
import fetch from 'cross-fetch'
import { GraphQLClient, gql, Variables } from 'graphql-request'
import { CowError } from '/utils/common'
import { SupportedChainId as ChainId } from '/constants/chains'
import { Context } from '/utils/context'
import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql'

export function getSubgraphUrls(): Record<ChainId, string> {
  return {
    [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow',
    [ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-rinkeby',
    [ChainId.GNOSIS_CHAIN]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc',
  }
}

export class CowSubgraphApi<T extends ChainId> {
  chainId: T
  context: Context
  client: GraphQLClient

  API_NAME = 'CoW Protocol Subgraph'

  constructor(chainId: T, context: Context) {
    this.chainId = chainId
    this.context = context
    this.client = new GraphQLClient(this.API_BASE_URL, { fetch: fetch })
  }

  get API_BASE_URL(): string {
    return getSubgraphUrls()[this.chainId]
  }

  async getTotals(): Promise<TotalsQuery> {
    log.debug(`[subgraph:${this.API_NAME}] Get totals for:`, this.chainId)
    const query = gql`
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
    const response = await this.runQuery<TotalsQuery>(query)
    return response.data
  }

  async getLastDaysVolume(days: number): Promise<LastDaysVolumeQuery> {
    log.debug(`[subgraph:${this.API_NAME}] Get last ${days} days volume for:`, this.chainId)
    const query = gql`
      query LastDaysVolume($days: Int!) {
        dailyTotals(orderBy: timestamp, orderDirection: desc, first: $days) {
          timestamp
          volumeUsd
        }
      }
    `
    const response = await this.runQuery<LastDaysVolumeQuery>(query, { days })
    return response.data
  }

  async getLastHoursVolume(hours: number): Promise<LastHoursVolumeQuery> {
    log.debug(`[subgraph:${this.API_NAME}] Get last ${hours} hours volume for:`, this.chainId)
    const query = gql`
      query LastHoursVolume($hours: Int!) {
        hourlyTotals(orderBy: timestamp, orderDirection: desc, first: $hours) {
          timestamp
          volumeUsd
        }
      }
    `
    const response = await this.runQuery<LastHoursVolumeQuery>(query, { hours })
    return response.data
  }

  public runQuery<T = any>(
    query: string,
    variables?: Variables
  ): Promise<{
    data: T
  }> {
    try {
      return this.client.request(query, variables)
    } catch (error) {
      log.error(error)
      throw new CowError(
        `Error running query: ${query}. Variables: ${JSON.stringify(variables)}. API: ${this.API_BASE_URL}`
      )
    }
  }
}
