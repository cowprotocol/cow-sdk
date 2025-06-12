import { RAW_FILES_PATH } from '../common/consts/path'
import { DEFAULT_QUOTE_VALIDITY } from '../common/consts/order'

export const RAW_PROVIDERS_FILES_PATH = `${RAW_FILES_PATH}/src/bridging/providers`
export const DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION = 200_000 // Based on https://dashboard.tenderly.co/shoom/project/simulator/a5e29dac-d0f2-407f-9e3d-d1b916da595b
export const HOOK_DAPP_BRIDGE_PROVIDER_PREFIX = 'cow-sdk://bridging/providers'

export const BRIDGE_HOOK_VALIDITY = DEFAULT_QUOTE_VALIDITY * 2 // 2 times of order validity = 60 minutes
