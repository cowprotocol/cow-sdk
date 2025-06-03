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
} from 'viem'

import { ViemUtils } from './ViemUtils'
import {
  IntChainIdTypedDataV4Signer,
  TypedDataV3Signer,
  TypedDataVersionedSigner,
  ViemSignerAdapter,
} from './ViemSignerAdapter'
import { AdapterTypes, AbstractProviderAdapter } from '@cowprotocol/sdk-common'

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
  private transport: Transport
  public utils: ViemUtils
  public Signer = ViemSignerAdapter
  public TypedDataVersionedSigner = TypedDataVersionedSigner
  public TypedDataV3Signer = TypedDataV3Signer
  public IntChainIdTypedDataV4Signer = IntChainIdTypedDataV4Signer

  constructor(chain: Chain, transport: Transport = http(), account?: Account | `0x${string}`) {
    super()
    this.ZERO_ADDRESS = zeroAddress
    this.transport = transport
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
}
