export * from '../api/cow/types'
export * from '../api/metadata/types'
export { OrderKind } from '@gnosis.pm/gp-v2-contracts'
export class Token {
  constructor(public symbol: string, public address: string) {}
}
