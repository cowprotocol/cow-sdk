import { ACROSS_DEPOSIT_EVENT_INTERFACE, COW_TRADE_EVENT_INTERFACE } from './interfaces'

export const HOOK_DAPP_BRIDGE_PROVIDER_PREFIX = 'cow-sdk://bridging/providers'

export const ACROSS_DEPOSIT_EVENT_TOPIC = ACROSS_DEPOSIT_EVENT_INTERFACE.getEventTopic('FundsDeposited')

export const COW_TRADE_EVENT_TOPIC = COW_TRADE_EVENT_INTERFACE.getEventTopic('Trade')
