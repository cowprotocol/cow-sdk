import { CowError } from '../common/cow-error'
import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql'
import { LAST_DAYS_VOLUME_QUERY, LAST_HOURS_VOLUME_QUERY, TOTALS_QUERY } from './queries'
import { DocumentNode } from 'graphql/index'
import { request, Variables } from 'graphql-request'
import { ApiContext, CowEnv, DEFAULT_COW_API_CONTEXT, ApiBaseUrls, PartialApiContext } from '../common/configs'
import { SupportedChainId } from '../common/chains'

export const SUBGRAPH_PROD_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc',
  [SupportedChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-goerli',
}

export const SUBGRAPH_STAGING_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-staging',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc-staging',
  [SupportedChainId.GOERLI]: '',
}

export class SubgraphApi {
  API_NAME = 'CoW Protocol Subgraph'

  public context: ApiContext

  constructor(context: PartialApiContext = {}) {
    this.context = {
      ...DEFAULT_COW_API_CONTEXT,
      ...context,
    }
  }

  async getTotals(contextOverride: PartialApiContext = {}): Promise<TotalsQuery['totals'][0]> {
    const response = await this.runQuery<TotalsQuery>(TOTALS_QUERY, undefined, contextOverride)
    return response.totals[0]
  }

  async getLastDaysVolume(days: number, contextOverride: PartialApiContext = {}): Promise<LastDaysVolumeQuery> {
    return this.runQuery<LastDaysVolumeQuery>(LAST_DAYS_VOLUME_QUERY, { days }, contextOverride)
  }

  async getLastHoursVolume(hours: number, contextOverride: PartialApiContext = {}): Promise<LastHoursVolumeQuery> {
    return this.runQuery<LastHoursVolumeQuery>(LAST_HOURS_VOLUME_QUERY, { hours }, contextOverride)
  }

  async runQuery<T>(
    query: string | DocumentNode,
    variables: Variables | undefined = undefined,
    contextOverride: PartialApiContext = {}
  ): Promise<T> {
    const { chainId, env } = this.getContextWithOverride(contextOverride)
    const baseUrl = this.getEnvConfigs(env)[chainId]

    try {
      return await request(baseUrl, query, variables)
    } catch (error) {
      console.error(`[subgraph:${this.API_NAME}]`, error)
      throw new CowError(
        `Error running query: ${query}. Variables: ${JSON.stringify(variables)}. API: ${baseUrl}. Inner Error: ${error}`
      )
    }
  }

  private getContextWithOverride(contextOverride: PartialApiContext = {}): ApiContext {
    return { ...this.context, ...contextOverride }
  }

  private getEnvConfigs(env: CowEnv): ApiBaseUrls {
    if (this.context.baseUrls) return this.context.baseUrls

    return env === 'prod' ? SUBGRAPH_PROD_CONFIG : SUBGRAPH_STAGING_CONFIG
  }
}
