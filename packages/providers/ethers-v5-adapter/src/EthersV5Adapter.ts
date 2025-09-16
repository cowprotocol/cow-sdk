import { BigNumberish, BytesLike, ethers } from 'ethers'
import type { TypedDataSigner } from '@ethersproject/abstract-signer'
import {
  AbstractProviderAdapter,
  AdapterTypes,
  ContractValue,
  CowError,
  GenericContract,
  PrivateKey,
  TransactionParams,
  TransactionReceipt,
} from '@cowprotocol/sdk-common'
import { EthersV5Utils } from './EthersV5Utils'
import {
  EthersV5SignerAdapter,
  IntChainIdTypedDataV4Signer,
  TypedDataV3Signer,
  TypedDataVersionedSigner,
} from './EthersV5SignerAdapter'

type Abi = ConstructorParameters<typeof ethers.utils.Interface>[0]
type Interface = ethers.utils.Interface
type RpcProvider = ethers.providers.Provider

export interface EthersV5Types extends AdapterTypes {
  Abi: Abi
  Bytes: BytesLike
  ContractInterface: Interface
  Provider: RpcProvider
  Signer: ethers.Signer
}
export interface EthersV5AdapterOptions {
  provider: RpcProvider | string // RPC URL or Provider instance
  signer?: ethers.Signer | PrivateKey // Optional signer or private key
}

export class EthersV5Adapter extends AbstractProviderAdapter<EthersV5Types> {
  private _provider: RpcProvider
  private _signerAdapter?: EthersV5SignerAdapter

  public utils: EthersV5Utils
  public TypedDataVersionedSigner = TypedDataVersionedSigner
  public TypedDataV3Signer = TypedDataV3Signer
  public IntChainIdTypedDataV4Signer = IntChainIdTypedDataV4Signer

  constructor(options: EthersV5AdapterOptions) {
    super()
    this.ZERO_ADDRESS = ethers.constants.AddressZero

    this._provider = this.setProvider(
      typeof options.provider === 'string' ? new ethers.providers.JsonRpcProvider(options.provider) : options.provider,
    )

    if (options.signer) {
      this._signerAdapter = this.createSigner(options.signer)
    }

    this.utils = new EthersV5Utils()
  }

  get signer(): EthersV5SignerAdapter {
    if (!this._signerAdapter) {
      throw new CowError('No signer provided, use setSigner to create a signer')
    }
    return this._signerAdapter
  }

  signerOrNull(): EthersV5SignerAdapter | null {
    return this._signerAdapter || null
  }

  setSigner(signer: ethers.Signer | PrivateKey) {
    this._signerAdapter = this.createSigner(signer)
  }

  setProvider(provider: RpcProvider): RpcProvider {
    this._provider = provider

    this.signerOrNull()?.connect(this._provider)

    return this._provider
  }

  createSigner(signerOrPrivateKey: ethers.Signer | PrivateKey | EthersV5SignerAdapter): EthersV5SignerAdapter {
    if (signerOrPrivateKey instanceof EthersV5SignerAdapter) {
      signerOrPrivateKey.connect(this._provider)

      return signerOrPrivateKey
    }

    if (typeof signerOrPrivateKey === 'string') {
      const wallet = new ethers.Wallet(signerOrPrivateKey, this._provider)

      return new EthersV5SignerAdapter(wallet.connect(this._provider))
    }

    return new EthersV5SignerAdapter(
      // Important: do not call .connect() when signer already has a provider
      // otherwise it will throw "cannot alter JSON-RPC Signer connection"
      (signerOrPrivateKey.provider ? signerOrPrivateKey : signerOrPrivateKey.connect(this._provider)) as ethers.Signer &
        TypedDataSigner,
    )
  }

  async getChainId(): Promise<number> {
    return (await this._provider.getNetwork()).chainId
  }

  async getCode(address: string): Promise<string> {
    return this._provider.getCode(address)
  }

  async getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt> {
    const receipt = await this._provider.getTransactionReceipt(transactionHash)

    return {
      ...receipt,
      gasUsed: receipt.gasUsed.toBigInt(),
      blockNumber: BigInt(receipt.blockNumber),
      logs: receipt.logs.map((log) => ({ ...log, blockNumber: BigInt(log.blockNumber) })),
    } as TransactionReceipt
  }

  async getStorageAt(address: string, slot: BigNumberish): Promise<BytesLike> {
    return this._provider.getStorageAt(address, slot)
  }

  async call(txParams: TransactionParams, provider?: RpcProvider): Promise<string> {
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
    provider?: RpcProvider,
  ): Promise<unknown> {
    const { address, abi, functionName, args = [] } = params
    const providerToUse = provider || this._provider
    const contract = new ethers.Contract(address, abi, providerToUse)

    if (!contract.callStatic?.[functionName])
      throw new CowError(`Error reading contract ${address}: function ${functionName} was not found in Abi`)

    return contract.callStatic[functionName](...args)
  }

  async getBlock(blockTag: string, provider?: ethers.providers.JsonRpcProvider) {
    const providerToUse = provider || this._provider
    return await providerToUse.getBlock(blockTag)
  }

  getContract(address: string, abi: Abi): GenericContract {
    return new ethers.Contract(address, abi, this._provider) as unknown as GenericContract
  }
}
