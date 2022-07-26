import { Signer } from 'ethers'
import log, { LogLevelDesc } from 'loglevel'
import { CowError } from './utils/common'
import { CowApi, CowSubgraphApi, MetadataApi } from './api'
import { SupportedChainId as ChainId, SupportedChainId } from './constants/chains'
import { Context, CowContext } from './utils/context'
import { signOrder, signOrderCancellation, UnsignedOrder } from './utils/sign'
import { ZeroXApi } from './api/0x'
import { ZeroXOptions } from './api/0x/types'
import ParaswapApi from './api/paraswap'
import { ParaswapOptions } from './api/paraswap/types'
import { WithEnabled } from './types'

type Options = {
  loglevel?: LogLevelDesc
  zeroXOptions?: Partial<ZeroXOptions & WithEnabled>
  paraswapOptions?: Partial<ParaswapOptions> & WithEnabled
}

type OptionsWithZeroXEnabled = Options & { zeroXOptions: { enabled: true } }
type ZeroXEnabled<Opt> = ExtendsObject<Opt, OptionsWithZeroXEnabled, ZeroXApi, undefined>

type OptionsWithParaswapEnabled = Options & { paraswapOptions: { enabled: true } }
type ParaswapEnabled<Opt> = ExtendsObject<Opt, OptionsWithParaswapEnabled, ParaswapApi, undefined>

type ExtendsObject<ExtendingObject, ExtendableObject, ResultingType, FallbackType> =
  ExtendingObject extends ExtendableObject ? ResultingType : FallbackType

interface ICowSdk<Opt extends Options> {
  context: Context
  cowApi: CowApi
  metadataApi: MetadataApi
  cowSubgraphApi: CowSubgraphApi
  zeroXApi: ZeroXEnabled<Opt>
  paraswapApi: ParaswapEnabled<Opt>
}
export class CowSdk<T extends ChainId, Opt extends Options> implements ICowSdk<Opt> {
  context
  cowApi
  metadataApi
  cowSubgraphApi
  zeroXApi: ExtendsObject<Opt, OptionsWithZeroXEnabled, ZeroXApi, undefined>
  paraswapApi: ExtendsObject<Opt, OptionsWithParaswapEnabled, ParaswapApi, undefined>

  constructor(chainId: T = SupportedChainId.MAINNET as T, cowContext: CowContext = {}, options: Options = {}) {
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
