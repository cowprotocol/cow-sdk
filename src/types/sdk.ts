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
export type OptionsWithZeroXEnabled = Options & { zeroXOptions: { enabled: true } }
export type ZeroXEnabled<Opt> = ExtendsObject<Opt, OptionsWithZeroXEnabled, ZeroXApi, undefined>

export type OptionsWithParaswapEnabled = Options & { paraswapOptions: { enabled: true } }
export type ParaswapEnabled<Opt> = ExtendsObject<Opt, OptionsWithParaswapEnabled, ParaswapApi, undefined>
