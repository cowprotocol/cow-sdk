import { Log, Signer, TypedDataDomain, TypedDataField, TypedDataEncoder, JsonRpcProvider } from 'ethers'
import { AbstractSigner, TransactionParams, TransactionResponse } from '@cowprotocol/sdk-common'

export class EthersV6SignerAdapter extends AbstractSigner {
  private _signer: Signer

  constructor(signer: Signer) {
    super()
    this._signer = signer
  }

  async getAddress(): Promise<string> {
    return await this._signer.getAddress()
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    return await this._signer.signMessage(message)
  }

  async signTransaction(txParams: TransactionParams): Promise<string> {
    return await this._signer.signTransaction(this._formatTxParams(txParams))
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, unknown>,
  ): Promise<string> {
    return await this._signer.signTypedData(domain, types, value)
  }

  async sendTransaction(txParams: TransactionParams): Promise<TransactionResponse> {
    const tx = await this._signer.sendTransaction(this._formatTxParams(txParams))
    return {
      hash: tx.hash,
      wait: async (confirmations?: number) => {
        if (confirmations === null) throw new Error('unexpected')
        const receipt = await tx.wait(confirmations)
        if (!receipt) {
          throw new Error('Transaction failed')
        }
        return {
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          blockHash: receipt.blockHash || '',
          status: receipt.status || 0,
          gasUsed: receipt.gasUsed,
          logs: receipt.logs as Log[],
        }
      },
    }
  }

  private _formatTxParams(txParams: TransactionParams) {
    // No need to convert bigint in ethers v6, as it's natively supported
    return { ...txParams }
  }
}

export class TypedDataVersionedSigner extends EthersV6SignerAdapter {
  private _signMethod: string
  private signer: Signer
  private provider: JsonRpcProvider

  constructor(signer: Signer, version?: 'v3' | 'v4') {
    super(signer)
    const versionSuffix = version ? '_' + version : ''
    this._signMethod = 'eth_signTypedData' + versionSuffix
    this.signer = signer

    if (!signer.provider) throw new Error('Signer must be connected to a provider')

    this.provider = signer.provider as JsonRpcProvider
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, unknown>,
  ): Promise<string> {
    const populated = await TypedDataEncoder.resolveNames(domain, types, value, (name: string) =>
      this.resolveName(name),
    )

    const payload = TypedDataEncoder.getPayload(populated.domain, types, populated.value)
    const msg = JSON.stringify(payload)
    const address = await this.getAddress()

    if (!this.provider) {
      throw new Error('Provider is not set')
    }

    return await this.provider.send(this._signMethod, [address.toLowerCase(), msg])
  }

  private async resolveName(name: string): Promise<string> {
    if (this.signer.resolveName) {
      return (await this.signer.resolveName(name)) ?? ''
    }
    return name
  }
}

/**
 * Wrapper around a TypedDataSigner Signer object that implements `_signTypedData` using
 * `eth_signTypedData_v3` instead of `eth_signTypedData_v4`.
 *
 * Takes a Signer instance on creation.
 * All other Signer methods are proxied to initial instance.
 */
export class TypedDataV3Signer extends TypedDataVersionedSigner {
  constructor(signer: Signer) {
    super(signer, 'v3')
  }
}

export class IntChainIdTypedDataV4Signer extends EthersV6SignerAdapter {
  private signer: Signer
  private provider: JsonRpcProvider
  _isSigner = true

  constructor(signer: Signer) {
    super(signer)
    this.signer = signer
    if (!signer.provider) throw new Error('Signer must be connected to a provider')

    this.provider = signer.provider as JsonRpcProvider
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, unknown>,
  ): Promise<string> {
    const populated = await TypedDataEncoder.resolveNames(domain, types, value, (name: string) =>
      this.resolveName(name),
    )

    const payload = TypedDataEncoder.getPayload(populated.domain, types, populated.value)

    // Fix MetaMask chainId issue - convert to number
    if (payload.domain.chainId) {
      payload.domain.chainId = parseInt(payload.domain.chainId.toString(), 10)
    }

    const msg = JSON.stringify(payload)
    const address = await this.getAddress()

    if (!this.provider) {
      throw new Error('Provider is not set')
    }

    return await this.provider.send('eth_signTypedData_v4', [address.toLowerCase(), msg])
  }

  private async resolveName(name: string): Promise<string> {
    if (this.signer.resolveName) {
      return (await this.signer.resolveName(name)) ?? ''
    }
    return name
  }
}
