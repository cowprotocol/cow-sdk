export * from './AdapterUtils'
export * from './constants'
export * from './wallets'
export * from './ContractFactory'
export * from './ContractTypes'

export type Abi = unknown

export type Address = string

export type BigIntish = string | number | bigint

export type Bytes = unknown

export type ContractInterface = unknown

export interface TypedDataDomain {
  name?: string
  version?: string
  chainId?: number
  verifyingContract?: string
  salt?: string | Uint8Array // Flexible for different formats
}

export type TypedDataTypes = Record<string, Array<{ name: string; type: string }>>

export interface TypedDataContext {
  domain: TypedDataDomain
  types: TypedDataTypes
  message: Record<string, unknown>
}

export interface Provider {
  getStorageAt?: (...args: any[]) => unknown
  getStorage?: (...args: any[]) => unknown
}

export type Signer = unknown

export type SignatureLike = unknown

export type AdapterTypes = {
  Abi: Abi
  Bytes: Bytes
  ContractInterface: ContractInterface
  Provider: Provider
  Signer: Signer
  SignatureLike: SignatureLike
}

/**
 * Standardized transaction response
 */
export interface TransactionResponse {
  hash: string
  wait(confirmations?: number): Promise<TransactionReceipt>
}

export interface Log {
  blockNumber: bigint
  blockHash: string
  transactionIndex: number
  removed: boolean
  address: string
  data: string
  topics: readonly string[]
  transactionHash: string
  logIndex: number
}

/**
 * Standardized transaction receipt
 */
export interface TransactionReceipt {
  from: string
  to: string
  transactionHash: string
  blockNumber: bigint
  blockHash: string
  status?: number
  gasUsed: bigint
  logs: Log[]
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

export type ReadContractParams = {
  address: string
  abi: Abi
  functionName: string
  args?: unknown[]
}

export interface Block {
  hash: string | null
  parentHash: string
  number: number | bigint | null
  timestamp: number | bigint
  nonce: string | null
  difficulty: number | bigint
  gasLimit: any
  gasUsed: any
  miner: string
  extraData: string
  transactions: readonly string[] | string[] | any[] // Can be hashes or full transaction objects
}

export type ContractValue = string | number | boolean | bigint | Record<string, string | number | boolean | bigint>

export type ParamType = {
  type?: string
  name?: string
  baseType?: string
  arrayLength?: number | null
  components?: ReadonlyArray<ParamType> | null
  [key: string]: unknown
}
