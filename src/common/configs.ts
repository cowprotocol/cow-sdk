import { SupportedChainId } from './chains'
import { BackoffOptions } from 'exponential-backoff'
import { RateLimiterOpts } from 'limiter/dist/esm'

export interface IpfsConfig {
  uri?: string
  writeUri?: string
  readUri?: string
  pinataApiKey?: string
  pinataApiSecret?: string
}

export interface RequestOptions {
  limiterOpts?: RateLimiterOpts
  backoffOpts?: BackoffOptions
}

export type CowEnv = 'prod' | 'staging'

export type PartialApiContext = Partial<ApiContext>

export type ApiBaseUrls = Record<SupportedChainId, string>

export interface ApiContext {
  chainId: SupportedChainId
  env: CowEnv
  baseUrls?: ApiBaseUrls
}

export const ENVS_LIST: CowEnv[] = ['prod', 'staging']

export const DEFAULT_COW_API_CONTEXT: ApiContext = {
  env: 'prod',
  chainId: SupportedChainId.MAINNET,
}
