import type { AdapterTypes, AdapterUtils } from './types'

/**
 * AbstractProviderAdapter defines the common interface that all provider-specific
 * implementations must follow. This ensures consistent interaction with different
 * Ethereum libraries throughout the SDK.
 */
export abstract class AbstractProviderAdapter<T extends AdapterTypes = AdapterTypes> {
  public abstract utils: AdapterUtils

  // Core functionality
  abstract getChainId(): Promise<number>
  abstract getAddress(): Promise<string>
}
