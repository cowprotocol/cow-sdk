import { Account, WalletClient, PublicClient, Address, TypedDataDomain, TypedDataParameter } from 'viem'
import { AbstractSigner, TransactionParams, TransactionResponse } from '@cowprotocol/sdk-common'

export class ViemSignerAdapter extends AbstractSigner {
  protected _client: WalletClient
  protected _account: Account
  protected _publicClient?: PublicClient

  constructor(client: WalletClient) {
    super()
    this._client = client
    if (!client?.account) throw new Error('Signer is missing account')
    this._account = client.account
  }

  async getAddress(): Promise<string> {
    return this._account.address
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    if (typeof message === 'string') {
      return await this._client.signMessage({
        account: this._account,
        message,
      })
    } else {
      return await this._client.signMessage({
        account: this._account,
        message: { raw: message },
      })
    }
  }

  async signTransaction(txParams: TransactionParams): Promise<string> {
    const formattedTx = this._formatTxParams(txParams)

    return await this._client.signTransaction({
      account: this._account,
      ...formattedTx,
    })
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataParameter>,
    value: Record<string, unknown>,
  ): Promise<string> {
    const primaryType = Object.keys(types)[0]

    if (!primaryType) throw new Error('Missing primary type')

    return await this._client.signTypedData({
      account: this._account,
      domain,
      types,
      primaryType, // Primary type is usually the first key in types
      message: value,
    })
  }

  async sendTransaction(txParams: TransactionParams): Promise<TransactionResponse> {
    const formattedTx = this._formatTxParams(txParams)

    const hash = await this._client.sendTransaction({
      account: this._account,
      ...formattedTx,
    })

    return {
      hash,
      wait: async (confirmations?: number) => {
        if (!this._publicClient) {
          throw new Error('Cannot wait for transaction without a public client')
        }

        const receipt = await this._publicClient.waitForTransactionReceipt({
          hash,
          confirmations,
        })

        return {
          transactionHash: receipt.transactionHash,
          blockNumber: Number(receipt.blockNumber),
          blockHash: receipt.blockHash,
          status: Number(receipt.status === 'success'),
          gasUsed: receipt.gasUsed,
          logs: receipt.logs,
        }
      },
    }
  }

  private _formatTxParams(txParams: TransactionParams) {
    // Convert to viem-specific format
    const formatted: any = { ...txParams }

    // Convert string addresses to Address type
    if (formatted.to) {
      formatted.to = formatted.to as Address
    }

    if (formatted.from) {
      formatted.from = formatted.from as Address
    }

    // Ensure gas fields use the correct naming
    if (formatted.gasLimit !== undefined) {
      formatted.gas = formatted.gasLimit
      delete formatted.gasLimit
    }

    return formatted
  }
}

/**
 * Base class for versioned typed data signers
 * Provides common functionality for different EIP-712 typed data versions
 */
export class TypedDataVersionedSigner extends ViemSignerAdapter {
  protected getTypedDataVersion(): string {
    return 'v4' // Default to v4
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataParameter>,
    value: Record<string, unknown>,
  ): Promise<string> {
    // Override domain version if needed
    const modifiedDomain = this.modifyDomain(domain)
    return super.signTypedData(modifiedDomain, types, value)
  }

  protected modifyDomain(domain: TypedDataDomain): TypedDataDomain {
    // Default implementation - subclasses can override
    return domain
  }
}

/**
 * Signer for EIP-712 typed data version 3
 * Handles legacy typed data signing for older protocols
 */
export class TypedDataV3Signer extends TypedDataVersionedSigner {
  protected getTypedDataVersion(): string {
    return 'v3'
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataParameter>,
    value: Record<string, unknown>,
  ): Promise<string> {
    // For V3, we might need to handle domain differently
    // Remove any fields that aren't supported in V3
    const v3Domain: TypedDataDomain = {
      name: domain.name,
      version: domain.version,
      chainId: domain.chainId,
      verifyingContract: domain.verifyingContract,
      // V3 typically doesn't support salt
    }

    return super.signTypedData(v3Domain, types, value)
  }
}

/**
 * Signer for EIP-712 typed data version 4 with integer chain ID handling
 * Ensures chain ID is properly formatted as an integer for compatibility
 */
export class IntChainIdTypedDataV4Signer extends TypedDataVersionedSigner {
  protected getTypedDataVersion(): string {
    return 'v4'
  }

  protected modifyDomain(domain: TypedDataDomain): TypedDataDomain {
    // Ensure chainId is an integer for V4 compatibility
    let chainId = domain.chainId

    if (typeof chainId === 'string') {
      chainId = parseInt(chainId, 10)
    } else if (typeof chainId === 'bigint') {
      chainId = Number(chainId)
    }

    return {
      ...domain,
      chainId,
    }
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataParameter>,
    value: Record<string, unknown>,
  ): Promise<string> {
    // Apply integer chain ID modification
    const modifiedDomain = this.modifyDomain(domain)

    // Use viem's native signTypedData which supports V4
    const primaryType = Object.keys(types)[0]
    if (!primaryType) throw new Error('Missing primary type')

    return await this._client.signTypedData({
      account: this._account,
      domain: modifiedDomain,
      types,
      primaryType,
      message: value,
    })
  }
}

/**
 * Factory function to create appropriate signer based on requirements
 */
export function createViemSigner(
  client: WalletClient,
  options?: {
    typedDataVersion?: 'v3' | 'v4' | 'v4-int-chainid'
    publicClient?: PublicClient
  },
): ViemSignerAdapter {
  const baseAdapter = new ViemSignerAdapter(client)

  // Set public client if provided
  if (options?.publicClient) {
    ;(baseAdapter as any)._publicClient = options.publicClient
  }

  // Return appropriate signer based on version
  if (options?.typedDataVersion === 'v3') {
    const signer = new TypedDataV3Signer(client)
    if (options.publicClient) {
      ;(signer as any)._publicClient = options.publicClient
    }
    return signer
  }

  if (options?.typedDataVersion === 'v4-int-chainid') {
    const signer = new IntChainIdTypedDataV4Signer(client)
    if (options.publicClient) {
      ;(signer as any)._publicClient = options.publicClient
    }
    return signer
  }

  return baseAdapter
}
