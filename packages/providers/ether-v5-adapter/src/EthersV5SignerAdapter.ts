import { Signer, BigNumber, TypedDataDomain, TypedDataField, ethers } from 'ethers'
import { AbstractSigner, TransactionParams, TransactionResponse } from '@cowprotocol/sdk-common'
import { TypedDataSigner } from '@ethersproject/abstract-signer'

export class EthersV5SignerAdapter extends AbstractSigner {
  private _signer: Signer & TypedDataSigner

  constructor(signer: Signer & TypedDataSigner) {
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
    // Ethers v5 doesn't expose a direct signTransaction method on the Signer class
    // This is a workaround using a private method, but might not work for all signers
    if ('_signTransaction' in this._signer) {
      return await this._signer.signTransaction(this._formatTxParams(txParams))
    }
    throw new Error('signTransaction not supported by this ethers v5 signer')
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, unknown>,
  ): Promise<string> {
    return await this._signer._signTypedData(domain, types, value)
  }

  async sendTransaction(txParams: TransactionParams): Promise<TransactionResponse> {
    const tx = await this._signer.sendTransaction(this._formatTxParams(txParams))
    return {
      hash: tx.hash,
      wait: async (confirmations?: number) => {
        const receipt = await tx.wait(confirmations)
        return {
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          blockHash: receipt.blockHash,
          status: receipt.status,
          gasUsed: BigInt(receipt.gasUsed.toString()),
          logs: receipt.logs,
        }
      },
    }
  }

  private _formatTxParams(txParams: TransactionParams) {
    // Convert bigint values to BigNumber for ethers v5
    // eslint-disable-next-line
    const formatted: any = { ...txParams }

    if (typeof formatted.value === 'bigint') {
      formatted.value = BigNumber.from(formatted.value.toString())
    }

    if (typeof formatted.gasLimit === 'bigint') {
      formatted.gasLimit = BigNumber.from(formatted.gasLimit.toString())
    }

    if (typeof formatted.gasPrice === 'bigint') {
      formatted.gasPrice = BigNumber.from(formatted.gasPrice.toString())
    }

    if (typeof formatted.maxFeePerGas === 'bigint') {
      formatted.maxFeePerGas = BigNumber.from(formatted.maxFeePerGas.toString())
    }

    if (typeof formatted.maxPriorityFeePerGas === 'bigint') {
      formatted.maxPriorityFeePerGas = BigNumber.from(formatted.maxPriorityFeePerGas.toString())
    }

    return formatted
  }
}

import { _TypedDataEncoder } from 'ethers/lib/utils'

export class TypedDataVersionedSigner extends EthersV5SignerAdapter {
  private _signMethod: string
  private signer: ethers.Signer
  private provider: ethers.providers.JsonRpcProvider

  constructor(signer: Signer & TypedDataSigner, version: 'v3' | 'v4' = 'v3') {
    super(signer)
    const versionSuffix = version ? '_' + version : ''
    this._signMethod = 'eth_signTypedData' + versionSuffix
    this.signer = signer

    if (!signer.provider) {
      throw new Error('Signer does not have a provider set')
    }
    if (!('send' in signer.provider)) {
      throw new Error('Provider must be of type JsonRpcProvider')
    }

    this.provider = signer.provider as ethers.providers.JsonRpcProvider
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, unknown>,
  ): Promise<string> {
    const populated = await _TypedDataEncoder.resolveNames(domain, types, value, (name: string) =>
      this.resolveName(name),
    )

    const payload = _TypedDataEncoder.getPayload(populated.domain, types, populated.value)
    const msg = JSON.stringify(payload)
    const address = await this.getAddress()

    // Use the provider from the underlying signer
    if (!this.provider) {
      throw new Error('Signer does not have a provider set')
    }

    return await this.provider.send(this._signMethod, [address.toLowerCase(), msg])
  }

  private async resolveName(name: string): Promise<string> {
    // Delegate to the underlying signer's resolveName if available
    if (this.signer.resolveName) {
      return await this.signer.resolveName(name)
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
  constructor(signer: Signer & TypedDataSigner) {
    super(signer, 'v3')
  }
}

export class IntChainIdTypedDataV4Signer extends EthersV5SignerAdapter {
  private signer: ethers.Signer & TypedDataSigner
  private provider: ethers.providers.JsonRpcProvider
  _isSigner = true

  constructor(signer: Signer & TypedDataSigner) {
    super(signer)
    this.signer = signer

    if (!signer.provider) {
      throw new Error('Signer does not have a provider set')
    }
    if (!('send' in signer.provider)) {
      throw new Error('Provider must be of type JsonRpcProvider')
    }

    this.provider = signer.provider as ethers.providers.JsonRpcProvider
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, unknown>,
  ): Promise<string> {
    const populated = await _TypedDataEncoder.resolveNames(domain, types, value, (name: string) =>
      this.resolveName(name),
    )

    const payload = _TypedDataEncoder.getPayload(populated.domain, types, populated.value)

    // Fix MetaMask chainId issue - convert to number
    if (payload.domain.chainId) {
      payload.domain.chainId = parseInt(payload.domain.chainId.toString(), 10)
    }

    const msg = JSON.stringify(payload)
    const address = await this.getAddress()

    if (!this.signer.provider) {
      throw new Error('Signer does not have a provider set')
    }

    return await this.provider.send('eth_signTypedData_v4', [address.toLowerCase(), msg])
  }

  private async resolveName(name: string): Promise<string> {
    if (this.signer.resolveName) {
      return await this.signer.resolveName(name)
    }
    return name
  }
}
