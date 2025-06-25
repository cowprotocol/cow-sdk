import { AbstractSigner } from './AbstractSigner'
import type {
  AdapterTypes,
  AdapterUtils,
  Block,
  PrivateKey,
  ReadContractParams,
  Signer,
  TransactionParams,
} from './types'

/**
 * AbstractProviderAdapter defines the common interface that all provider-specific
 * implementations must follow. This ensures consistent interaction with different
 * Ethereum libraries throughout the SDK.
 */
export abstract class AbstractProviderAdapter<T extends AdapterTypes = AdapterTypes> {
  public abstract utils: AdapterUtils

  public ZERO_ADDRESS!: T['Address']

  public abstract TypedDataVersionedSigner: new (signer: any, version: any) => AbstractSigner
  public abstract TypedDataV3Signer: new (signer: any) => AbstractSigner
  public abstract IntChainIdTypedDataV4Signer: new (signer: any) => AbstractSigner

  public abstract signer: AbstractSigner

  // Core functionality
  abstract getChainId(): Promise<number>
  abstract createSigner(signerOrPrivateKey: Signer | PrivateKey | AbstractSigner): AbstractSigner
  // reading functionality
  abstract getStorageAt(address: T['Address'], slot: unknown): Promise<unknown>

  // blockcahin interaction
  abstract call(txParams: TransactionParams, provider?: T['Provider']): Promise<string>
  abstract readContract(params: ReadContractParams, provider?: T['Provider']): Promise<unknown>
  abstract getBlock(blockTag: string, provider?: T['Provider']): Promise<Block>
}
