import log from 'loglevel'
import fetch from 'cross-fetch'
import { GraphQLClient, gql, Variables } from 'graphql-request'
import { CowError } from '../../utils/common'
import { Context } from '../../utils/context'
import { SupportedChainId as ChainId } from '../../constants/chains'
import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql'

export const subgraphUrls: Record<ChainId, string> = {
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow',
  [ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-rinkeby',
  [ChainId.GNOSIS_CHAIN]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc',
}

export class CowSubgraphApi {
  context: Context
  clients: Record<ChainId, GraphQLClient>

  API_NAME = 'CoW Protocol Subgraph'

  constructor(context: Context) {
    this.context = context
    this.clients = this.createClients()
  }

  private createClients(): Record<ChainId, GraphQLClient> {
    return {
      [ChainId.MAINNET]: new GraphQLClient(subgraphUrls[ChainId.MAINNET], { fetch }),
      [ChainId.RINKEBY]: new GraphQLClient(subgraphUrls[ChainId.RINKEBY], { fetch }),
      [ChainId.GNOSIS_CHAIN]: new GraphQLClient(subgraphUrls[ChainId.GNOSIS_CHAIN], { fetch }),
    }
  }

  async getBaseUrl(): Promise<string> {
    const chainId = await this.context.chainId
    return subgraphUrls[chainId]
  }

  async getTotals(): Promise<TotalsQuery['totals'][0]> {
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
    return response.totals[0]
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
    return this.runQuery<LastDaysVolumeQuery>(query, { days })
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
    return this.runQuery<LastHoursVolumeQuery>(query, { hours })
  }

  async runQuery<T>(query: string, variables?: Variables): Promise<T> {
    try {
      const chainId = await this.context.chainId
      const client = this.clients[chainId]
      return client.request(query, variables)
    } catch (error) {
      log.error(error)
      const baseUrl = await this.getBaseUrl()
      throw new CowError(`Error running query: ${query}. Variables: ${JSON.stringify(variables)}. API: ${baseUrl}`)
    }
  }
}
