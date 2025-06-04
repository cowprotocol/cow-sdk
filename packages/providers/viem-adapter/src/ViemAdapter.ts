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

import { AdapterTypes, AbstractProviderAdapter, TransactionParams } from '@cowprotocol/sdk-common'

export interface ViemTypes extends AdapterTypes {
  Bytes: `0x${string}`
}
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

export class ViemAdapter extends AbstractProviderAdapter<ViemTypes> {
  declare protected _type?: ViemTypes
  private publicClient: PublicClient
  private account?: Account
  private walletClient: WalletClient
  public utils: ViemUtils
  public Signer = ViemSignerAdapter
  public TypedDataVersionedSigner = TypedDataVersionedSigner
  public TypedDataV3Signer = TypedDataV3Signer
  public IntChainIdTypedDataV4Signer = IntChainIdTypedDataV4Signer

  constructor(chain: Chain, transport: Transport = http(), account?: Account | `0x${string}`) {
    super()
    this.ZERO_ADDRESS = zeroAddress
    this.publicClient = createPublicClient({
      chain,
      transport,
    })

    this.walletClient = createWalletClient({
      chain,
      transport,
    })

    if (account) {
      this.account = typeof account === 'string' ? ({ address: account } as Account) : account
    }

    this.utils = new ViemUtils()
  }

  async getChainId(): Promise<number> {
    return this.publicClient.chain?.id ?? 0
  }

  async getAddress(): Promise<string> {
    if (!this.account) {
      throw new Error('No account provided')
    }
    return this.account.address
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    if (!this.account) {
      throw new Error('No account provided')
    }

    const messageToSign = typeof message === 'string' ? message : new TextDecoder().decode(message)

    return this.walletClient.signMessage({
      account: this.account,
      message: messageToSign,
    })
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, unknown>,
    value: Record<string, unknown>,
  ): Promise<string> {
    if (!this.account) {
      throw new Error('No account provided')
    }

    const primaryType = Object.keys(types)[0]
    if (!primaryType) {
      throw new Error('No primary type found in types')
    }

    return this.walletClient.signTypedData({
      account: this.account,
      domain,
      types,
      primaryType,
      message: value,
    })
  }

  async getStorageAt(address: Address, slot: `0x${string}`) {
    return this.publicClient.getStorageAt({
      address,
      slot,
    })
  }

  async call(txParams: TransactionParams, provider?: PublicClient): Promise<string> {
    const providerToUse = provider || this.publicClient
    const result = await providerToUse.call({
      account: this.account?.address,
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
    const providerToUse = provider || this.publicClient
    return providerToUse.readContract({
      address: params.address as Address,
      abi: params.abi,
      functionName: params.functionName,
      args: params?.args,
    })
  }

  async getBlock(blockTag: BlockTag, provider?: PublicClient): Promise<Block> {
    const providerToUse = provider || this.publicClient
    const block = await providerToUse.getBlock({ blockTag })
    return block
  }
}
