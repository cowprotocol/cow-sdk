import { SupportedChainId } from '../common'

export class Extensible {
  public chain: SupportedChainId

  constructor(chain: SupportedChainId) {
    this.chain = chain
  }

  // 1. Create a Safe with specified owners[], automatically enabling ExtensibleFallbackHandler, and ComposableCoW.
  // 2. Propose setFallbackHandler on an existing Safe (if not ExtensibleFallbackHandler).
  // 3. Propose setDomainVerifier on an ExtensibleFallbackHandler-enabled Safe to ComposableCoW for GPv2Settlement domain.
}
