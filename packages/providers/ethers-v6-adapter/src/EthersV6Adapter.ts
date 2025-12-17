import {
  Provider,
  Signer,
  Wallet,
  BytesLike,
  ZeroAddress,
  BigNumberish,
  Interface,
  Contract,
  JsonRpcProvider,
} from 'ethers'
import {
  AbstractProviderAdapter,
  Block,
  ContractValue,
  TransactionParams,
  PrivateKey,
  CowError,
  GenericContract,
  TransactionReceipt,
  AdapterTypes,
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
  Bytes: BytesLike
  ContractInterface: Interface
  Provider: Provider
  Signer: Signer
}

export interface EthersV6AdapterOptions {
  provider: Provider | string // RPC URL or Provider instance
  signer?: Signer | PrivateKey // Optional signer or private key
}

export class EthersV6Adapter extends AbstractProviderAdapter<EthersV6Types> {
  private _provider: Provider
  private _signerAdapter?: EthersV6SignerAdapter

  public TypedDataVersionedSigner = TypedDataVersionedSigner
  public TypedDataV3Signer = TypedDataV3Signer
  public IntChainIdTypedDataV4Signer = IntChainIdTypedDataV4Signer
  public utils: EthersV6Utils

  constructor(options: EthersV6AdapterOptions) {
    super()
    this.ZERO_ADDRESS = ZeroAddress

    this._provider = this.setProvider(
      typeof options.provider === 'string' ? new JsonRpcProvider(options.provider) : options.provider,
    )

    if (options.signer) {
      this._signerAdapter = this.createSigner(options.signer)
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

  setProvider(provider: Provider): Provider {
    this._provider = provider

    this.signerOrNull()?.connect(this._provider)

    return this._provider
  }

  createSigner(signerOrPrivateKey: Signer | PrivateKey | EthersV6SignerAdapter): EthersV6SignerAdapter {
    if (signerOrPrivateKey instanceof EthersV6SignerAdapter) {
      signerOrPrivateKey.connect(this._provider)

      return signerOrPrivateKey
    }

    if (typeof signerOrPrivateKey === 'string') {
      const ethersV6Signer = new Wallet(signerOrPrivateKey, this._provider)

      return new EthersV6SignerAdapter(ethersV6Signer.connect(this._provider))
    }

    // Important: do not call .connect() when signer already has a provider
    // otherwise it will throw "cannot alter JSON-RPC Signer connection"
    return new EthersV6SignerAdapter(
      signerOrPrivateKey.provider ? signerOrPrivateKey : signerOrPrivateKey.connect(this._provider),
    )
  }

  async getChainId(): Promise<number> {
    const network = await this._provider.getNetwork()
    return Number(network.chainId)
  }

  async getCode(address: string): Promise<string> {
    return this._provider.getCode(address)
  }

  async getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt | null> {
    const receipt = await this._provider.getTransactionReceipt(transactionHash)

    if (!receipt) return receipt

    return {
      ...receipt,
      blockNumber: BigInt(receipt.blockNumber),
      transactionHash: receipt.hash,
      logs: receipt.logs.map((log) => ({
        ...log,
        blockNumber: BigInt(log.blockNumber),
        logIndex: log.index,
        topics: [...log.topics],
      })),
    } as TransactionReceipt
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
      args?: ContractValue[]
    },
    provider?: Provider,
  ): Promise<unknown> {
    const { address, abi, functionName, args = [] } = params
    const providerToUse = provider || this._provider
    const contract = new Contract(address, abi, providerToUse)

    const fn = contract.getFunction(functionName)
    if (!fn) throw new CowError(`Error reading contract ${address}: function ${functionName} was not found in Abi`)

    return fn.staticCall(...args)
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
