import {
  createPublicClient,
  http,
  PublicClient,
  Account,
  Transport,
  Chain,
  TypedDataDomain,
  WalletClient,
  createWalletClient,
  Address,
  Abi,
  zeroAddress,
  Block,
  BlockTag,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import {
  AdapterTypes,
  AbstractProviderAdapter,
  TransactionParams,
  PrivateKey,
  CowError,
  normalizePrivateKey,
} from '@cowprotocol/sdk-common'

import { ViemUtils } from './ViemUtils'
import {
  IntChainIdTypedDataV4Signer,
  TypedDataV3Signer,
  TypedDataVersionedSigner,
  ViemSignerAdapter,
} from './ViemSignerAdapter'

export interface ViemTypes extends AdapterTypes {
  Abi: Abi
  Address: Address
  Bytes: `0x${string}`
  BigIntish: bigint
  ContractInterface: unknown
  Provider: PublicClient
  Signer: WalletClient
  TypedDataDomain: TypedDataDomain
  TypedDataTypes: Record<string, unknown>
}

export interface ViemAdapterOptions {
  chain: Chain
  transport?: Transport // Optional, defaults to http()
  rpcUrl?: string // Alternative to transport
  account?: Account | PrivateKey // Optional account or private key
}

export class ViemAdapter extends AbstractProviderAdapter<ViemTypes> {
  declare protected _type?: ViemTypes

  private _chain: Chain
  private _transport: Transport
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
    if (!options.chain) {
      throw new CowError('Chain is required for Viem adapter')
    }

    this._chain = options.chain
    // Setup transport
    if (options.transport) {
      this._transport = options.transport
    } else if (options.rpcUrl) {
      this._transport = http(options.rpcUrl)
    } else if (options.chain.rpcUrls?.default?.http?.[0]) {
      this._transport = http(options.chain.rpcUrls.default.http[0])
    } else {
      this._transport = http()
    }
    // Setup public client
    this._publicClient = createPublicClient({
      chain: options.chain,
      transport: this._transport,
    })

    // Setup account and signer
    if (options.account) {
      if (typeof options.account === 'string') {
        const normalizedPrivateKey = normalizePrivateKey(options.account)
        this._account = privateKeyToAccount(normalizedPrivateKey)
      } else {
        this._account = options.account
      }

      this._walletClient = createWalletClient({
        chain: options.chain,
        transport: this._transport,
        account: this._account,
      })
      this._signerAdapter = new ViemSignerAdapter(this._walletClient)
      this._signerAdapter.setPublicClient(this._publicClient)
    }

    this.utils = new ViemUtils()
  }

  get signer(): ViemSignerAdapter {
    if (!this._signerAdapter) {
      throw new CowError('No signer provided, use setSigner to create a signer')
    }
    return this._signerAdapter
  }

  setSigner(signer: Account | PrivateKey) {
    if (typeof signer === 'string') {
      const normalizedPrivateKey = normalizePrivateKey(signer)
      this._account = privateKeyToAccount(normalizedPrivateKey)
    }
    if (this.isAccount(signer)) {
      this._account = signer as Account
    }

    this._walletClient = createWalletClient({
      chain: this._chain,
      transport: this._transport,
      account: this._account,
    })

    this._signerAdapter = this.createSigner(this._walletClient)
  }

  createSigner(signerOrPrivateKey: WalletClient | PrivateKey | ViemSignerAdapter): ViemSignerAdapter {
    if (signerOrPrivateKey instanceof ViemSignerAdapter) {
      return signerOrPrivateKey
    }

    if (typeof signerOrPrivateKey === 'string') {
      const normalizedPrivateKey = normalizePrivateKey(signerOrPrivateKey)
      const account = privateKeyToAccount(normalizedPrivateKey)
      const walletClient = createWalletClient({
        chain: this._chain,
        transport: this._transport,
        account: account,
      })
      const signerAdapter = new ViemSignerAdapter(walletClient)
      signerAdapter.setPublicClient(this._publicClient)
      return signerAdapter
    }

    const signerAdapter = new ViemSignerAdapter(signerOrPrivateKey)
    signerAdapter.setPublicClient(this._publicClient)
    return signerAdapter
  }

  async getChainId(): Promise<number> {
    return this._publicClient.chain?.id ?? 0
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
      args?: unknown[]
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
    const block = await providerToUse.getBlock({ blockTag })
    return block
  }

  private isAccount(signer: unknown): signer is Account {
    return (
      typeof signer === 'object' &&
      signer !== null &&
      'address' in signer &&
      'type' in signer &&
      typeof (signer as any).address === 'string' &&
      typeof (signer as any).type === 'string'
    )
  }
}
