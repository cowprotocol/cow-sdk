/**
 * Comprehensive unit tests for CoW Protocol trading validation
 * Tests all validation scenarios including edge cases and error conditions
 */

import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import {
  validateSwapParameters,
  validateLimitTradeParameters,
  validateTradeParameters,
  validateSwapParametersSafe,
  getValidationSummary,
  validateTradeAmounts,
  TradeValidationError,
} from './validation'
import { SwapParameters, LimitTradeParameters, TradeParameters } from './types'

describe('CoW Protocol Trading Validation', () => {
  // Valid parameters for testing
  const validSwapParams: SwapParameters = {
    chainId: SupportedChainId.MAINNET,
    appCode: 'CoW Swap',
    kind: OrderKind.SELL,
    sellToken: '0xA0b86a33E6441c8C35a7ba3b7a6C03E2a3Ad32e7', // COW token
    buyToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    sellTokenDecimals: 18,
    buyTokenDecimals: 18,
    amount: '1000000000000000000', // 1 COW
    slippageBps: 50, // 0.5%
  }

  const validLimitParams: LimitTradeParameters = {
    kind: OrderKind.SELL,
    sellToken: '0xA0b86a33E6441c8C35a7ba3b7a6C03E2a3Ad32e7',
    buyToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    sellTokenDecimals: 18,
    buyTokenDecimals: 18,
    sellAmount: '1000000000000000000',
    buyAmount: '500000000000000000',
    slippageBps: 0,
    quoteId: 12345,
  }

  const validTradeParams: TradeParameters = {
    kind: OrderKind.SELL,
    sellToken: '0xA0b86a33E6441c8C35a7ba3b7a6C03E2a3Ad32e7',
    buyToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    sellTokenDecimals: 18,
    buyTokenDecimals: 18,
    amount: '1000000000000000000',
    slippageBps: 50,
  }

  describe('validateSwapParameters', () => {
    it('should pass validation for valid swap parameters', () => {
      expect(() => validateSwapParameters(validSwapParams)).not.toThrow()
    })

    it('should throw for unsupported chain ID', () => {
      const params = { ...validSwapParams, chainId: 999999 as SupportedChainId }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Unsupported chain ID')
    })

    it('should throw for empty app code', () => {
      const params = { ...validSwapParams, appCode: '' }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('App code is required')
    })

    it('should throw for whitespace-only app code', () => {
      const params = { ...validSwapParams, appCode: '   ' }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('App code is required')
    })

    it('should throw for invalid sell token address', () => {
      const params = { ...validSwapParams, sellToken: '0xinvalid' }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Invalid sell token address')
    })

    it('should throw for invalid buy token address', () => {
      const params = { ...validSwapParams, buyToken: 'not-an-address' }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Invalid buy token address')
    })

    it('should throw when sell and buy tokens are the same', () => {
      const params = { ...validSwapParams, buyToken: validSwapParams.sellToken }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Sell token and buy token cannot be the same')
    })

    it('should throw for zero amount', () => {
      const params = { ...validSwapParams, amount: '0' }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Invalid amount')
    })

    it('should throw for negative amount', () => {
      const params = { ...validSwapParams, amount: '-1000' }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
    })

    it('should throw for non-numeric amount', () => {
      const params = { ...validSwapParams, amount: 'not-a-number' }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
    })

    it('should throw for excessive slippage', () => {
      const params = { ...validSwapParams, slippageBps: 6000 } // 60%
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Invalid slippage')
    })

    it('should throw for negative slippage', () => {
      const params = { ...validSwapParams, slippageBps: -100 }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
    })

    it('should allow undefined slippage (auto slippage)', () => {
      const params = { ...validSwapParams, slippageBps: undefined }
      expect(() => validateSwapParameters(params)).not.toThrow()
    })

    it('should throw for excessive validity period', () => {
      const params = { ...validSwapParams, validFor: 100000 } // > 24 hours
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Invalid validity period')
    })

    it('should throw for invalid receiver address', () => {
      const params = { ...validSwapParams, receiver: '0xinvalid' }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Invalid receiver address')
    })

    it('should allow null receiver', () => {
      const params = { ...validSwapParams, receiver: null }
      expect(() => validateSwapParameters(params)).not.toThrow()
    })

    it('should throw for invalid sell token decimals', () => {
      const params = { ...validSwapParams, sellTokenDecimals: -1 }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Invalid sell token decimals')
    })

    it('should throw for excessive sell token decimals', () => {
      const params = { ...validSwapParams, sellTokenDecimals: 78 }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
    })

    it('should throw for invalid buy token decimals', () => {
      const params = { ...validSwapParams, buyTokenDecimals: 100 }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Invalid buy token decimals')
    })

    it('should throw for invalid trade kind', () => {
      const params = { ...validSwapParams, kind: 'invalid' as any }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('Invalid trade kind')
    })

    it('should accept buy kind', () => {
      const params = { ...validSwapParams, kind: OrderKind.BUY }
      expect(() => validateSwapParameters(params)).not.toThrow()
    })
  })

  describe('validateLimitTradeParameters', () => {
    it('should pass validation for valid limit parameters', () => {
      expect(() => validateLimitTradeParameters(validLimitParams)).not.toThrow()
    })

    it('should throw for invalid sell amount', () => {
      const params = { ...validLimitParams, sellAmount: '0' }
      expect(() => validateLimitTradeParameters(params)).toThrow(TradeValidationError)
      expect(() => validateLimitTradeParameters(params)).toThrow('Invalid sell amount')
    })

    it('should throw for invalid buy amount', () => {
      const params = { ...validLimitParams, buyAmount: 'invalid' }
      expect(() => validateLimitTradeParameters(params)).toThrow(TradeValidationError)
      expect(() => validateLimitTradeParameters(params)).toThrow('Invalid buy amount')
    })

    it('should throw for negative quote ID', () => {
      const params = { ...validLimitParams, quoteId: -1 }
      expect(() => validateLimitTradeParameters(params)).toThrow(TradeValidationError)
      expect(() => validateLimitTradeParameters(params)).toThrow('Invalid quote ID')
    })

    it('should throw for non-integer quote ID', () => {
      const params = { ...validLimitParams, quoteId: 123.45 }
      expect(() => validateLimitTradeParameters(params)).toThrow(TradeValidationError)
    })

    it('should allow undefined quote ID', () => {
      const params = { ...validLimitParams, quoteId: undefined }
      expect(() => validateLimitTradeParameters(params)).not.toThrow()
    })
  })

  describe('validateTradeParameters', () => {
    it('should pass validation for valid trade parameters', () => {
      expect(() => validateTradeParameters(validTradeParams)).not.toThrow()
    })

    it('should throw for invalid amount', () => {
      const params = { ...validTradeParams, amount: '0' }
      expect(() => validateTradeParameters(params)).toThrow(TradeValidationError)
    })
  })

  describe('validateSwapParametersSafe', () => {
    it('should return valid result for good parameters', () => {
      const result = validateSwapParametersSafe(validSwapParams)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return invalid result with errors for bad parameters', () => {
      const badParams = {
        ...validSwapParams,
        chainId: 999999 as SupportedChainId,
        appCode: '',
        sellToken: 'invalid',
        amount: '0',
      }

      const result = validateSwapParametersSafe(badParams)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toBeInstanceOf(TradeValidationError)
    })

    it('should collect multiple validation errors', () => {
      const multiErrorParams = {
        ...validSwapParams,
        chainId: 999999 as SupportedChainId,
        sellToken: 'invalid-address',
        buyToken: validSwapParams.sellToken, // Same as sell token
        amount: '0',
        slippageBps: 10000, // Too high
      }

      const result = validateSwapParametersSafe(multiErrorParams)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getValidationSummary', () => {
    it('should return success message for no errors', () => {
      const summary = getValidationSummary([])
      expect(summary).toBe('All parameters are valid')
    })

    it('should format single error correctly', () => {
      const error = new TradeValidationError('Test error message', 'testField', 'testValue')
      const summary = getValidationSummary([error])
      expect(summary).toContain('Found 1 validation error')
      expect(summary).toContain('testField: Test error message')
    })

    it('should format multiple errors correctly', () => {
      const errors = [
        new TradeValidationError('First error', 'field1', 'value1'),
        new TradeValidationError('Second error', 'field2', 'value2'),
      ]
      const summary = getValidationSummary(errors)
      expect(summary).toContain('Found 2 validation errors')
      expect(summary).toContain('1. field1: First error')
      expect(summary).toContain('2. field2: Second error')
    })
  })

  describe('validateTradeAmounts', () => {
    it('should pass for valid amounts', () => {
      expect(() => validateTradeAmounts('1000000', '2000000', 100)).not.toThrow()
    })

    it('should throw for dust sell amount', () => {
      expect(() => validateTradeAmounts('100', '2000000', 100)).toThrow(TradeValidationError)
      expect(() => validateTradeAmounts('100', '2000000', 100)).toThrow('too small (dust)')
    })

    it('should throw for dust buy amount', () => {
      expect(() => validateTradeAmounts('1000000', '100', 100)).toThrow(TradeValidationError)
      expect(() => validateTradeAmounts('1000000', '100', 100)).toThrow('too small (dust)')
    })

    it('should throw for very high slippage', () => {
      expect(() => validateTradeAmounts('1000000', '2000000', 1500)).toThrow(TradeValidationError)
      expect(() => validateTradeAmounts('1000000', '2000000', 1500)).toThrow('High slippage detected')
    })

    it('should allow high slippage under 10%', () => {
      expect(() => validateTradeAmounts('1000000', '2000000', 999)).not.toThrow()
    })

    it('should allow undefined slippage', () => {
      expect(() => validateTradeAmounts('1000000', '2000000', undefined)).not.toThrow()
    })
  })

  describe('TradeValidationError', () => {
    it('should create error with correct properties', () => {
      const error = new TradeValidationError('Test message', 'testField', 'testValue')
      expect(error.name).toBe('TradeValidationError')
      expect(error.message).toBe('Test message')
      expect(error.field).toBe('testField')
      expect(error.value).toBe('testValue')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('Edge cases and boundary conditions', () => {
    it('should handle maximum valid decimals', () => {
      const params = { ...validSwapParams, sellTokenDecimals: 77, buyTokenDecimals: 77 }
      expect(() => validateSwapParameters(params)).not.toThrow()
    })

    it('should handle minimum valid decimals', () => {
      const params = { ...validSwapParams, sellTokenDecimals: 0, buyTokenDecimals: 0 }
      expect(() => validateSwapParameters(params)).not.toThrow()
    })

    it('should handle maximum valid slippage', () => {
      const params = { ...validSwapParams, slippageBps: 5000 } // 50%
      expect(() => validateSwapParameters(params)).not.toThrow()
    })

    it('should handle minimum valid slippage', () => {
      const params = { ...validSwapParams, slippageBps: 0 }
      expect(() => validateSwapParameters(params)).not.toThrow()
    })

    it('should handle maximum valid validity period', () => {
      const params = { ...validSwapParams, validFor: 86400 } // 24 hours
      expect(() => validateSwapParameters(params)).not.toThrow()
    })

    it('should handle minimum valid validity period', () => {
      const params = { ...validSwapParams, validFor: 1 }
      expect(() => validateSwapParameters(params)).not.toThrow()
    })

    it('should handle very large amounts', () => {
      const largeAmount = '999999999999999999999999999999999999999'
      const params = { ...validSwapParams, amount: largeAmount }
      expect(() => validateSwapParameters(params)).not.toThrow()
    })

    it('should handle case insensitive token address comparison', () => {
      const params = {
        ...validSwapParams,
        sellToken: '0xA0B86A33E6441C8C35A7BA3B7A6C03E2A3AD32E7', // Uppercase
        buyToken: '0xa0b86a33e6441c8c35a7ba3b7a6c03e2a3ad32e7', // Lowercase - same token
      }
      expect(() => validateSwapParameters(params)).toThrow(TradeValidationError)
      expect(() => validateSwapParameters(params)).toThrow('cannot be the same')
    })
  })

  describe('Integration with different chain IDs', () => {
    const testChains = [
      SupportedChainId.MAINNET,
      SupportedChainId.GNOSIS_CHAIN,
      SupportedChainId.ARBITRUM_ONE,
      SupportedChainId.SEPOLIA,
    ]

    testChains.forEach((chainId) => {
      it(`should accept valid parameters for chain ${chainId}`, () => {
        const params = { ...validSwapParams, chainId }
        expect(() => validateSwapParameters(params)).not.toThrow()
      })
    })
  })
})
