import { Signer } from 'ethers'
import log from 'loglevel'
import { CowError, logPrefix } from './common'
import { SupportedChainId as ChainId, SupportedChainId } from '../constants/chains'
import { DEFAULT_APP_DATA_HASH, DEFAULT_IPFS_READ_URI, DEFAULT_IPFS_WRITE_URI } from '../constants'

export type Env = 'prod' | 'staging'

export interface Ipfs {
  uri?: string
  writeUri?: string
  readUri?: string
  pinataApiKey?: string
  pinataApiSecret?: string
}

export interface CowContext {
  appDataHash?: string
  env?: Env
  signer?: Signer
  ipfs?: Ipfs
}

export const DefaultCowContext: { appDataHash: string; ipfs: Ipfs; env: Env } = {
  appDataHash: DEFAULT_APP_DATA_HASH,
  env: 'prod',
  ipfs: {
    readUri: DEFAULT_IPFS_READ_URI,
    writeUri: DEFAULT_IPFS_WRITE_URI,
    pinataApiKey: '',
    pinataApiSecret: '',
  },
}

/**
 *
 *
 * @export
 * @class Context
 * @implements {Required<CowContext>}
 */
export class Context implements Partial<CowContext> {
  updateContext(cowContext: CowContext, chainId: ChainId) {
    this.setParams(chainId, cowContext)
  }

  #chainId: ChainId = SupportedChainId.MAINNET
  #context: CowContext = DefaultCowContext

  constructor(chainId: ChainId, context: CowContext) {
    this.setParams(chainId, context)
  }

  private setParams(chainId: ChainId, context: CowContext) {
    this.#chainId = this.updateChainId(chainId)
    this.#context = {
      ...DefaultCowContext,
      ...context,
      ipfs: {
        ...DefaultCowContext.ipfs,
        ...context.ipfs,
      },
    }
  }

  updateChainId(chainId: ChainId) {
    if (!ChainId[chainId]) {
      throw new CowError(`Invalid chainId: ${chainId}`)
    }

    log.debug(logPrefix, `Updating chainId to: ${chainId}`)

    this.#chainId = chainId
    return chainId
  }

  get chainId(): Promise<ChainId> {
    const provider = this.#context.signer?.provider
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
      return chainId
    }

    return getAndReconciliateNetwork()
  }

  get appDataHash(): string {
    return this.#context.appDataHash ?? DefaultCowContext.appDataHash
  }

  get env(): Env {
    return this.#context.env || DefaultCowContext.env
  }

  get signer(): Signer | undefined {
    return this.#context.signer
  }

  get ipfs(): Ipfs {
    return this.#context.ipfs ?? DefaultCowContext.ipfs
  }
}
