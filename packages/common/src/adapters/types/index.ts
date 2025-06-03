export * from './AdapterUtils'
export * from './constants'
export * from './wallets'

export type Abi = unknown

export type Address = string

export type BigIntish = unknown

export type Bytes = unknown

export type ContractInterface = unknown

export type TypedDataDomain = unknown

export type TypedDataTypes = unknown

export interface Provider {
  getStorageAt?: (...args: any[]) => unknown
  getStorage?: (...args: any[]) => unknown
}

export type Signer = unknown

export type SignatureLike = unknown

export type AdapterTypes = {
  Abi: Abi
  Address: Address
  BigIntish: BigIntish
  Bytes: Bytes
  ContractInterface: ContractInterface
  Provider: Provider
  Signer: Signer
  SignatureLike: SignatureLike
  TypedDataDomain: TypedDataDomain
  TypedDataTypes: TypedDataTypes
}

/**
 * Standardized transaction response
 */
export interface TransactionResponse {
  hash: string
  wait(confirmations?: number): Promise<TransactionReceipt>
}

/**
 * Standardized transaction receipt
 */
export interface TransactionReceipt {
  transactionHash: string
  blockNumber: number
  blockHash: string
  status?: number
  gasUsed: bigint
  logs: Array<unknown>
}

/**
 * Standard transaction parameters that work across different Ethereum libraries
 */
export interface TransactionParams {
  to: string
  from?: string
  data?: string
  value?: string | bigint
  gasLimit?: string | bigint
  gasPrice?: string | bigint
  maxFeePerGas?: string | bigint
  maxPriorityFeePerGas?: string | bigint
  nonce?: number
}
