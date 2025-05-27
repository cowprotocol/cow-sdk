import { BigNumberish, BytesLike, ethers } from 'ethers'
import type { TypedDataDomain, TypedDataField, TypedDataSigner } from '@ethersproject/abstract-signer'
import { AbstractProviderAdapter, AdapterTypes } from '@cowprotocol/sdk-common'
import { EthersV5Utils } from './EthersV5Utils'

type Abi = ConstructorParameters<typeof ethers.utils.Interface>[0]
type Interface = ethers.utils.Interface

export interface EthersV5Types extends AdapterTypes {
  Bytes: BytesLike
}

export class EthersV5Adapter extends AbstractProviderAdapter<EthersV5Types> {
  declare protected _type?: EthersV5Types

  private provider: ethers.providers.Provider
  private signer: ethers.Signer & TypedDataSigner
  public utils: EthersV5Utils

  constructor(providerOrSigner: ethers.providers.Provider | ethers.Signer) {
    super()

    if (ethers.Signer.isSigner(providerOrSigner)) {
      this.signer = providerOrSigner as ethers.Signer & TypedDataSigner
      this.provider = providerOrSigner.provider as ethers.providers.Provider
      if (!this.provider) {
        throw new Error('Signer must be connected to a provider')
      }
    } else {
      this.provider = providerOrSigner
      this.signer = new ethers.VoidSigner(
        '0x0000000000000000000000000000000000000000',
        this.provider,
      ) as ethers.Signer & TypedDataSigner
    }

    this.utils = new EthersV5Utils()
  }

  async getChainId(): Promise<number> {
    return (await this.provider.getNetwork()).chainId
  }

  async getAddress(): Promise<string> {
    return this.signer.getAddress()
  }
}
