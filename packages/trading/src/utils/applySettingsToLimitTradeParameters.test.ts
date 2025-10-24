import { OrderKind } from '@cowprotocol/sdk-order-book'

import { applySettingsToLimitTradeParameters } from './applySettingsToLimitTradeParameters'
import { LimitOrderAdvancedSettings, LimitTradeParameters } from '../types'

describe('applySettingsToLimitTradeParameters', () => {
  const mockBaseParams: LimitTradeParameters = {
    kind: OrderKind.SELL,
    sellToken: '0xSellToken',
    sellTokenDecimals: 18,
    buyToken: '0xBuyToken',
    buyTokenDecimals: 6,
    sellAmount: '1000000000000000000',
    buyAmount: '1000000',
    slippageBps: 50,
  }

  describe('without advanced settings', () => {
    test('should return params with env set to prod when no settings provided', () => {
      const result = applySettingsToLimitTradeParameters(mockBaseParams, undefined)

      expect(result).toEqual({
        ...mockBaseParams,
        env: 'prod',
      })
    })

    test('should preserve existing env when no settings provided', () => {
      const paramsWithEnv = { ...mockBaseParams, env: 'staging' as const }
      const result = applySettingsToLimitTradeParameters(paramsWithEnv, undefined)

      expect(result).toEqual(paramsWithEnv)
    })

    test('should not mutate original params', () => {
      const originalParams = { ...mockBaseParams }
      applySettingsToLimitTradeParameters(mockBaseParams, undefined)

      expect(mockBaseParams).toEqual(originalParams)
    })
  })

  describe('with appData slippage override', () => {
    test('should override slippageBps from appData metadata', () => {
      const settings: LimitOrderAdvancedSettings = {
        appData: {
          metadata: {
            quote: {
              slippageBips: 100,
            },
          },
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.slippageBps).toBe(100)
    })

    test('should override slippageBps with zero value', () => {
      const settings: LimitOrderAdvancedSettings = {
        appData: {
          metadata: {
            quote: {
              slippageBips: 0,
            },
          },
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.slippageBps).toBe(0)
    })
  })

  describe('with partnerFee override', () => {
    test('should override partnerFee from appData metadata', () => {
      const partnerFee = {
        volumeBps: 10,
        recipient: '0xPartnerFeeRecipient',
      }

      const settings: LimitOrderAdvancedSettings = {
        appData: {
          metadata: {
            partnerFee,
          },
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.partnerFee).toEqual(partnerFee)
    })

    test('should not override partnerFee when undefined in appData', () => {
      const paramsWithPartnerFee = {
        ...mockBaseParams,
        partnerFee: {
          volumeBps: 20,
          recipient: '0xExistingPartner',
        },
      }

      const settings: LimitOrderAdvancedSettings = {
        appData: {
          metadata: {},
        },
      }

      const result = applySettingsToLimitTradeParameters(paramsWithPartnerFee, settings)

      expect(result.partnerFee).toEqual(paramsWithPartnerFee.partnerFee)
    })
  })

  describe('with quoteRequest overrides', () => {
    test('should override receiver from quoteRequest', () => {
      const settings: LimitOrderAdvancedSettings = {
        quoteRequest: {
          receiver: '0xNewReceiver',
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.receiver).toBe('0xNewReceiver')
    })

    test('should override validTo from quoteRequest', () => {
      const settings: LimitOrderAdvancedSettings = {
        quoteRequest: {
          validTo: 1234567890,
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.validTo).toBe(1234567890)
    })

    test('should override sellToken from quoteRequest', () => {
      const settings: LimitOrderAdvancedSettings = {
        quoteRequest: {
          sellToken: '0xNewSellToken',
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.sellToken).toBe('0xNewSellToken')
    })

    test('should override buyToken from quoteRequest', () => {
      const settings: LimitOrderAdvancedSettings = {
        quoteRequest: {
          buyToken: '0xNewBuyToken',
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.buyToken).toBe('0xNewBuyToken')
    })

    test('should override owner from quoteRequest.from', () => {
      const settings: LimitOrderAdvancedSettings = {
        quoteRequest: {
          from: '0xNewOwner',
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.owner).toBe('0xNewOwner')
    })

    test('should apply multiple quoteRequest overrides simultaneously', () => {
      const settings: LimitOrderAdvancedSettings = {
        quoteRequest: {
          receiver: '0xNewReceiver',
          validTo: 9999999999,
          sellToken: '0xNewSellToken',
          buyToken: '0xNewBuyToken',
          from: '0xNewOwner',
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.receiver).toBe('0xNewReceiver')
      expect(result.validTo).toBe(9999999999)
      expect(result.sellToken).toBe('0xNewSellToken')
      expect(result.buyToken).toBe('0xNewBuyToken')
      expect(result.owner).toBe('0xNewOwner')
    })

    test('should not override when quoteRequest values are undefined', () => {
      const paramsWithValues = {
        ...mockBaseParams,
        receiver: '0xExistingReceiver',
        validTo: 1111111111,
        owner: '0xExistingOwner' as `0x${string}`,
      }

      const settings: LimitOrderAdvancedSettings = {
        quoteRequest: {},
      }

      const result = applySettingsToLimitTradeParameters(paramsWithValues, settings)

      expect(result.receiver).toBe('0xExistingReceiver')
      expect(result.validTo).toBe(1111111111)
      expect(result.owner).toBe('0xExistingOwner')
    })
  })

  describe('with combined settings', () => {
    test('should apply all settings together', () => {
      const settings: LimitOrderAdvancedSettings = {
        appData: {
          metadata: {
            quote: {
              slippageBips: 200,
            },
            partnerFee: {
              volumeBps: 15,
              recipient: '0xPartner',
            },
          },
        },
        quoteRequest: {
          receiver: '0xCustomReceiver',
          validTo: 8888888888,
          from: '0xCustomOwner',
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.slippageBps).toBe(200)
      expect(result.partnerFee).toEqual({ volumeBps: 15, recipient: '0xPartner' })
      expect(result.receiver).toBe('0xCustomReceiver')
      expect(result.validTo).toBe(8888888888)
      expect(result.owner).toBe('0xCustomOwner')
      expect(result.env).toBe('prod')
    })

    test('should preserve other parameters when applying settings', () => {
      const settings: LimitOrderAdvancedSettings = {
        appData: {
          metadata: {
            quote: {
              slippageBips: 150,
            },
          },
        },
      }

      const result = applySettingsToLimitTradeParameters(mockBaseParams, settings)

      expect(result.kind).toBe(mockBaseParams.kind)
      expect(result.sellToken).toBe(mockBaseParams.sellToken)
      expect(result.sellTokenDecimals).toBe(mockBaseParams.sellTokenDecimals)
      expect(result.buyToken).toBe(mockBaseParams.buyToken)
      expect(result.buyTokenDecimals).toBe(mockBaseParams.buyTokenDecimals)
      expect(result.sellAmount).toBe(mockBaseParams.sellAmount)
      expect(result.buyAmount).toBe(mockBaseParams.buyAmount)
    })
  })
})
