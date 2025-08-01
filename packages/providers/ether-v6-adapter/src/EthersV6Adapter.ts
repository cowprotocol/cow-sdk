import {
  Provider,
  Signer,
  Wallet,
  BytesLike,
  ZeroAddress,
  TypedDataDomain,
  TypedDataField,
  BigNumberish,
  Interface,
  Contract,
  JsonRpcProvider,
} from 'ethers'
import {
  AbstractProviderAdapter,
  AdapterTypes,
  Block,
  TransactionParams,
  PrivateKey,
  CowError,
  GenericContract,
} from '@cowprotocol/sdk-common'
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

export interface EthersV6AdapterOptions {
  provider: Provider | string // RPC URL or Provider instance
  signer?: Signer | PrivateKey // Optional signer or private key
}

export class EthersV6Adapter extends AbstractProviderAdapter<EthersV6Types> {
  declare protected _type?: EthersV6Types

  private _provider: Provider
  private _signerAdapter?: EthersV6SignerAdapter

  public TypedDataVersionedSigner = TypedDataVersionedSigner
  public TypedDataV3Signer = TypedDataV3Signer
  public IntChainIdTypedDataV4Signer = IntChainIdTypedDataV4Signer
  public utils: EthersV6Utils

  constructor(options: EthersV6AdapterOptions) {
    super()
    this.ZERO_ADDRESS = ZeroAddress

    // Setup provider
    if (typeof options.provider === 'string') {
      this._provider = new JsonRpcProvider(options.provider)
    } else {
      if (!('getNetwork' in options.provider) || !('call' in options.provider)) {
        throw new CowError('Invalid Provider: missing required methods')
      }
      this._provider = options.provider
    }

    // Setup signer
    if (options.signer) {
      if (typeof options.signer === 'string') {
        const ethersV6Signer = new Wallet(options.signer, this._provider)
        this._signerAdapter = new EthersV6SignerAdapter(ethersV6Signer)
      } else {
        const ethersV6Signer = options.signer as Signer
        if (!ethersV6Signer.provider) {
          const connectedSigner = ethersV6Signer.connect(this._provider)
          this._signerAdapter = new EthersV6SignerAdapter(connectedSigner)
        } else {
          this._signerAdapter = new EthersV6SignerAdapter(ethersV6Signer)
        }
      }
    }

    this.utils = new EthersV6Utils()
  }

  get signer(): EthersV6SignerAdapter {
    if (!this._signerAdapter) {
      throw new CowError('No signer provided, use setSigner to create a signer')
    }
    return this._signerAdapter
  }

  signerOrNull(): EthersV6SignerAdapter | null {
    return this._signerAdapter || null
  }

  setSigner(signer: Signer | PrivateKey) {
    this._signerAdapter = this.createSigner(signer)
  }

  createSigner(signerOrPrivateKey: Signer | PrivateKey | EthersV6SignerAdapter): EthersV6SignerAdapter {
    if (signerOrPrivateKey instanceof EthersV6SignerAdapter) {
      return signerOrPrivateKey
    }
    if (typeof signerOrPrivateKey === 'string') {
      const ethersV6Signer = new Wallet(signerOrPrivateKey, this._provider)
      return new EthersV6SignerAdapter(ethersV6Signer)
    }
    const ethersV6Signer = signerOrPrivateKey as Signer
    if (!ethersV6Signer.provider) {
      const connectedSigner = ethersV6Signer.connect(this._provider)
      return new EthersV6SignerAdapter(connectedSigner)
    } else {
      return new EthersV6SignerAdapter(ethersV6Signer)
    }
  }

  async getChainId(): Promise<number> {
    const network = await this._provider.getNetwork()
    return Number(network.chainId)
  }

  async getStorageAt(address: string, slot: BigNumberish): Promise<BytesLike> {
    return this._provider.getStorage(address, slot)
  }

  async call(txParams: TransactionParams, provider?: Provider): Promise<string> {
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
    provider?: Provider,
  ): Promise<unknown> {
    const { address, abi, functionName, args } = params
    const providerToUse = provider || this._provider
    const contract = new Contract(address, abi, providerToUse)

    const fn = contract[functionName]
    if (!fn) throw new CowError(`Error reading contract ${address}: function ${functionName} was not found in Abi`)

    if (args && args.length > 0) {
      return fn(...args)
    }
    return fn()
  }

  async getBlock(blockTag: string, provider?: Provider): Promise<Block> {
    const providerToUse = provider || this._provider
    const block = await providerToUse.getBlock(blockTag)
    if (!block) return {} as Block
    return block
  }

  getContract(address: string, abi: Abi): GenericContract {
    const nativeContract = new Contract(address, abi, this._provider)
    const correctedInterface = this.utils.createInterface(abi)

    // Create a compatible estimateGas object for ethers v6
    const estimateGas: Record<string, (...args: any[]) => Promise<any>> = {}
    if (nativeContract.estimateGas) {
      // For ethers v6, estimateGas is a single method, not a record
      // We'll create a wrapper that works with the weiroll interface
      Object.keys(correctedInterface.functions || {}).forEach((functionName) => {
        estimateGas[functionName] = async (...args: any[]) => {
          // Use the native contract's estimateGas method if available
          if (nativeContract.estimateGas && typeof nativeContract.estimateGas === 'function') {
            return nativeContract.estimateGas(...args)
          }
          return Promise.resolve(0n)
        }
      })
    }
    return {
      ...nativeContract,
      interface: correctedInterface,
      address: nativeContract.target || address,
      estimateGas,
      functions: nativeContract.functions || {},
      provider: this._provider,
      runner: nativeContract.runner,
      filters: nativeContract.filters,
      fallback: nativeContract.fallback,
    } as GenericContract
  }
}
