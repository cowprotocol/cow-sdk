import { AbstractSigner } from './AbstractSigner'
import {
  Abi,
  AdapterTypes,
  AdapterUtils,
  Address,
  Block,
  GenericContract,
  PrivateKey,
  ReadContractParams,
  Signer,
  TransactionParams,
  TransactionReceipt,
} from './types'

/**
 * AbstractProviderAdapter defines the common interface that all provider-specific
 * implementations must follow. This ensures consistent interaction with different
 * Ethereum libraries throughout the SDK.
 */
export abstract class AbstractProviderAdapter<T extends AdapterTypes = AdapterTypes> {
  public abstract utils: AdapterUtils

  public ZERO_ADDRESS!: T['Address']

  public abstract TypedDataVersionedSigner: new (signer: any, version: any) => AbstractSigner<T['Provider']>
  public abstract TypedDataV3Signer: new (signer: any) => AbstractSigner<T['Provider']>
  public abstract IntChainIdTypedDataV4Signer: new (signer: any) => AbstractSigner<T['Provider']>

  public abstract signer: AbstractSigner<T['Provider']>
  abstract signerOrNull(): AbstractSigner<T['Provider']> | null

  // Core functionality
  abstract getChainId(): Promise<number>
  abstract getCode(address: string): Promise<string | undefined>
  abstract getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt | null>
  abstract createSigner(
    signerOrPrivateKey: Signer | PrivateKey | AbstractSigner<T['Provider']>,
  ): AbstractSigner<T['Provider']>
  // reading functionality
  abstract getStorageAt(address: T['Address'], slot: string | number | bigint): Promise<unknown>

  // blockcahin interaction
  abstract call(txParams: TransactionParams, provider?: T['Provider']): Promise<string>
  abstract readContract(params: ReadContractParams, provider?: T['Provider']): Promise<unknown>
  abstract getBlock(blockTag: string, provider?: T['Provider']): Promise<Block>
  abstract setSigner(signer: Signer | PrivateKey): void
  abstract setProvider(provider: T['Provider']): T['Provider']
  abstract getContract(address: Address, abi: Abi): GenericContract
}
