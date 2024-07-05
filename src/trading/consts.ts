import { EcdsaSigningScheme, SigningScheme } from '../order-book'

export const log = (text: string) => console.log(`[COW TRADING SDK] ${text}`)

export const DEFAULT_QUOTE_VALIDITY = 60 * 10 // 10 min

export const SIGN_SCHEME_MAP = {
  [EcdsaSigningScheme.EIP712]: SigningScheme.EIP712,
  [EcdsaSigningScheme.ETHSIGN]: SigningScheme.ETHSIGN,
}
