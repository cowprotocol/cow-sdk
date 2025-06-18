import { BigNumberish, BytesLike, ethers } from 'ethers'
import type { TypedDataDomain, TypedDataField, TypedDataSigner } from '@ethersproject/abstract-signer'
import { AbstractProviderAdapter, AdapterTypes, TransactionParams } from '@cowprotocol/sdk-common'
import { EthersV5Utils } from './EthersV5Utils'
import {
  EthersV5SignerAdapter,
  IntChainIdTypedDataV4Signer,
  TypedDataV3Signer,
  TypedDataVersionedSigner,
} from './EthersV5SignerAdapter'

type Abi = ConstructorParameters<typeof ethers.utils.Interface>[0]
type Interface = ethers.utils.Interface

export interface EthersV5Types extends AdapterTypes {
  Abi: Abi
  Address: string
  Bytes: BytesLike
  BigIntish: BigNumberish
  ContractInterface: Interface
  Provider: ethers.providers.Provider
  Signer: ethers.Signer
  TypedDataDomain: TypedDataDomain
  TypedDataTypes: Record<string, TypedDataField[]>
}

export class EthersV5Adapter extends AbstractProviderAdapter<EthersV5Types> {
  declare protected _type?: EthersV5Types

  private provider: ethers.providers.Provider
  private signer: ethers.Signer & TypedDataSigner
  public utils: EthersV5Utils
  public Signer = EthersV5SignerAdapter
  public TypedDataVersionedSigner = TypedDataVersionedSigner
  public TypedDataV3Signer = TypedDataV3Signer
  public IntChainIdTypedDataV4Signer = IntChainIdTypedDataV4Signer

  constructor(providerOrSigner: ethers.providers.Provider | ethers.Signer) {
    super()
    this.ZERO_ADDRESS = ethers.constants.AddressZero

    if (ethers.Signer.isSigner(providerOrSigner)) {
      this.signer = providerOrSigner as ethers.Signer & TypedDataSigner
      this.provider = providerOrSigner.provider as ethers.providers.Provider
      if (!this.provider) {
        throw new Error('Signer must be connected to a provider')
      }
    } else {
      this.provider = providerOrSigner
      this.signer = new ethers.VoidSigner(
        '0x0000000000000000000000000000000000000000',
        this.provider,
      ) as ethers.Signer & TypedDataSigner
    }

    this.utils = new EthersV5Utils()
  }

  async getChainId(): Promise<number> {
    return (await this.provider.getNetwork()).chainId
  }

  async getAddress(): Promise<string> {
    return this.signer.getAddress()
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    return this.signer.signMessage(message)
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, unknown>,
  ): Promise<string> {
    return this.signer._signTypedData(domain, types, value)
  }

  async getStorageAt(address: string, slot: BigNumberish): Promise<BytesLike> {
    return this.provider.getStorageAt(address, slot)
  }

  async call(txParams: TransactionParams, provider?: ethers.providers.Provider): Promise<string> {
    const providerToUse = provider || this.provider
    return providerToUse.call({
      to: txParams.to,
      from: txParams.from,
      data: txParams.data,
    })
  }

  async readContract(
    params: {
      address: string
      abi: Abi
      functionName: string
      args?: unknown[]
    },
    provider?: ethers.providers.Provider,
  ): Promise<unknown> {
    const { address, abi, functionName, args } = params
    const providerToUse = provider || this.provider
    const contract = new ethers.Contract(address, abi, providerToUse)
    if (args && args.length > 0) {
      return contract[functionName](...args)
    }
    return contract[functionName]()
  }

  async getBlock(blockTag: string, provider?: ethers.providers.JsonRpcProvider) {
    const providerToUse = provider || this.provider
    return await providerToUse.getBlock(blockTag)
  }
}
