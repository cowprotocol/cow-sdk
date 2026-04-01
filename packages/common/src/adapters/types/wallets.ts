import { Signer } from '.'
import { EvmAddressKey } from '../../utils'

export type PrivateKey = string // 64 characters
export type AccountAddress = EvmAddressKey // 42 characters

/**
 * Generic signer-like type that can be adapted to different libraries
 */
export type SignerLike = PrivateKey | Signer
