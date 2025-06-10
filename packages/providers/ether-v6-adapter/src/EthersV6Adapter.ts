import {
  Provider,
  Signer,
  VoidSigner,
  JsonRpcSigner,
  Wallet,
  BytesLike,
  ZeroAddress,
  TypedDataDomain,
  TypedDataField,
  BigNumberish,
  Interface,
} from 'ethers'
import { AbstractProviderAdapter, AdapterTypes } from '@cowprotocol/sdk-common'
import { EthersV6Utils } from './EthersV6Utils'
import {
  EthersV6SignerAdapter,
  IntChainIdTypedDataV4Signer,
  TypedDataV3Signer,
  TypedDataVersionedSigner,
} from './EthersV6SignerAdapter'

type Abi = ConstructorParameters<typeof Interface>[0]

export interface EthersV6Types extends AdapterTypes {
  Abi: Abi
  Address: string
  Bytes: BytesLike
  BigIntish: BigNumberish
  ContractInterface: Interface
  Provider: Provider
  Signer: Signer
  TypedDataDomain: TypedDataDomain
  TypedDataTypes: Record<string, TypedDataField[]>
}

export class EthersV6Adapter extends AbstractProviderAdapter<EthersV6Types> {
  declare protected _type?: EthersV6Types

  private provider: Provider
  private signer: Signer
  public Signer = EthersV6SignerAdapter
  public TypedDataVersionedSigner = TypedDataVersionedSigner
  public TypedDataV3Signer = TypedDataV3Signer
  public IntChainIdTypedDataV4Signer = IntChainIdTypedDataV4Signer
  public utils: EthersV6Utils

  constructor(providerOrSigner: Provider | Signer) {
    super()
    this.ZERO_ADDRESS = ZeroAddress
    if (
      providerOrSigner instanceof JsonRpcSigner ||
      providerOrSigner instanceof VoidSigner ||
      providerOrSigner instanceof Wallet
    ) {
      this.signer = providerOrSigner
      this.provider = this.signer.provider as Provider //Possible null - check later
      if (!this.provider) {
        throw new Error('Signer must be connected to a provider')
      }
    } else {
      this.provider = providerOrSigner as Provider
      this.signer = new VoidSigner('0x0000000000000000000000000000000000000000', this.provider)
    }

    this.utils = new EthersV6Utils()
  }

  async getChainId(): Promise<number> {
    const network = await this.provider.getNetwork()
    return Number(network.chainId)
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
    return this.signer.signTypedData(domain, types, value)
  }

  async getStorageAt(address: string, slot: BigNumberish): Promise<BytesLike> {
    return this.provider.getStorage(address, slot)
  }
}
