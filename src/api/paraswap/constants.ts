import { NetworkID, ParaSwap } from 'paraswap'
import { ALL_SUPPORTED_CHAIN_IDS } from '../../constants/chains'
import { ParaswapLibMap } from './types'

export const BASE_URL = 'https://apiv5.paraswap.io'
export const API_NAME = 'Paraswap'
export const DEFAULT_RATE_OPTIONS = {
  maxImpact: 100,
  excludeDEXS: 'ParaSwapPool4',
}
export const LOG_PREFIX = 'ParaswapApi'
export const LIB: ParaswapLibMap = new Map([
  [1, new ParaSwap(1, BASE_URL)],
  [3, new ParaSwap(3, BASE_URL)],
  [56, new ParaSwap(56, BASE_URL)],
  [137, new ParaSwap(137, BASE_URL)],
  [250, new ParaSwap(250, BASE_URL)],
  [42161, new ParaSwap(42161, BASE_URL)],
  [43114, new ParaSwap(43114, BASE_URL)],
])
export const COMPATIBLE_PARASWAP_CHAINS_WITH_COW = ALL_SUPPORTED_CHAIN_IDS.filter((chain: number) =>
  LIB.has(chain as NetworkID)
)
