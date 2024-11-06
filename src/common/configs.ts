import { BackoffOptions } from 'exponential-backoff'
import { RateLimiterOpts } from 'limiter/dist/esm'
import { SupportedChainId } from './chains'

/**
 * IPFS configuration.
 *
 * For production use, consider using {@link Pinata: https://www.pinata.cloud/}
 * @property {string} [uri] The URI of the IPFS node to use.
 * @property {string} [writeUri] The URI of the IPFS node to use for writing.
 * @property {string} [readUri] The URI of the IPFS node to use for reading.
 * @property {string} [pinataApiKey] The API key to use for Pinata.
 * @property {string} [pinataApiSecret] The API secret to use for Pinata.
 */
export interface IpfsConfig {
  uri?: string
  writeUri?: string
  readUri?: string
  pinataApiKey?: string
  pinataApiSecret?: string
}

/**
 * @property {RateLimiterOpts} [limiterOpts] The options to use for the rate limiter.
 * @property {BackoffOptions} [backoffOpts] The options to use for the backoff.
 */
export interface RequestOptions {
  limiterOpts?: RateLimiterOpts
  backoffOpts?: BackoffOptions
}

/**
 * The environment to use for the Cow API.
 */
export type CowEnv = 'prod' | 'staging'

/**
 * Override some properties of the {@link ApiContext}.
 */
export type PartialApiContext = Partial<ApiContext>

/**
 * @property {string} [1] The base URL for the mainnet API.
 * @property {string} [100] The base URL for the Gnosis Chain API.
 * @property {string} [42161] The base URL for the Arbitrum One API.
 * @property {string} [8453] The base URL for the Base API.
 * @property {string} [11155111] The base URL for the Sepolia testnet API.
 */
export type ApiBaseUrls = Record<SupportedChainId, string>

/**
 * Define the context to use for the CoW Protocol API.
 *
 * CoW Protocol is a set of smart contracts and off-chain services, deployed on **multiple chains**.
 * {@link SupportedChainId Supported chains} are:
 * - Mainnet
 * - Gnosis Chain
 * - Arbitrum One
 * - Base
 * - Sepolia
 *
 * Each chain has it's own API, and each API has it's own base URL.
 *
 * Options may be selectively overridden by passing a {@link PartialApiContext} to the constructor.
 * @see {@link https://api.cow.fi/docs/#/}
 * @property {SupportedChainId} chainId The `chainId`` corresponding to this CoW Protocol API instance.
 * @property {CowEnv} env The environment that this context corresponds to.
 * @property {ApiBaseUrls} [baseUrls] URls that may be used to connect to this context.
 */
export interface ApiContext {
  chainId: SupportedChainId
  env: CowEnv
  baseUrls?: ApiBaseUrls
  limiterOpts?: RateLimiterOpts
  backoffOpts?: BackoffOptions
}

/**
 * The list of available environments.
 */
export const ENVS_LIST: CowEnv[] = ['prod', 'staging']

/**
 * The default CoW Protocol API context.
 */
export const DEFAULT_COW_API_CONTEXT: ApiContext = {
  env: 'prod',
  chainId: SupportedChainId.MAINNET,
}
