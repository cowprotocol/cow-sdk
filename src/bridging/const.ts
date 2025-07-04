import { RAW_FILES_PATH } from '../common/consts/path'

export const RAW_PROVIDERS_FILES_PATH = `${RAW_FILES_PATH}/src/bridging/providers`
// Based on https://dashboard.tenderly.co/shoom/project/simulator/a5e29dac-d0f2-407f-9e3d-d1b916da595b
export const DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION = 240_000
// Based on https://dashboard.tenderly.co/shoom/project/tx/0x2971aee9aa7237d24b254da8ccd4345ff77410c8829c8e825e9a02cb2cece5e6/gas-usage
export const COW_SHED_PROXY_CREATION_GAS = 360_000
export const HOOK_DAPP_BRIDGE_PROVIDER_PREFIX = 'cow-sdk://bridging/providers'
