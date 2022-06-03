import { Signer } from 'ethers'
import log from 'loglevel'
import { CowError, logPrefix } from './common'
import { SupportedChainId as ChainId } from '../constants/chains'
import { DEFAULT_APP_DATA_HASH, DEFAULT_IPFS_READ_URI, DEFAULT_IPFS_WRITE_URI } from '../constants'

export interface Ipfs {
  uri?: string
  writeUri?: string
  readUri?: string
  pinataApiKey?: string
  pinataApiSecret?: string
}

export interface CowContext {
  appDataHash?: string
  isDevEnvironment?: boolean
  signer?: Signer
  ipfs?: Ipfs
}

export const DefaultCowContext = {
  appDataHash: DEFAULT_APP_DATA_HASH,
  isDevEnvironment: false,
  ipfs: {
    readUri: DEFAULT_IPFS_READ_URI,
    writeUri: DEFAULT_IPFS_WRITE_URI,
    apiKey: undefined,
    apiSecret: undefined,
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
  #context: CowContext
  #chainId: ChainId

  constructor(chainId: ChainId, context: CowContext) {
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

  get isDevEnvironment(): boolean {
    return this.#context.isDevEnvironment ?? DefaultCowContext.isDevEnvironment
  }

  get signer(): Signer | undefined {
    return this.#context.signer
  }

  get ipfs(): Ipfs {
    return this.#context.ipfs ?? DefaultCowContext.ipfs
  }
}
