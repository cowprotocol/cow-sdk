import { EvmCall } from '../../../common'
import { CowShedSdk } from '../../../cow-shed'
import { BungeeQuoteResult } from './BungeeBridgeProvider'
import { QuoteBridgeRequest } from '../../types'

export function createBungeeDepositCall(params: {
  request: QuoteBridgeRequest
  quote: BungeeQuoteResult
  cowShedSdk: CowShedSdk
}): EvmCall {
  // TODO implement
  throw new Error('TODO implement')
}
