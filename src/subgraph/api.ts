import { CowError } from '../common/cow-error'
import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql'
import { LAST_DAYS_VOLUME_QUERY, LAST_HOURS_VOLUME_QUERY, TOTALS_QUERY } from './queries'
import { DocumentNode } from 'graphql/index'
import { request, Variables } from 'graphql-request'
import { EnvConfig, PROD_CONFIG, STAGING_CONFIG } from '../common/configs'
import { SupportedChainId } from '../common/chains'

export class SubgraphApi {
  API_NAME = 'CoW Protocol Subgraph'

  private envConfig: EnvConfig

  constructor(private chainId: SupportedChainId, env: 'prod' | 'staging' = 'prod') {
    this.envConfig = (env === 'prod' ? PROD_CONFIG : STAGING_CONFIG)[chainId]
  }

  async getTotals(): Promise<TotalsQuery['totals'][0]> {
    console.debug(`[subgraph:${this.API_NAME}] Get totals for:`, this.chainId)
    const response = await this.runQuery<TotalsQuery>(TOTALS_QUERY)
    return response.totals[0]
  }

  async getLastDaysVolume(days: number): Promise<LastDaysVolumeQuery> {
    console.debug(`[subgraph:${this.API_NAME}] Get last ${days} days volume for:`, this.chainId)
    return this.runQuery<LastDaysVolumeQuery>(LAST_DAYS_VOLUME_QUERY, { days })
  }

  async getLastHoursVolume(hours: number): Promise<LastHoursVolumeQuery> {
    console.debug(`[subgraph:${this.API_NAME}] Get last ${hours} hours volume for:`, this.chainId)
    return this.runQuery<LastHoursVolumeQuery>(LAST_HOURS_VOLUME_QUERY, { hours })
  }

  async runQuery<T>(query: string | DocumentNode, variables?: Variables): Promise<T> {
    const baseUrl = this.envConfig.subgraphUrl
    try {
      return await request(baseUrl, query, variables)
    } catch (error) {
      console.error(`[subgraph:${this.API_NAME}]`, error)
      throw new CowError(
        `Error running query: ${query}. Variables: ${JSON.stringify(variables)}. API: ${baseUrl}. Inner Error: ${error}`
      )
    }
  }
}
