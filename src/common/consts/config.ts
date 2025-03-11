import { SupportedChainId, ApiContext, CowEnv } from '..'

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
