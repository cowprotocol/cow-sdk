import { SupportedChainId } from './chains'
import { BackoffOptions } from 'exponential-backoff'
import { RateLimiterOpts } from 'limiter/dist/esm'

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
 * @property {string} [5] The base URL for the Goerli testnet API.
 * @property {string} [100] The base URL for the Gnosis Chain API.
 */
export type ApiBaseUrls = Record<SupportedChainId, string>

/**
 * Define the context to use for the CoW Protocol API.
 *
 * CoW Protocol is a set of smart contracts and off-chain services, deployed on **multiple chains**.
 * {@link SupportedChainId Supported chains} are:
 * - Mainnet
 * - Goerli
 * - Gnosis Chain
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
