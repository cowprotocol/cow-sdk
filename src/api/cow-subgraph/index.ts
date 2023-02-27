import log from 'loglevel'
import { request, Variables } from 'graphql-request'
import { DocumentNode } from 'graphql'
import { CowError } from '../../utils/common'
import { Context, Env } from '../../utils/context'
import { SupportedChainId as ChainId } from '../../constants/chains'
import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql'
import { LAST_DAYS_VOLUME_QUERY, LAST_HOURS_VOLUME_QUERY, TOTALS_QUERY } from './queries'

const DEFAULT_STAGING_URLS = {
  [ChainId.GOERLI]: 'https://subgraph.satsuma-prod.com/94b7bd7c35c5/cow/cow-goerli/api',
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-staging',
  [ChainId.GNOSIS_CHAIN]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc-staging',
}

const DEFAULT_PROD_URLS = {
  [ChainId.GOERLI]: 'https://subgraph.satsuma-prod.com/94b7bd7c35c5/cow/cow-goerli/api',
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow',
  [ChainId.GNOSIS_CHAIN]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc',
}

const DEFAULT_ENV = 'prod'

export function getDefaultSubgraphUrl(params: { chainId?: ChainId; env?: Env }): string {
  const { chainId = ChainId.MAINNET, env = DEFAULT_ENV } = params
  switch (env) {
    case 'staging':
      return DEFAULT_STAGING_URLS[chainId]
    case 'prod':
      return DEFAULT_PROD_URLS[chainId]
  }
}

export class CowSubgraphApi {
  context: Context
  baseUrls: Partial<Record<ChainId, string>>

  API_NAME = 'CoW Protocol Subgraph'

  constructor(context: Context) {
    this.context = context
    this.baseUrls = context.subgraphBaseUrls || {}
  }

  async getBaseUrl(options: SubgraphOptions = {}): Promise<string> {
    const { chainId: networkId, env = DEFAULT_ENV } = options
    const chainId = networkId || (await this.context.chainId)

    const baseUrl = this.baseUrls[chainId] || getDefaultSubgraphUrl({ chainId, env })
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
