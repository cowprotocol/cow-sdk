import { BigNumberish, BytesLike, ethers } from 'ethers'
import type { TypedDataDomain, TypedDataField, TypedDataSigner } from '@ethersproject/abstract-signer'
import { AbstractProviderAdapter, AdapterTypes, TransactionParams, PrivateKey, CowError } from '@cowprotocol/sdk-common'
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

export interface EthersV5AdapterOptions {
  provider: ethers.providers.Provider | string // RPC URL or Provider instance
  signer?: ethers.Signer | PrivateKey // Optional signer or private key
}

export class EthersV5Adapter extends AbstractProviderAdapter<EthersV5Types> {
  declare protected _type?: EthersV5Types

  private _provider: ethers.providers.Provider
  private _signerAdapter?: EthersV5SignerAdapter

  public utils: EthersV5Utils
  public TypedDataVersionedSigner = TypedDataVersionedSigner
  public TypedDataV3Signer = TypedDataV3Signer
  public IntChainIdTypedDataV4Signer = IntChainIdTypedDataV4Signer

  constructor(options: EthersV5AdapterOptions) {
    super()
    this.ZERO_ADDRESS = ethers.constants.AddressZero

    // Setup provider
    if (typeof options.provider === 'string') {
      this._provider = new ethers.providers.JsonRpcProvider(options.provider)
    } else {
      if (!('getNetwork' in options.provider) || !('call' in options.provider)) {
        throw new CowError('Invalid Provider: missing required methods')
      }
      this._provider = options.provider
    }

    // Setup signer
    if (options.signer) {
      if (typeof options.signer === 'string') {
        const ethersV5Signer = new ethers.Wallet(options.signer, this._provider)
        this._signerAdapter = new EthersV5SignerAdapter(ethersV5Signer)
      } else {
        const ethersV5Signer = options.signer as ethers.Signer & TypedDataSigner
        if (!ethersV5Signer.provider) {
          const connectedSigner = ethersV5Signer.connect(this._provider) as ethers.Signer & TypedDataSigner
          this._signerAdapter = new EthersV5SignerAdapter(connectedSigner)
        } else {
          this._signerAdapter = new EthersV5SignerAdapter(ethersV5Signer)
        }
      }
    }

    this.utils = new EthersV5Utils()
  }

  get signer(): EthersV5SignerAdapter {
    if (!this._signerAdapter) {
      throw new CowError('No signer provided, use setSigner to create a signer')
    }
    return this._signerAdapter
  }

  setSigner(signer: ethers.Signer | PrivateKey) {
    this._signerAdapter = this.createSigner(signer)
  }

  createSigner(signerOrPrivateKey: ethers.Signer | PrivateKey | EthersV5SignerAdapter): EthersV5SignerAdapter {
    if (signerOrPrivateKey instanceof EthersV5SignerAdapter) {
      return signerOrPrivateKey
    }
    if (typeof signerOrPrivateKey === 'string') {
      const wallet = new ethers.Wallet(signerOrPrivateKey, this._provider)
      return new EthersV5SignerAdapter(wallet)
    }
    const ethersV5Signer = signerOrPrivateKey as ethers.Signer & TypedDataSigner
    if (!ethersV5Signer.provider) {
      const connectedSigner = ethersV5Signer.connect(this._provider) as ethers.Signer & TypedDataSigner
      return new EthersV5SignerAdapter(connectedSigner)
    } else {
      return new EthersV5SignerAdapter(ethersV5Signer)
    }
  }

  async getChainId(): Promise<number> {
    return (await this._provider.getNetwork()).chainId
  }

  async getStorageAt(address: string, slot: BigNumberish): Promise<BytesLike> {
    return this._provider.getStorageAt(address, slot)
  }

  async call(txParams: TransactionParams, provider?: ethers.providers.Provider): Promise<string> {
    const providerToUse = provider || this._provider
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
    const providerToUse = provider || this._provider
    const contract = new ethers.Contract(address, abi, providerToUse)

    if (!contract[functionName])
      throw new CowError(`Error reading contract ${address}: function ${functionName} was not found in Abi`)

    if (args && args.length > 0) {
      return contract[functionName](...args)
    }
    return contract[functionName]()
  }

  async getBlock(blockTag: string, provider?: ethers.providers.JsonRpcProvider) {
    const providerToUse = provider || this._provider
    return await providerToUse.getBlock(blockTag)
  }
}
