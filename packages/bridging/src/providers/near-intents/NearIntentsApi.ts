import { ApiError, OneClickService, OpenAPI } from '@defuse-protocol/one-click-sdk-typescript'

import type {
  GetExecutionStatusResponse,
  QuoteRequest,
  QuoteResponse,
  TokenResponse,
} from '@defuse-protocol/one-click-sdk-typescript'

import type { Address, Hex } from 'viem'

import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'

interface GetAttestationRequest {
  depositAddress: Address
  quoteHash: Hex
}

interface GetAttestationResponse {
  signature: Hex
  version: number
}

export class NearIntentsApi {
  // Upstream /v0/tokens still lists deprecated assets the attestation service
  // no longer signs. They share `(blockchain, contractAddress)` with the live
  // Omni replacements, so without this filter `tokens.find()` picks the
  // deprecated entry (it appears first) and /v0/attestation fails with
  // "Invalid quote hash".
  // EVM Omni HOT→nep141 migration:
  // https://docs.near-intents.org/changelog/entries/2026-11-09-evm-omni-token-ids
  private static readonly DEPRECATED_ASSET_IDS: ReadonlySet<string> = new Set([
    // POA BTC bridge, replaced by `1cs_v1:btc:native:coin` (Omni migration).
    // Still returned as symbol `BTC` (no `(DEPRECATED)` marker).
    // https://partners.near-intents.org/omni-migration
    'nep141:btc.omft.near',
    // Plasma HOT (USDT0 / XPL)
    'nep245:v2_1.omni.hot.tg:9745_3aL9skCy1yhPoDB8oKMmRHRN7SJW',
    'nep245:v2_1.omni.hot.tg:9745_11111111111111111111',
    // BNB Chain HOT → Omni nep141:….omdep.near
    'nep245:v2_1.omni.hot.tg:56_11111111111111111111', // BNB
    'nep245:v2_1.omni.hot.tg:56_12zbnsg6xndDVj25QyL82YMPudb', // ASTER
    'nep245:v2_1.omni.hot.tg:56_2CMMyVTGZkeyNZTSvS5sarzfir6g', // USDT
    'nep245:v2_1.omni.hot.tg:56_28V9BijGeZDBFEEtkAcnJo4tPRH4', // SWEAT
    'nep245:v2_1.omni.hot.tg:56_2w93GqMcEmQFDru84j3HZZWt557r', // USDC
    'nep245:v2_1.omni.hot.tg:56_SZzgw3HSudhZcTwPWUTi2RJB19t', // NEAR
    'nep245:v2_1.omni.hot.tg:56_24S22V8GMmQN8t6PbCdRb3mBewAd', // RHEA
    // Polygon HOT → Omni nep141:….omdep.near
    'nep245:v2_1.omni.hot.tg:137_11111111111111111111', // POL
    'nep245:v2_1.omni.hot.tg:137_qiStmoQJDQPTebaPjgx5VBxZv6L', // USDC
    'nep245:v2_1.omni.hot.tg:137_3hpYoaLtt8MP1Z2GH1U473DMRKgr', // USDT
    'nep245:v2_1.omni.hot.tg:137_2jwTGwKRX3AEe7tyzDrxtDjEFgSt', // WETH
    // Avalanche HOT → Omni nep141:….omdep.near
    'nep245:v2_1.omni.hot.tg:43114_11111111111111111111', // AVAX
    'nep245:v2_1.omni.hot.tg:43114_372BeH7ENZieCaabwkbWkBiTTgXp', // USDT
    'nep245:v2_1.omni.hot.tg:43114_3atVJH3r5c4GqiSYmg9fECvjc47o', // USDC
  ])

  private cachedTokens: TokenResponse[] = []

  constructor(apiKey?: string) {
    if (apiKey) {
      OpenAPI.TOKEN = apiKey
    }
  }

  async getTokens(): Promise<TokenResponse[]> {
    if (this.cachedTokens.length === 0) {
      const response = await OneClickService.getTokens()
      this.cachedTokens = response.filter((t) => !NearIntentsApi.DEPRECATED_ASSET_IDS.has(t.assetId))
    }
    return this.cachedTokens
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    try {
      return await OneClickService.getQuote(request)
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const message = error.body?.message
        if (message && typeof message === 'string' && message.toLowerCase().includes('amount is too low')) {
          const minAmountMatch = message.match(/try at least (\d+)/)
          const minAmount = minAmountMatch ? minAmountMatch[1] : undefined
          throw new BridgeProviderQuoteError(BridgeQuoteErrors.SELL_AMOUNT_TOO_SMALL, {
            originalMessage: message,
            minAmount,
          })
        }
        // 1Click lists some assets (e.g. WETH) that it cannot route, report it as a missing route
        if (message && typeof message === 'string' && message.toLowerCase().includes('no liquidity available')) {
          throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES, { originalMessage: message })
        }
      }
      throw error
    }
  }

  async getStatus(depositAddress: string): Promise<GetExecutionStatusResponse> {
    return await OneClickService.getExecutionStatus(depositAddress)
  }

  async getAttestation(request: GetAttestationRequest): Promise<GetAttestationResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (OpenAPI.TOKEN) {
      headers['Authorization'] = `Bearer ${OpenAPI.TOKEN}`
    }
    const response = await fetch(`${OpenAPI.BASE}/v0/attestation`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return (await response.json()) as GetAttestationResponse
  }
}
