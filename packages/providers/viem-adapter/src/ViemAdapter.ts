import {
  PublicClient,
  Account,
  TypedDataDomain,
  WalletClient,
  createWalletClient,
  Address,
  Abi,
  zeroAddress,
  Block,
  BlockTag,
  getContract,
  encodeFunctionData,
  custom,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import {
  AdapterTypes,
  AbstractProviderAdapter,
  TransactionParams,
  PrivateKey,
  CowError,
  normalizePrivateKey,
  GenericContract,
  TransactionReceipt,
} from '@cowprotocol/sdk-common'

import { ViemUtils } from './ViemUtils'
import {
  IntChainIdTypedDataV4Signer,
  TypedDataV3Signer,
  TypedDataVersionedSigner,
  ViemSignerAdapter,
} from './ViemSignerAdapter'
import { Hash } from 'viem/types/misc'

export interface ViemTypes extends AdapterTypes {
  Abi: Abi
  Address: Address
  Bytes: `0x${string}`
  BigIntish: bigint
  ContractInterface: Abi
  Provider: PublicClient
  Signer: WalletClient
  TypedDataDomain: TypedDataDomain
  TypedDataTypes: Record<string, unknown>
}

export interface ViemAdapterOptions {
  provider: PublicClient
  signer?: Account | PrivateKey // Optional account or private key
}

export class ViemAdapter extends AbstractProviderAdapter<ViemTypes> {
  private _publicClient: PublicClient
  private _account?: Account
  private _walletClient?: WalletClient
  public utils: ViemUtils
  private _signerAdapter?: ViemSignerAdapter

  public TypedDataVersionedSigner = TypedDataVersionedSigner
  public TypedDataV3Signer = TypedDataV3Signer
  public IntChainIdTypedDataV4Signer = IntChainIdTypedDataV4Signer

  constructor(options: ViemAdapterOptions) {
    super()
    this.ZERO_ADDRESS = zeroAddress

    this._publicClient = this.setProvider(options.provider)

    if (options.signer) {
      this.setSigner(options.signer)
    }

    this.utils = new ViemUtils()
  }

  get signer(): ViemSignerAdapter {
    if (!this._signerAdapter) {
      throw new CowError('No signer provided, use setSigner to create a signer')
    }
    return this._signerAdapter
  }

  signerOrNull(): ViemSignerAdapter | null {
    return this._signerAdapter || null
  }

  setSigner(signer: Account | PrivateKey) {
    this._signerAdapter = this.createSigner(signer)
  }

  setProvider(provider: PublicClient): PublicClient {
    this._publicClient = provider

    this.signerOrNull()?.connect(this._publicClient)

    return this._publicClient
  }

  createSigner(signer: Account | PrivateKey | ViemSignerAdapter): ViemSignerAdapter {
    if (signer instanceof ViemSignerAdapter) {
      signer.connect(this._publicClient)

      return signer
    }

    if (typeof signer === 'string') {
      const normalizedPrivateKey = normalizePrivateKey(signer)
      this._account = privateKeyToAccount(normalizedPrivateKey)
    } else {
      this._account = signer
    }

    this._walletClient = createWalletClient({
      chain: this._publicClient.chain,
      transport: custom(this._publicClient.transport, this._publicClient.transport),
      account: this._account,
    })

    const signerAdapter = new ViemSignerAdapter(this._walletClient)
    signerAdapter.connect(this._publicClient)

    return signerAdapter
  }

  async getChainId(): Promise<number> {
    return this._publicClient.chain?.id ?? 0
  }

  async getCode(address: string): Promise<string | undefined> {
    return this._publicClient.getCode({ address: address as Address })
  }

  async getTransactionReceipt(hash: string): Promise<TransactionReceipt | null> {
    const receipt = await this._publicClient.getTransactionReceipt({ hash: hash as Hash })

    if (!receipt) return receipt

    return {
      ...receipt,
      status: receipt.status === 'success' ? 1 : 0,
    } as TransactionReceipt
  }

  async getStorageAt(address: Address, slot: `0x${string}`) {
    return this._publicClient.getStorageAt({
      address,
      slot,
    })
  }

  async call(txParams: TransactionParams, provider?: PublicClient): Promise<string> {
    const providerToUse = provider || this._publicClient
    const result = await providerToUse.call({
      account: this._account?.address,
      to: txParams.to as `0x${string}`,
      data: txParams.data as `0x${string}` | undefined,
      value: txParams.value ? BigInt(txParams.value.toString()) : undefined,
    })
    return result.toString()
  }

  async readContract(
    params: {
      address: string
      abi: Abi
      functionName: string
      args?: (string | number | boolean | bigint)[]
    },
    provider?: PublicClient,
  ): Promise<unknown> {
    const providerToUse = provider || this._publicClient
    return providerToUse.readContract({
      address: params.address as Address,
      abi: params.abi,
      functionName: params.functionName,
      args: params?.args,
    })
  }

  async getBlock(blockTag: BlockTag, provider?: PublicClient): Promise<Block> {
    const providerToUse = provider || this._publicClient
    return providerToUse.getBlock({ blockTag })
  }

  getContract(address: string, abi: Abi): GenericContract {
    const viemContract = getContract({
      address: address as `0x${string}`,
      abi,
      client: this._publicClient,
    })
    const compatibleInterface = this.utils.createInterface([...abi])

    // Create a compatible estimateGas object for viem
    const estimateGas: Record<string, (...args: any[]) => Promise<any>> = {}
    Object.keys(compatibleInterface.functions || {}).forEach((functionName) => {
      estimateGas[functionName] = async (args: any[] = []) => {
        try {
          const encodedData = encodeFunctionData({
            abi,
            functionName,
            args,
          })

          const gasEstimate = await this._publicClient.request({
            method: 'eth_estimateGas',
            params: [
              {
                to: address as `0x${string}`,
                data: encodedData,
                from: this._account?.address,
              },
            ],
          })

          return BigInt(gasEstimate as string)
        } catch (error) {
          throw new CowError(`Gas estimation failed for ${functionName}: ${error}`)
        }
      }
    })

    return {
      ...viemContract,
      interface: compatibleInterface,
      address: address,
      estimateGas,
      functions: (viemContract as any).functions || {},
      provider: this._publicClient,
    } as GenericContract
  }
}
