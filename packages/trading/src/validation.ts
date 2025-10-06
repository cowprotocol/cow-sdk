/**
 * Comprehensive validation utilities for CoW Protocol trading operations
 * This module provides critical safety checks to prevent user errors and potential loss of funds
 */

import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { TradeParameters, SwapParameters, LimitTradeParameters } from './types'

/**
 * Validation error thrown when trade parameters are invalid
 */
export class TradeValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown,
  ) {
    super(message)
    this.name = 'TradeValidationError'
  }
}

/**
 * Configuration for validation rules
 */
interface ValidationConfig {
  readonly maxSlippageBps: number
  readonly minAmount: string
  readonly maxValidityPeriod: number
}

/**
 * Default validation configuration
 */
const DEFAULT_CONFIG: ValidationConfig = {
  maxSlippageBps: 5000,
  minAmount: '1',
  maxValidityPeriod: 86400,
}

/**
 * Validates that an address is properly formatted
 */
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Validates that a token amount is within acceptable bounds
 */
function isValidAmount(amount: string): boolean {
  try {
    const bn = BigInt(amount)
    return bn > 0n
  } catch {
    return false
  }
}

/**
 * Safely parses amount to BigInt with proper error handling
 * Throws TradeValidationError instead of native TypeError
 */
function safeParseBigInt(amount: string, fieldName: string): bigint {
  try {
    return BigInt(amount)
  } catch {
    throw new TradeValidationError(
      `Invalid ${fieldName}: ${amount}. Must be a positive integer in wei (no decimals, scientific notation, or empty strings allowed)`,
      fieldName,
      amount,
    )
  }
}

/**
 * Validates slippage tolerance is within reasonable bounds
 */
function isValidSlippageBps(slippageBps: number | undefined): boolean {
  if (slippageBps === undefined) return true
  return slippageBps >= 0 && slippageBps <= DEFAULT_CONFIG.maxSlippageBps
}

/**
 * Validates that validity period is reasonable
 */
function isValidValidityPeriod(validFor: number): boolean {
  return validFor > 0 && validFor <= DEFAULT_CONFIG.maxValidityPeriod
}

/**
 * Validates base trade common fields
 */
function validateCommonFields(params: {
  sellToken: string
  buyToken: string
  sellTokenDecimals: number
  buyTokenDecimals: number
  slippageBps?: number
  validFor?: number
  receiver?: string | null
  kind: string
}): void {
  if (!isValidAddress(params.sellToken)) {
    throw new TradeValidationError(`Invalid sell token address: ${params.sellToken}`, 'sellToken', params.sellToken)
  }

  if (!isValidAddress(params.buyToken)) {
    throw new TradeValidationError(`Invalid buy token address: ${params.buyToken}`, 'buyToken', params.buyToken)
  }

  if (params.sellToken.toLowerCase() === params.buyToken.toLowerCase()) {
    throw new TradeValidationError('Sell token and buy token cannot be the same', 'tokens', {
      sellToken: params.sellToken,
      buyToken: params.buyToken,
    })
  }

  if (!isValidSlippageBps(params.slippageBps)) {
    throw new TradeValidationError(
      `Invalid slippage: ${params.slippageBps}. Must be between 0 and ${DEFAULT_CONFIG.maxSlippageBps} BPS (${DEFAULT_CONFIG.maxSlippageBps / 100}%)`,
      'slippageBps',
      params.slippageBps,
    )
  }

  if (params.validFor && !isValidValidityPeriod(params.validFor)) {
    throw new TradeValidationError(
      `Invalid validity period: ${params.validFor}. Must be between 1 and ${DEFAULT_CONFIG.maxValidityPeriod} seconds`,
      'validFor',
      params.validFor,
    )
  }

  if (params.receiver && !isValidAddress(params.receiver)) {
    throw new TradeValidationError(`Invalid receiver address: ${params.receiver}`, 'receiver', params.receiver)
  }

  if (params.sellTokenDecimals < 0 || params.sellTokenDecimals > 77) {
    throw new TradeValidationError(
      `Invalid sell token decimals: ${params.sellTokenDecimals}. Must be between 0 and 77`,
      'sellTokenDecimals',
      params.sellTokenDecimals,
    )
  }
  if (params.buyTokenDecimals < 0 || params.buyTokenDecimals > 77) {
    throw new TradeValidationError(
      `Invalid buy token decimals: ${params.buyTokenDecimals}. Must be between 0 and 77`,
      'buyTokenDecimals',
      params.buyTokenDecimals,
    )
  }

  if (params.kind !== OrderKind.SELL && params.kind !== OrderKind.BUY) {
    throw new TradeValidationError(`Invalid trade kind: ${params.kind}. Must be 'sell' or 'buy'`, 'kind', params.kind)
  }
}

export function validateSwapParameters(params: SwapParameters): void {
  if (!Object.values(SupportedChainId).includes(params.chainId)) {
    throw new TradeValidationError(`Unsupported chain ID: ${params.chainId}`, 'chainId', params.chainId)
  }

  if (!params.appCode || params.appCode.trim().length === 0) {
    throw new TradeValidationError('App code is required and cannot be empty', 'appCode', params.appCode)
  }

  if (!isValidAmount(params.amount)) {
    throw new TradeValidationError(
      `Invalid amount: ${params.amount}. Must be a positive integer in wei`,
      'amount',
      params.amount,
    )
  }

  validateCommonFields(params)
}

/**
 * Validates base trade parameters (without chain ID)
 */
export function validateTradeParameters(params: TradeParameters): void {
  if (!isValidAmount(params.amount)) {
    throw new TradeValidationError(
      `Invalid amount: ${params.amount}. Must be a positive integer in wei`,
      'amount',
      params.amount,
    )
  }

  validateCommonFields(params)
}

/**
 * Validates limit trade parameters
 */
export function validateLimitTradeParameters(params: LimitTradeParameters): void {
  if (!isValidAmount(params.sellAmount)) {
    throw new TradeValidationError(
      `Invalid sell amount: ${params.sellAmount}. Must be a positive integer in wei`,
      'sellAmount',
      params.sellAmount,
    )
  }

  if (!isValidAmount(params.buyAmount)) {
    throw new TradeValidationError(
      `Invalid buy amount: ${params.buyAmount}. Must be a positive integer in wei`,
      'buyAmount',
      params.buyAmount,
    )
  }

  if (params.quoteId !== undefined && params.quoteId !== null) {
    if (typeof params.quoteId === 'number' && (params.quoteId < 0 || !Number.isInteger(params.quoteId))) {
      throw new TradeValidationError(
        `Invalid quote ID: ${params.quoteId}. Must be null, undefined, or a positive integer`,
        'quoteId',
        params.quoteId,
      )
    }
  }

  validateCommonFields(params)
}

/**
 * Validates parameters with detailed error reporting - returns results instead of throwing
 */
export function validateSwapParametersSafe(params: SwapParameters): {
  isValid: boolean
  errors: TradeValidationError[]
} {
  const errors: TradeValidationError[] = []

  try {
    validateSwapParameters(params)
  } catch (error) {
    if (error instanceof TradeValidationError) {
      errors.push(error)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Creates a user-friendly validation summary
 */
export function getValidationSummary(errors: TradeValidationError[]): string {
  if (errors.length === 0) return 'All parameters are valid'

  const summary = errors.map((error, index) => `${index + 1}. ${error.field}: ${error.message}`).join('\n')

  return `Found ${errors.length} validation error${errors.length > 1 ? 's' : ''}:\n${summary}`
}

/**
 * Validates common edge cases that can cause silent failures
 */
export function validateTradeAmounts(sellAmount: string, buyAmount: string, slippageBps?: number): void {
  const sellBn = safeParseBigInt(sellAmount, 'sellAmount')
  const buyBn = safeParseBigInt(buyAmount, 'buyAmount')

  if (sellBn < BigInt('1000')) {
    throw new TradeValidationError(
      'Sell amount is too small (dust). Minimum recommended: 1000 wei',
      'sellAmount',
      sellAmount,
    )
  }

  if (buyBn < BigInt('1000')) {
    throw new TradeValidationError(
      'Buy amount is too small (dust). Minimum recommended: 1000 wei',
      'buyAmount',
      buyAmount,
    )
  }

  if (slippageBps && slippageBps > 1000) {
    // > 10%
    throw new TradeValidationError(
      `High slippage detected: ${slippageBps / 100}%. This may indicate unrealistic price expectations`,
      'slippageBps',
      slippageBps,
    )
  }
}
