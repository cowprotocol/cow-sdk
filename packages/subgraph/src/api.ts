import { Variables, request } from 'graphql-request'
import { DocumentNode } from 'graphql/index'
import { SupportedChainId, ApiContext, DEFAULT_COW_API_CONTEXT } from '@cowprotocol/sdk-config'
import { CowError } from '@cowprotocol/sdk-common'
import { LastDaysVolumeQuery, LastHoursVolumeQuery, TotalsQuery } from './graphql'
import { LAST_DAYS_VOLUME_QUERY, LAST_HOURS_VOLUME_QUERY, TOTALS_QUERY } from './queries'

const SUBGRAPH_BASE_URL = 'https://gateway.thegraph.com/api/'

type SubgraphApiBaseUrls = Record<SupportedChainId, string | null>

interface SubgraphApiContext extends Omit<ApiContext, 'baseUrls'> {
  baseUrls?: SubgraphApiBaseUrls
}

type PartialSubgraphApiContext = Partial<SubgraphApiContext>

/**
 * TheGraph API client for CoW Protocol.
 */
export class SubgraphApi {
  API_NAME = 'CoW Protocol Subgraph'

  public context: SubgraphApiContext

  /**
   * CoW Protocol Production Subgraph API configuration.
   * @see {@link https://thegraph.com/explorer?search=cow-subgraph&orderBy=Query%20Count&orderDirection=desc}
   */
  public SUBGRAPH_PROD_CONFIG: SubgraphApiBaseUrls

  /**
   * Create a new CoW Protocol API instance.
   * @param context Any properties of the {@link SubgraphApiContext} may be overridden by passing a {@link PartialSubgraphApiContext}.
   * @param apiKey The API key to use for the CoW Protocol Subgraph. {@link https://thegraph.com/studio/apikeys/}
   */
  constructor(context: PartialSubgraphApiContext = {}, apiKey?: string) {
    const baseUrl = SUBGRAPH_BASE_URL + `${apiKey}/subgraphs/id`
    this.SUBGRAPH_PROD_CONFIG = {
      [SupportedChainId.MAINNET]: baseUrl + '/8mdwJG7YCSwqfxUbhCypZvoubeZcFVpCHb4zmHhvuKTD',
      [SupportedChainId.GNOSIS_CHAIN]: baseUrl + '/HTQcP2gLuAy235CMNE8ApN4cbzpLVjjNxtCAUfpzRubq',
      [SupportedChainId.ARBITRUM_ONE]: baseUrl + '/CQ8g2uJCjdAkUSNkVbd9oqqRP2GALKu1jJCD3fyY5tdc',
      [SupportedChainId.BASE]: baseUrl + '/EYfBtJDj2thuBCVhdpYDpzfsWzDg3qzpEsitqMouU4Rg',
      [SupportedChainId.SEPOLIA]: baseUrl + '/31isonmztVX9ejBneP6SaVDQwEtyKCGBb3RTafB9Uf2y',
      [SupportedChainId.POLYGON]: null,
      [SupportedChainId.AVALANCHE]: null,
    }
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
    const total = response.totals[0]
    if (!total) throw new CowError('No totals found')
    return total
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
    contextOverride: PartialSubgraphApiContext = {},
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
    contextOverride: PartialSubgraphApiContext = {},
  ): Promise<T> {
    const { chainId } = this.getContextWithOverride(contextOverride)
    const baseUrl = this.getEnvConfigs()[chainId]

    if (baseUrl === null) {
      throw new Error('Unsupported Network. The subgraph API is not available in the Network ' + chainId)
    }

    try {
      return await request(baseUrl, query, variables)
    } catch (error) {
      console.error(`[subgraph:${this.API_NAME}]`, error)
      throw new CowError(
        `Error running query: ${query}. Variables: ${JSON.stringify(variables)}. API: ${baseUrl}. Inner Error: ${error}`,
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
   * Get the base URLs.
   * @returns {ApiBaseUrls} The base URLs for the production environment.
   */
  private getEnvConfigs(): SubgraphApiBaseUrls {
    if (this.context.baseUrls) return this.context.baseUrls

    return this.SUBGRAPH_PROD_CONFIG
  }
}
