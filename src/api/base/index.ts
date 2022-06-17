import { SupportedChainId } from '../../constants/chains'
import { CowError } from '../../utils/common'
import { Context } from '../../utils/context'

interface ConstructorParams {
  context: Context
  name: string
  baseUrl: Partial<Record<SupportedChainId, string>>
}

export default class BaseApi {
  context: Context
  API_NAME: ConstructorParams['name']
  API_BASE_URL: ConstructorParams['baseUrl']

  constructor(params: ConstructorParams) {
    this.context = params.context
    this.API_NAME = params.name
    this.API_BASE_URL = params.baseUrl
  }

  get DEFAULT_HEADERS() {
    return { 'Content-Type': 'application/json', 'X-AppId': this.context.appDataHash }
  }

  public async getApiBaseUrl(): Promise<string> {
    const chainId = await this.context.chainId
    const baseUrl = this.API_BASE_URL[chainId]

    if (!baseUrl) {
      throw new CowError(`Unsupported Network. The ${this.API_NAME} API is not deployed in the Network ` + chainId)
    } else {
      return baseUrl
    }
  }

  public async fetch(url: string, method: 'GET' | 'POST' | 'DELETE', data?: unknown): Promise<Response> {
    const baseUrl = await this.getApiBaseUrl()
    return fetch(baseUrl + url, {
      headers: this.DEFAULT_HEADERS,
      method,
      body: data !== undefined ? JSON.stringify(data) : data,
    })
  }

  public post(url: string, data: unknown): Promise<Response> {
    return this.fetch(url, 'POST', data)
  }

  public get(url: string): Promise<Response> {
    return this.fetch(url, 'GET')
  }

  public delete(url: string, data: unknown): Promise<Response> {
    return this.fetch(url, 'DELETE', data)
  }
}
