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
  Contract,
} from 'ethers'
import { AbstractProviderAdapter, AdapterTypes, Block, TransactionParams } from '@cowprotocol/sdk-common'
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

  async call(txParams: TransactionParams, provider?: Provider): Promise<string> {
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
    provider?: Provider,
  ): Promise<unknown> {
    const { address, abi, functionName, args } = params
    const providerToUse = provider || this.provider
    const contract = new Contract(address, abi, providerToUse)

    if (!contract[functionName])
      throw new Error(`Error reading contract ${address}: function ${functionName} was not found in Abi`)

    if (args && args.length > 0) {
      return contract[functionName](...args)
    }
    return contract[functionName]()
  }

  async getBlock(blockTag: string, provider?: Provider): Promise<Block> {
    const providerToUse = provider || this.provider
    const block = await providerToUse.getBlock(blockTag)
    if (!block) return {} as Block
    return block
  }
}
