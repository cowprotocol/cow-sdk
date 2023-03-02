import { CowError } from '../common/cow-error'
import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql'
import { LAST_DAYS_VOLUME_QUERY, LAST_HOURS_VOLUME_QUERY, TOTALS_QUERY } from './queries'
import { DocumentNode } from 'graphql/index'
import { request, Variables } from 'graphql-request'
import {
  ApiContext,
  CowEnv,
  DEFAULT_COW_API_CONTEXT,
  EnvConfigs,
  PartialApiContext,
  PROD_CONFIG,
  STAGING_CONFIG,
} from '../common/configs'

export class SubgraphApi {
  API_NAME = 'CoW Protocol Subgraph'

  constructor(public context: ApiContext = DEFAULT_COW_API_CONTEXT) {}

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
    const baseUrl = this.getEnvConfig(env)[chainId].subgraphUrl

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
    if (!contextOverride) return this.context

    return { ...this.context, ...contextOverride }
  }

  private getEnvConfig(env: CowEnv): EnvConfigs {
    return env === 'prod' ? PROD_CONFIG : STAGING_CONFIG
  }
}
