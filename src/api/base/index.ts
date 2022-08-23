/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupportedChainId } from '../../constants/chains'
import { CowError } from '../../utils/common'
import { Context, Env } from '../../utils/context'
import { Options } from '../cow/types'
import fetch from 'cross-fetch'

interface ConstructorParams {
  context: Context
  name: string
  apiVersion?: string
  // we want getApiUrl to accept any parameters but return a specific type
  getApiUrl: (...params: any[]) => Partial<Record<SupportedChainId, string>>
  defaultHeaders?: HeadersInit
}

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }
const DEFAULT_API_VERSION = 'v1'

export default class BaseApi {
  context
  API_NAME
  API_VERSION
  API_URL_GETTER
  DEFAULT_HEADERS

  constructor({
    context,
    name,
    getApiUrl,
    defaultHeaders = DEFAULT_HEADERS,
    apiVersion = DEFAULT_API_VERSION,
  }: ConstructorParams) {
    this.context = context
    this.API_NAME = name
    this.API_VERSION = apiVersion
    this.API_URL_GETTER = getApiUrl
    this.DEFAULT_HEADERS = defaultHeaders
  }

  protected async getApiBaseUrl(...params: unknown[]): Promise<string> {
    const chainId = await this.context.chainId
    const baseUrl = this.API_URL_GETTER(...params)[chainId]

    if (!baseUrl) {
      throw new CowError(`Unsupported Network. The ${this.API_NAME} API is not deployed in the Network ` + chainId)
    } else {
      return baseUrl + '/' + this.API_VERSION
    }
  }

  protected post(url: string, data: unknown, options: Options = {}, onlySingleEnv?: boolean): Promise<Response> {
    const params = [url, 'POST', this.fetch.bind(this), this.API_URL_GETTER, options, data]
    if (onlySingleEnv) {
      return this.fetchSingleEnv(...(params as Parameters<typeof this.fetchSingleEnv>))
    } else {
      return this.fetchMultipleEnvs(...(params as Parameters<typeof this.fetchMultipleEnvs>))
    }
  }

  protected get(url: string, options: Options = {}): Promise<Response> {
    return this.fetchMultipleEnvs(url, 'GET', this.fetch.bind(this), this.API_URL_GETTER, options)
  }

  protected delete(url: string, data: unknown, options: Options = {}): Promise<Response> {
    return this.fetchMultipleEnvs(url, 'DELETE', this.fetch.bind(this), this.API_URL_GETTER, options, data)
  }

  protected async fetchSingleEnv(
    url: string,
    method: 'GET' | 'POST' | 'DELETE',
    fetchFn: BaseApi['fetch'],
    getApiUrl: BaseApi['API_URL_GETTER'],
    options: Options = {},
    data?: unknown
  ): Promise<Response> {
    const { chainId: networkId, env: _env, requestOptions } = options

    const env = _env || (await this.context.env) || 'prod'
    const chainId = networkId || (await this.context.chainId)

    const uri = getApiUrl(env)
    return fetchFn(url, method, `${uri[chainId]}/${this.API_VERSION}`, data, requestOptions)
  }

  protected async fetchMultipleEnvs(
    url: string,
    method: 'GET' | 'POST' | 'DELETE',
    fetchFn: BaseApi['fetch'],
    getApiUrl: BaseApi['API_URL_GETTER'],
    options: Options = {},
    data?: unknown
  ): Promise<Response> {
    const { env, chainId: networkId, ...otherOptions } = options

    // No env set? Check first prod then staging
    // Otherwise use what's passed in
    const envs: Env[] = !env ? ['prod', 'staging'] : [env]
    const chainId = networkId || (await this.context.chainId)

    return this.fetchMultipleEnvsRecursive({
      url,
      method,
      fetchFn,
      getApiUrl,
      options: otherOptions,
      envs,
      chainId,
      data,
    })
  }

  protected async fetch(
    url: string,
    method: 'GET' | 'POST' | 'DELETE',
    baseUrl: string,
    data?: unknown,
    requestOptions?: RequestInit
  ): Promise<Response> {
    return fetch(baseUrl + url, {
      headers: this.DEFAULT_HEADERS,
      ...requestOptions,
      method,
      body: data !== undefined ? JSON.stringify(data) : data,
    })
  }

  private async fetchMultipleEnvsRecursive(params: FetchMultipleEnvsRecursiveParams): Promise<Response> {
    const { url, method, fetchFn, getApiUrl, options = {}, envs, chainId, data } = params

    const { requestOptions } = options
    // Pick the first env from the list to try
    const [env, ...nextEnvs] = envs

    const uri = getApiUrl(env)[chainId]

    try {
      const response = await fetchFn(url, method, `${uri}/${this.API_VERSION}`, data, requestOptions)

      if (!response.ok && nextEnvs?.length) {
        // If the response is not ok and there are more envs to try, do that
        return this.fetchMultipleEnvsRecursive({ ...params, envs: nextEnvs })
      }

      // Otherwise return response as is
      return response
    } catch (error) {
      if (nextEnvs?.length) {
        // If request failed and there are more envs to try, do that
        return this.fetchMultipleEnvsRecursive({ ...params, envs: nextEnvs })
      } else {
        // Otherwise re-throw error as is
        throw error
      }
    }
  }
}

type FetchMultipleEnvsRecursiveParams = {
  url: string
  method: 'GET' | 'POST' | 'DELETE'
  fetchFn: BaseApi['fetch']
  getApiUrl: BaseApi['API_URL_GETTER']
  options: Omit<Options, 'env' | 'chainId'>
  envs: Env[]
  chainId: SupportedChainId
  data?: unknown
}
