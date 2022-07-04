import log, { LogLevelDesc } from 'loglevel'
import { SupportedChainId as ChainId } from './constants/chains'
import { Context, CowContext } from './utils/context'
import { ZeroXApi } from './api/0x'

type Options = {
  loglevel?: LogLevelDesc
}

export class ZeroXSdk<T extends ChainId> {
  context: Context
  api: ZeroXApi

  constructor(chainId: T, cowContext: CowContext = {}, options: Options = {}) {
    this.context = new Context(chainId, { ...cowContext })
    this.api = new ZeroXApi(this.context)

    log.setLevel(options.loglevel || 'error')
  }

  updateChainId = (chainId: ChainId) => {
    this.context.updateChainId(chainId)
  }
}

export default ZeroXSdk
