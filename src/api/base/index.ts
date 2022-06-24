import { SupportedChainId } from '../../constants/chains'
import { CowError } from '../../utils/common'
import { Context } from '../../utils/context'
import { Options } from '../cow/types'

interface ConstructorParams {
  context: Context
  name: string
  getUrl: (...params: any[]) => Partial<Record<SupportedChainId, string>>
  defaultHeaders?: HeadersInit
}

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }
export default class BaseApi {
  context: Context
  API_NAME: ConstructorParams['name']
  URL_GETTER
  DEFAULT_HEADERS: ConstructorParams['defaultHeaders']

  constructor({ context, name, getUrl, defaultHeaders = DEFAULT_HEADERS }: ConstructorParams) {
    this.context = context
    this.API_NAME = name
    this.URL_GETTER = getUrl
    this.DEFAULT_HEADERS = defaultHeaders
  }

  public async getApiBaseUrl(): Promise<string> {
    const chainId = await this.context.chainId
    const baseUrl = this.URL_GETTER(this.context.isDevEnvironment)[chainId]

    if (!baseUrl) {
      throw new CowError(`Unsupported Network. The ${this.API_NAME} API is not deployed in the Network ` + chainId)
    } else {
      return baseUrl
    }
  }

  public post(url: string, data: unknown, options: Options = {}): Promise<Response> {
    return this.handleMethod(url, 'POST', this.fetch.bind(this), this.URL_GETTER, options, data)
  }

  public get(url: string, options: Options = {}): Promise<Response> {
    return this.handleMethod(url, 'GET', this.fetch.bind(this), this.URL_GETTER, options)
  }

  public delete(url: string, data: unknown, options: Options = {}): Promise<Response> {
    return this.handleMethod(url, 'DELETE', this.fetch.bind(this), this.URL_GETTER, options, data)
  }

  public async handleMethod(
    url: string,
    method: 'GET' | 'POST' | 'DELETE',
    fetchFn: typeof this.fetch /*  | typeof this.fetchProfile */,
    getUrl: typeof this.URL_GETTER,
    options: Options = {},
    data?: unknown
  ): Promise<Response> {
    const { chainId: networkId, isDevEnvironment, reqOptions } = options
    const prodUri = getUrl(false)
    const barnUri = getUrl(true)
    const chainId = networkId || (await this.context.chainId)

    let response
    if (isDevEnvironment === undefined) {
      try {
        response = await fetchFn(url, method, `${prodUri[chainId]}/v1`, data, reqOptions)
      } catch (error) {
        response = await fetchFn(url, method, `${barnUri[chainId]}/v1`, data, reqOptions)
      }
    } else {
      const uri = isDevEnvironment ? barnUri : prodUri
      response = await fetchFn(url, method, `${uri[chainId]}/v1`, data, reqOptions)
    }
    return response
  }

  private async fetch(
    url: string,
    method: 'GET' | 'POST' | 'DELETE',
    baseUrl: string,
    data?: unknown,
    reqOptions?: RequestInit
  ): Promise<Response> {
    return fetch(baseUrl + url, {
      headers: this.DEFAULT_HEADERS,
      ...reqOptions,
      method,
      body: data !== undefined ? JSON.stringify(data) : data,
    })
  }
}
