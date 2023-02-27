import log from 'loglevel'
import { request, Variables } from 'graphql-request'
import { DocumentNode } from 'graphql'
import { CowError } from '../../utils/common'
import { Context, Env } from '../../utils/context'
import { SupportedChainId as ChainId } from '../../constants/chains'
import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql'
import { LAST_DAYS_VOLUME_QUERY, LAST_HOURS_VOLUME_QUERY, TOTALS_QUERY } from './queries'

export function getDefaultSubgraphUrls(_env: Env): Record<ChainId, string> {
  // switch (env) {
  //   case 'staging':
  //     return {
  //       [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-staging',
  //       [ChainId.GNOSIS_CHAIN]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc-staging',
  //     }
  //   case 'prod':
  //     return {
  //       [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow',
  //       [ChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-goerli',
  //       [ChainId.GNOSIS_CHAIN]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc',
  //     }
  // }
  // TODO: Ideally we would have a staging environment for Satsuma too. But this needs to be created
  return {
    [ChainId.MAINNET]: 'https://subgraph.satsuma-prod.com/94b7bd7c35c5/cow/cow/api',
    [ChainId.GOERLI]: 'https://subgraph.satsuma-prod.com/94b7bd7c35c5/cow/cow-goerli/api',
    [ChainId.GNOSIS_CHAIN]: 'https://subgraph.satsuma-prod.com/94b7bd7c35c5/cow/cow-gc/api',
  }
}

export class CowSubgraphApi {
  context: Context
  baseUrls: Record<ChainId, string>

  API_NAME = 'CoW Protocol Subgraph'

  constructor(context: Context) {
    this.context = context
    this.baseUrls = context.subgraphBaseUrls ?? getDefaultSubgraphUrls(context.env)
  }

  async getBaseUrl(options: SubgraphOptions = {}): Promise<string> {
    const { chainId: networkId, env = 'prod' } = options
    const chainId = networkId || (await this.context.chainId)

    this.context.chainId

    const baseUrl = this.baseUrls[chainId]
    if (!baseUrl) {
      throw new CowError(`No network support for SubGraph in ChainId ${networkId} and Environment "${env}"`)
    }

    return baseUrl
  }

  async getTotals(options: SubgraphOptions = {}): Promise<TotalsQuery['totals'][0]> {
    const chainId = await this.context.chainId
    log.debug(`[subgraph:${this.API_NAME}] Get totals for:`, chainId)
    const response = await this.runQuery<TotalsQuery>(TOTALS_QUERY, undefined, options)
    return response.totals[0]
  }

  async getLastDaysVolume(days: number, options: SubgraphOptions = {}): Promise<LastDaysVolumeQuery> {
    const chainId = await this.context.chainId
    log.debug(`[subgraph:${this.API_NAME}] Get last ${days} days volume for:`, chainId)
    return this.runQuery<LastDaysVolumeQuery>(LAST_DAYS_VOLUME_QUERY, { days }, options)
  }

  async getLastHoursVolume(hours: number, options: SubgraphOptions = {}): Promise<LastHoursVolumeQuery> {
    const chainId = await this.context.chainId
    log.debug(`[subgraph:${this.API_NAME}] Get last ${hours} hours volume for:`, chainId)
    return this.runQuery<LastHoursVolumeQuery>(LAST_HOURS_VOLUME_QUERY, { hours }, options)
  }

  async runQuery<T>(query: string | DocumentNode, variables?: Variables, options: SubgraphOptions = {}): Promise<T> {
    const { chainId, env } = options
    const baseUrl = await this.getBaseUrl({ chainId, env })
    try {
      return await request(baseUrl, query, variables)
    } catch (error) {
      log.error(`[subgraph:${this.API_NAME}]`, error)
      const baseUrl = await this.getBaseUrl()
      throw new CowError(
        `Error running query: ${query}. Variables: ${JSON.stringify(variables)}. API: ${baseUrl}. Inner Error: ${error}`
      )
    }
  }
}

export type SubgraphOptions = {
  chainId?: ChainId
  env?: Env
}
