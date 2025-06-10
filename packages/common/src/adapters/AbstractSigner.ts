import { TransactionParams, TransactionResponse } from './types'

/**
 * AbstractSignerAdapter defines the minimal interface that all signer-specific
 * implementations must follow, focusing only on signing operations.
 */
export abstract class AbstractSigner {
  abstract getAddress(): Promise<string>
  abstract signMessage(message: string | Uint8Array): Promise<string>
  abstract signTransaction(txParams: TransactionParams): Promise<string>
  abstract signTypedData(domain: unknown, types: unknown, value: Record<string, unknown>): Promise<string>
  abstract sendTransaction(txParams: TransactionParams): Promise<TransactionResponse>
}
