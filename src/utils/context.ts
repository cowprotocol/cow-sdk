import { Signer } from 'ethers'
import log from 'loglevel'
import { CowError, logPrefix } from './common'
import { DEFAULT_APP_DATA_HASH } from '/constants'
import { SupportedChainId as ChainId } from '/constants/chains'

export interface CowContext {
  appDataHash?: string
  isDevEnvironment?: boolean
  signer?: Signer
}

export const DefaultCowContext = { appDataHash: DEFAULT_APP_DATA_HASH, isDevEnvironment: false }

/**
 *
 *
 * @export
 * @class Context
 * @implements {Required<CowContext>}
 */
export class Context implements Partial<CowContext> {
  private context: CowContext
  #chainId: ChainId

  constructor(chainId: ChainId, context: CowContext) {
    this.#chainId = this.updateChainId(chainId)
    this.context = { ...DefaultCowContext, ...context }
  }

  updateChainId(chainId: ChainId) {
    if (!ChainId[chainId]) {
      throw new CowError(`Invalid chainId: ${chainId}`)
    }

    this.#chainId = chainId
    return chainId
  }

  get chainId(): Promise<ChainId> {
    const provider = this.context.signer?.provider
    if (!provider) {
      return Promise.resolve(this.#chainId)
    }

    log.debug(logPrefix, 'Getting chainId from provider')

    const getAndReconciliateNetwork = async () => {
      const network = await provider.getNetwork()
      const chainId = network.chainId

      if (chainId !== this.#chainId) {
        log.debug(
          logPrefix,
          `ChainId mismatch: Provider's chainId: ${chainId} vs Context's chainId: ${
            this.#chainId
          }. Updating Context's chainId`
        )
        this.updateChainId(chainId)
      }
      return network.chainId
    }

    return getAndReconciliateNetwork()
  }

  get appDataHash(): string {
    return this.context.appDataHash ?? DefaultCowContext.appDataHash
  }

  get isDevEnvironment(): boolean {
    return this.context.isDevEnvironment ?? DefaultCowContext.isDevEnvironment
  }

  get signer(): Signer | undefined {
    return this.context.signer
  }
}
