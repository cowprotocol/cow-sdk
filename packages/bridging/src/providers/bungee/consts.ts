import { BungeeApiUrlOptions, SupportedBridge } from './types'

export const BUNGEE_BASE_URL = 'https://public-backend.bungee.exchange'
export const BUNGEE_API_URL = `${BUNGEE_BASE_URL}/api/v1/bungee`
export const BUNGEE_MANUAL_API_URL = `${BUNGEE_BASE_URL}/api/v1/bungee-manual`
export const BUNGEE_EVENTS_API_URL = 'https://microservices.socket.tech/loki'
export const ACROSS_API_URL = 'https://app.across.to/api'

export const SUPPORTED_BRIDGES: SupportedBridge[] = ['across', 'cctp', 'gnosis-native-bridge']

export const errorMessageMap = {
  bungee: 'Bungee Api Error',
  events: 'Bungee Events Api Error',
  across: 'Across Api Error',
  'bungee-manual': 'Bungee Manual Api Error',
}

export const DEFAULT_API_OPTIONS: BungeeApiUrlOptions = {
  apiBaseUrl: BUNGEE_API_URL,
  eventsApiBaseUrl: BUNGEE_EVENTS_API_URL,
  acrossApiBaseUrl: ACROSS_API_URL,
  includeBridges: SUPPORTED_BRIDGES,
  manualApiBaseUrl: BUNGEE_MANUAL_API_URL,
} as const
