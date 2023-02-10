import { Signer } from 'ethers'
import log from 'loglevel'
import { CowError } from './utils/common'
import { CowApi, CowSubgraphApi, MetadataApi } from './api'
import { SupportedChainId as ChainId } from './constants/chains'
import { Context, CowContext } from './utils/context'
import { signOrder, signOrderCancellation, UnsignedOrder } from './utils/sign'
// types
import { SdkOptions } from 'sdk'

export class CowSdk<T extends ChainId = ChainId, Opt extends SdkOptions = SdkOptions> {
  context: Context
  cowApi: CowApi
  metadataApi: MetadataApi
  cowSubgraphApi: CowSubgraphApi

  constructor(chainId: T = ChainId.MAINNET as T, cowContext: CowContext = {}, options: Opt = {} as Opt) {
    this.context = new Context(chainId, { ...cowContext })
    this.cowApi = new CowApi(this.context)
    this.cowSubgraphApi = new CowSubgraphApi(this.context)
    this.metadataApi = new MetadataApi(this.context)

    log.setLevel(options.loglevel || 'ERROR')
  }

  updateChainId = (chainId: ChainId) => {
    this.context.updateChainId(chainId)
  }

  updateContext = async (cowContext: CowContext, chainId?: ChainId) => {
    const networkId = await this.context.chainId
    this.context.updateContext(cowContext, chainId || networkId)
  }

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
