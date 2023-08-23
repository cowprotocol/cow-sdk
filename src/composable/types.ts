import { GPv2Order } from './generated/ComposableCoW'

export interface ConditionalOrderArguments<P> {
  handler: string
  staticInput: P
  salt?: string
  hasOffChainInput?: boolean
}

export type ConditionalOrderParams = {
  readonly handler: string
  readonly salt: string
  readonly staticInput: string
}

export enum ProofLocation {
  // The location of the proofs is private to the caller.
  PRIVATE = 0,
  // The `data` field of the emitted `Proof` struct contains proofs + conditional order parameters.
  EMITTED = 1,
  // The `data` field of the emitted `Proof` struct contains the Swarm address (`bytes32`) of the proofs + conditional order parameters.
  SWARM = 2,
  // The `data` field is set to TBD.
  WAKU = 3,
  // The `data` field is set to TBD
  RESERVED = 4,
  // The `data` field of the emitted `Proof` struct contains the IPFS address (`bytes32`) of the proofs + conditional order parameters.
  IPFS = 5,
}

/**
 * A factory and it's arguments that are called at transaction mining time to generate the context
 * for a conditional order(s).
 *
 * This allows to support the case where conditional orders may want to *commence* validity at the
 * time of transaction mining, like in the case of a `TWAP` executed by a DAO or `Safe` that takes
 * a reasonable amount of time to aggregate signatures or collect votes.
 *
 * @remarks This is used in conjunction with `setRootWithContext` or `createWithContext`.
 */
export type ContextFactory = {
  // The address of the `IValueFactory` that will be used to resolve the context.
  address: string
  // Any arguments that will be passed to the `IValueFactory` to resolve the context.
  factoryArgs?: {
    args: any[]
    argsType: string[]
  }
}

/**
 * A struct for a proof that can be used with `setRoot` and `setRootWithContext` on a
 * ComposableCoW-enabled Safe.
 */
export type ProofStruct = {
  // The location of the proof.
  location: ProofLocation
  // The data for the proof.
  data: string | '0x'
}

/**
 * Payload for emitting a merkle root to a ComposableCoW-enabled Safe.
 *
 * If setting `ProofLocation.EMITTED`, this type should be used as the `data` in the `Proof` struct.
 */
export type PayloadLocationEmitted = {
  // An array of conditional orders and their proofs.
  proofs: ProofWithParams[]
}

/**
 * A proof for a conditional order and it's parameters.
 */
export type ProofWithParams = {
  // The proof for the Merkle tree that contains the conditional order.
  proof: string[]
  // The parameters as expected by ABI encoding.
  params: ConditionalOrderParams
}

export type PollResult =
  | PollResultSuccess
  | PollResultTryNextBlock
  | PollResultTryAtDate
  | PollResultUnexpectedError
  | PollResultDontTryAgain

export enum PollResultCode {
  SUCCESS = 'SUCCESS',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  TRY_NEXT_BLOCK = 'TRY_NEXT_BLOCK',
  TRY_ON_BLOCK = 'TRY_ON_BLOCK',
  TRY_AT_DATE = 'TRY_AT_DATE',
  DONT_TRY_AGAIN = 'DONT_TRY_AGAIN',
}
export interface PollResultSuccess {
  readonly result: PollResultCode.SUCCESS
  readonly order: GPv2Order.DataStructOutput
  readonly signature: string
}

export interface PollResultUnexpectedError {
  readonly result: PollResultCode.UNEXPECTED_ERROR
  readonly error: any
}

export interface PollResultTryNextBlock {
  readonly result: PollResultCode.TRY_NEXT_BLOCK
  reason?: string
}

export interface PollResultTryAtDate {
  readonly result: PollResultCode.TRY_AT_DATE
  readonly date: Date
  reason?: string
}

export interface PollResultDontTryAgain {
  readonly result: PollResultCode.DONT_TRY_AGAIN
  reason?: string
}

export type IsValidResult = IsValid | IsNotValid
export interface IsValid {
  isValid: true
}
export interface IsNotValid {
  isValid: false
  reason: string
}
