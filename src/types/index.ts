export * from '../api/cow/types'
export * from '../api/metadata/types'
export * from './sdk'
export { OrderKind } from '@cowprotocol/contracts'
export class Token {
  constructor(public symbol: string, public address: string) {}
}

export type WithEnabled = {
  enabled: boolean
}
