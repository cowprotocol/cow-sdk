// Base path to GitHub raw files
export const RAW_FILES_PATH = 'https://raw.githubusercontent.com/cowprotocol/cow-sdk/refs/heads/main'

// for chains
export const RAW_CHAINS_FILES_PATH = `${RAW_FILES_PATH}/packages/config/src/chains`

// for bridging package
export const RAW_PROVIDERS_FILES_PATH = `${RAW_FILES_PATH}/src/bridging/providers` // TODO: fix to packages/bridging after copy
export const DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION = 110_000 // Based on https://dashboard.tenderly.co/anxolin/project/tx/0xc7d230c4119dabc7a4c332619a275d2390cf4596662be0524c04d1fa7a030c38/gas-usage
