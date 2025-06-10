import { Signer } from '../'

export type PrivateKey = string // 64 characters
export type AccountAddress = `0x${string}` // 42 characters

/**
 * Generic external provider interface that works across different libraries
 */
export interface GenericExternalProvider {
  isMetaMask?: boolean
  isStatus?: boolean
  host?: string
  path?: string
  sendAsync?: (request: { method: string; params?: Array<any> }, callback: (error: any, response: any) => void) => void
  send?: (request: { method: string; params?: Array<any> }, callback: (error: any, response: any) => void) => void
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>
}

/**
 * Generic signer-like type that can be adapted to different libraries
 */
export type SignerLike = Signer | GenericExternalProvider | PrivateKey
