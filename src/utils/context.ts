import { Signer } from 'ethers'
import { CowError } from './common'
import { DEFAULT_APP_DATA_HASH } from '/constants'

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
export class Context implements Required<CowContext> {
  private context: CowContext

  constructor(context: CowContext) {
    this.context = { ...DefaultCowContext, ...context }
  }

  get appDataHash(): string {
    return this.context.appDataHash ?? DefaultCowContext.appDataHash
  }

  get isDevEnvironment(): boolean {
    return this.context.isDevEnvironment ?? DefaultCowContext.isDevEnvironment
  }

  get signer(): Signer {
    if (this.context.signer) {
      return this.context.signer
    }

    throw new CowError('No signer was provided')
  }
}
