import { AbstractSigner } from '../AbstractSigner'

export type PrivateKey = string // 64 characters
export type AccountAddress = `0x${string}` // 42 characters

/**
 * Generic signer-like type that can be adapted to different libraries
 */
export type SignerLike = PrivateKey | AbstractSigner
