import { Provider, Signer, VoidSigner, JsonRpcSigner, Wallet, BytesLike } from 'ethers'
import { AbstractProviderAdapter, AdapterTypes } from '@cowprotocol/sdk-common'

export interface EthersV6Types extends AdapterTypes {
  Bytes: BytesLike
}
import { EthersV6Utils } from './EthersV6Utils'

export class EthersV6Adapter extends AbstractProviderAdapter<EthersV6Types> {
  declare protected _type?: EthersV6Types

  private provider: Provider
  private signer: Signer
  public utils: EthersV6Utils

  constructor(providerOrSigner: Provider | Signer) {
    super()
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
}
