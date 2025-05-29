import { Signer } from 'ethers'
import type { ExternalProvider } from '@ethersproject/providers'

export type PrivateKey = string // 64 characters
export type AccountAddress = `0x${string}` // 42 characters
export type SignerLike = Signer | ExternalProvider | PrivateKey
