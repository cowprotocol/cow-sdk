import log from 'loglevel'
import fetch from 'cross-fetch'
import { GraphQLClient, gql, Variables } from 'graphql-request'
import { CowError } from '../../utils/common'
import { Context } from '../../utils/context'
import { SupportedChainId as ChainId } from '../../constants/chains'
import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql'

export function getSubgraphUrls(): Record<ChainId, string> {
  return {
    [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow',
    [ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-rinkeby',
    [ChainId.GNOSIS_CHAIN]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc',
  }
}

export class CowSubgraphApi {
  context: Context
  client: Promise<GraphQLClient>

  API_NAME = 'CoW Protocol Subgraph'

  constructor(context: Context) {
    this.context = context
    this.client = this.createClient()
  }

  private async createClient(): Promise<GraphQLClient> {
    const baseUrl = await this.getBaseUrl()
    const client = new GraphQLClient(baseUrl, { fetch: fetch })
    return client
  }

  async getBaseUrl(): Promise<string> {
    const chainId = await this.context.chainId
    return getSubgraphUrls()[chainId]
  }

  async getTotals(): Promise<TotalsQuery> {
    const chainId = await this.context.chainId
    log.debug(`[subgraph:${this.API_NAME}] Get totals for:`, chainId)
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
    const chainId = await this.context.chainId
    log.debug(`[subgraph:${this.API_NAME}] Get last ${days} days volume for:`, chainId)
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
    const chainId = await this.context.chainId
    log.debug(`[subgraph:${this.API_NAME}] Get last ${hours} hours volume for:`, chainId)
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

  public async runQuery<T = any>(
    query: string,
    variables?: Variables
  ): Promise<{
    data: T
  }> {
    try {
      const client = await this.client
      return client.request(query, variables)
    } catch (error) {
      log.error(error)
      const baseUrl = await this.getBaseUrl()
      throw new CowError(
        `Error running query: ${query}. Variables: ${JSON.stringify(variables)}. API: ${baseUrl}`
      )
    }
  }
}
