export * from '../api/cow/types'
export * from '../api/metadata/types'
export { OrderKind } from '@cowprotocol/contracts'
export class Token {
  constructor(public symbol: string, public address: string) {}
}

export type WithEnabled = {
  enabled?: boolean
}
export type WithDecimals = {
  fromDecimals: number
  toDecimals: number
}

export type WithChainId = {
  chainId: number
}
