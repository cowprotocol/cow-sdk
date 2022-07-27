import { Signer } from 'ethers'
import log from 'loglevel'
import { CowError } from './utils/common'
import { CowApi, CowSubgraphApi, MetadataApi } from './api'
import { SupportedChainId as ChainId } from './constants/chains'
import { Context, CowContext } from './utils/context'
import { signOrder, signOrderCancellation, UnsignedOrder } from './utils/sign'
import { ZeroXApi } from './api/0x'
import ParaswapApi from './api/paraswap'
// types
import {
  Options,
  OptionsWithApisEnabledStatus,
  OptionsWithParaswapEnabled,
  OptionsWithZeroXEnabled,
  ParaswapEnabled,
  ZeroXEnabled,
} from 'sdk'
import { ExtendsObject } from 'utilities'

interface ICowSdk<Opt extends Options> {
  context: Context
  cowApi: CowApi
  metadataApi: MetadataApi
  cowSubgraphApi: CowSubgraphApi
  zeroXApi: ZeroXEnabled<Opt>
  paraswapApi: ParaswapEnabled<Opt>
}
export class CowSdk<T extends ChainId = ChainId, Opt extends Options = OptionsWithApisEnabledStatus>
  implements ICowSdk<Opt>
{
  context
  cowApi
  metadataApi
  cowSubgraphApi
  zeroXApi: ExtendsObject<Opt, OptionsWithZeroXEnabled, ZeroXApi, undefined>
  paraswapApi: ExtendsObject<Opt, OptionsWithParaswapEnabled, ParaswapApi, undefined>

  constructor(chainId: T = ChainId.MAINNET as T, cowContext: CowContext = {}, options: Options = {}) {
    const zeroXEnabled = options?.zeroXOptions?.enabled ?? false
    const paraswapEnabled = options?.paraswapOptions?.enabled ?? false

    this.context = new Context(chainId, { ...cowContext })
    this.cowApi = new CowApi(this.context)
    this.cowSubgraphApi = new CowSubgraphApi(this.context)
    this.metadataApi = new MetadataApi(this.context)

    this.zeroXApi = (zeroXEnabled ? new ZeroXApi(chainId, options.zeroXOptions) : undefined) as ZeroXEnabled<Opt>
    this.paraswapApi = (paraswapEnabled ? new ParaswapApi(options.paraswapOptions) : undefined) as ParaswapEnabled<Opt>

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
