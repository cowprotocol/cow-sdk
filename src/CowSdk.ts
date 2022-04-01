import { Signer } from 'ethers'
import log, { LogLevelDesc } from 'loglevel'
import { version as SDK_VERSION } from '../package.json'
import { CowApi } from './api'
import { CowError } from './utils/common'
import { SupportedChainId as ChainId } from '/constants/chains'
import { validateAppDataDocument } from '/utils/appData'
import { Context, CowContext } from '/utils/context'
import { signOrder, signOrderCancellation, UnsignedOrder } from '/utils/sign'

log.setDefaultLevel('debug')

type Options = {
  loglevel?: LogLevelDesc
}

export class CowSdk<T extends ChainId> {
  static version = SDK_VERSION
  context: Context
  cowApi: CowApi

  constructor(chainId: T, cowContext: CowContext = {}, options: Options = {}) {
    this.context = new Context(chainId, { ...cowContext })
    this.cowApi = new CowApi(this.context)
    log.setLevel(options.loglevel || 'error')
  }

  updateChainId = (chainId: T) => {
    this.context.updateChainId(chainId)
  }

  validateAppDataDocument = validateAppDataDocument

  async signOrder(order: Omit<UnsignedOrder, 'appData'>) {
    const signer = this._checkSigner()
    const chainId = await this.context.chainId
    return signOrder({ ...order, appData: this.context.appDataHash }, chainId, signer)
  }

  async signOrderCancellation(orderId: string) {
    const signer = this._checkSigner()
    const chainId = await this.context.chainId
    return signOrderCancellation(orderId, chainId, signer)
  }

  _checkSigner(signer: Signer | undefined = this.context.signer) {
    if (!signer) {
      throw new CowError('No signer available')
    }

    return signer
  }
}

export default CowSdk
