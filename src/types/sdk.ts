import { LogLevelDesc } from 'loglevel'
import { ExtendsObject } from 'utilities'
import { WithEnabled } from '.'
// 0x
import { ZeroXApi } from '../api/0x'
import { ZeroXOptions } from '../api/0x/types'
// paraswap
import ParaswapApi from '../api/paraswap'
import { ParaswapOptions } from '../api/paraswap/types'

export type Options = {
  loglevel?: LogLevelDesc
  zeroXOptions?: Partial<ZeroXOptions & WithEnabled>
  paraswapOptions?: Partial<ParaswapOptions> & WithEnabled
}
export type OptionsWithZeroXEnabled = Options & { zeroXOptions: Partial<ZeroXOptions> & { enabled: true } }
export type ZeroXEnabled<Opt> = ExtendsObject<Opt, OptionsWithZeroXEnabled, ZeroXApi, undefined>

export type OptionsWithParaswapEnabled = Options & { paraswapOptions: Partial<ParaswapOptions> & { enabled: true } }
export type ParaswapEnabled<Opt> = ExtendsObject<Opt, OptionsWithParaswapEnabled, ParaswapApi, undefined>

export type OptionsWithApisEnabledStatus = Options &
  (
    | {
        paraswapOptions: Partial<ParaswapOptions> & { enabled: true }
        zeroXOptions: Partial<ZeroXOptions> & { enabled: true }
      }
    | {
        paraswapOptions: Partial<ParaswapOptions> & { enabled: false }
        zeroXOptions: Partial<ZeroXOptions> & { enabled: false }
      }
  )
