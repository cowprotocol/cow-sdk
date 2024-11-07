import { Variables, request } from 'graphql-request'
import { DocumentNode } from 'graphql/index'
import { SupportedChainId } from '../common/chains'
import { ApiContext, CowEnv, DEFAULT_COW_API_CONTEXT } from '../common/configs'
import { CowError } from '../common/cow-error'
import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql'
import { LAST_DAYS_VOLUME_QUERY, LAST_HOURS_VOLUME_QUERY, TOTALS_QUERY } from './queries'

const SUBGRAPH_BASE_URL = 'https://api.thegraph.com/subgraphs/name/cowprotocol'

type SubgraphApiBaseUrls = Record<SupportedChainId, string | null>

interface SubgraphApiContext extends Omit<ApiContext, 'baseUrls'> {
  baseUrls?: SubgraphApiBaseUrls
}

type PartialSubgraphApiContext = Partial<SubgraphApiContext>

/**
 * CoW Protocol Production Subgraph API configuration.
 * @see {@link https://api.thegraph.com/subgraphs/name/cowprotocol/cow}
 * @see {@link https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc}
 */
export const SUBGRAPH_PROD_CONFIG: SubgraphApiBaseUrls = {
  [SupportedChainId.MAINNET]: SUBGRAPH_BASE_URL + '/cow',
  [SupportedChainId.GNOSIS_CHAIN]: SUBGRAPH_BASE_URL + '/cow-gc',
  [SupportedChainId.ARBITRUM_ONE]: null,
  [SupportedChainId.BASE]: null,
  [SupportedChainId.SEPOLIA]: null,
}

/**
 * CoW Protocol Staging Subgraph API configuration.
 * @deprecated
 * @see {@link https://api.thegraph.com/subgraphs/name/cowprotocol/cow-staging}
 * @see {@link https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc-staging}
 */
export const SUBGRAPH_STAGING_CONFIG: SubgraphApiBaseUrls = {
  [SupportedChainId.MAINNET]: SUBGRAPH_BASE_URL + '/cow-staging',
  [SupportedChainId.GNOSIS_CHAIN]: SUBGRAPH_BASE_URL + '/cow-gc-staging',
  [SupportedChainId.ARBITRUM_ONE]: null,
  [SupportedChainId.BASE]: null,
  [SupportedChainId.SEPOLIA]: null,
}

/**
 * TheGraph API client for CoW Protocol.
 */
export class SubgraphApi {
  API_NAME = 'CoW Protocol Subgraph'

  public context: SubgraphApiContext

  /**
   * Create a new CoW Protocol API instance.
   * @param context Any properties of the {@link SubgraphApiContext} may be overridden by passing a {@link PartialSubgraphApiContext}.
   */
  constructor(context: PartialSubgraphApiContext = {}) {
    this.context = {
      ...DEFAULT_COW_API_CONTEXT,
      ...context,
    }
  }

  /**
   * Query the totals from TheGraph for the CoW Protocol.
   * @param contextOverride Override the context for this call only.
   * @returns The totals for the CoW Protocol.
   */
  async getTotals(contextOverride: PartialSubgraphApiContext = {}): Promise<TotalsQuery['totals'][0]> {
    const response = await this.runQuery<TotalsQuery>(TOTALS_QUERY, undefined, contextOverride)
    return response.totals[0]
  }

  /**
   * Query the volume over the last N days from TheGraph for the CoW Protocol.
   * @param {number} days The number of days to query.
   * @param {PartialSubgraphApiContext} contextOverride Override the context for this call only.
   * @returns The volume for the last N days.
   */
  async getLastDaysVolume(days: number, contextOverride: PartialSubgraphApiContext = {}): Promise<LastDaysVolumeQuery> {
    return this.runQuery<LastDaysVolumeQuery>(LAST_DAYS_VOLUME_QUERY, { days }, contextOverride)
  }

  /**
   * Query the volume over the last N hours from TheGraph for the CoW Protocol.
   * @param {number} hours The number of hours to query.
   * @param {PartialSubgraphApiContext} contextOverride Override the context for this call only.
   * @returns The volume for the last N hours.
   */
  async getLastHoursVolume(
    hours: number,
    contextOverride: PartialSubgraphApiContext = {}
  ): Promise<LastHoursVolumeQuery> {
    return this.runQuery<LastHoursVolumeQuery>(LAST_HOURS_VOLUME_QUERY, { hours }, contextOverride)
  }

  /**
   * Run a query against the CoW Protocol Subgraph.
   * @param {string | DocumentNode} query GQL query string or DocumentNode.
   * @param {Variables | undefined} variables To be passed to the query.
   * @param {PartialSubgraphApiContext} contextOverride Override the context for this call only.
   * @returns Results of the query.
   * @throws {@link CowError} if the query fails.
   */
  async runQuery<T>(
    query: string | DocumentNode,
    variables: Variables | undefined = undefined,
    contextOverride: PartialSubgraphApiContext = {}
  ): Promise<T> {
    const { chainId, env } = this.getContextWithOverride(contextOverride)
    const baseUrl = this.getEnvConfigs(env)[chainId]

    if (baseUrl === null) {
      throw new Error('Unsupported Network. The subgraph API is not available in the Network ' + chainId)
    }

    try {
      return await request(baseUrl, query, variables)
    } catch (error) {
      console.error(`[subgraph:${this.API_NAME}]`, error)
      throw new CowError(
        `Error running query: ${query}. Variables: ${JSON.stringify(variables)}. API: ${baseUrl}. Inner Error: ${error}`
      )
    }
  }

  /**
   * Override parts of the context for a specific call.
   * @param {PartialSubgraphApiContext} contextOverride Override the context for this call only.
   * @returns {SubgraphApiContext} The context with the override applied.
   */
  private getContextWithOverride(contextOverride: PartialSubgraphApiContext = {}): SubgraphApiContext {
    return { ...this.context, ...contextOverride }
  }

  /**
   * Get the base URLs for the given environment.
   * @param {CowEnv} env The environment to get the base URLs for.
   * @returns {ApiBaseUrls} The base URLs for the given environment.
   */
  private getEnvConfigs(env: CowEnv): SubgraphApiBaseUrls {
    if (this.context.baseUrls) return this.context.baseUrls

    return env === 'prod' ? SUBGRAPH_PROD_CONFIG : SUBGRAPH_STAGING_CONFIG
  }
}
