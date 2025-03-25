import { BridgeQuoteAmountsAndCosts, QuoteBridgeRequest } from '../../../bridging/types'
import { TargetChainId } from '../../../chains'
import { SuggestedFeesResponse } from './AcrossApi'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import { AcrossChainConfig, ACROSS_TOKEN_MAPPING } from './const/tokens'
import { getBigNumber } from '../../../order-book'
import { OrderKind } from '@cowprotocol/contracts'

const PCT_100_PERCENT = 10n ** 18n

/**
 * Return the chain configs
 *
 * This is a temporary implementation. We should use the Across API to get the intermediate tokens (see this.getAvailableRoutes())
 */
export function getChainConfigs(
  sourceChainId: TargetChainId,
  targetChainId: TargetChainId
): { sourceChainConfig: AcrossChainConfig; targetChainConfig: AcrossChainConfig } | undefined {
  const sourceChainConfig = getChainConfig(sourceChainId)
  const targetChainConfig = getChainConfig(targetChainId)

  if (!sourceChainConfig || !targetChainConfig) return

  return { sourceChainConfig, targetChainConfig }
}

function getChainConfig(chainId: number): AcrossChainConfig | undefined {
  return ACROSS_TOKEN_MAPPING[chainId as unknown as TargetChainId]
}

export function getTokenSymbol(tokenAddress: string, chainConfig: AcrossChainConfig): string | undefined {
  return Object.keys(chainConfig.tokens).find((key) => chainConfig.tokens[key] === tokenAddress)
}

export function getTokenAddress(tokenSymbol: string, chainConfig: AcrossChainConfig): string | undefined {
  return chainConfig.tokens[tokenSymbol]
}

export function toBridgeQuoteResult(
  request: QuoteBridgeRequest,
  slippageBps: number,
  suggestedFees: SuggestedFeesResponse
): AcrossQuoteResult {
  const { kind } = request

  return {
    isSell: kind === OrderKind.SELL,
    amountsAndCosts: toAmountsAndCosts(request, slippageBps, suggestedFees),
    quoteTimestamp: Number(suggestedFees.timestamp),
    expectedFillTimeSeconds: Number(suggestedFees.expectedFillTimeSec),
    suggestedFees,
  }
}

function toAmountsAndCosts(
  request: QuoteBridgeRequest,
  slippageBps: number,
  suggestedFees: SuggestedFeesResponse
): BridgeQuoteAmountsAndCosts {
  const { amount, sellTokenDecimals, buyTokenDecimals } = request

  // Get the amounts before fees
  const sellAmountBeforeFeeBig = getBigNumber(amount, sellTokenDecimals)
  const sellAmountBeforeFee = sellAmountBeforeFeeBig.big
  const buyAmountBeforeFee = getBigNumber(sellAmountBeforeFeeBig.num, buyTokenDecimals).big // Sell and buy token should be the same asset for current implementation, but technically they can have different decimals

  // Apply the fee to the buy amount (sell amount doesn't change)
  const totalRelayerFeePct = BigInt(suggestedFees.totalRelayFee.pct)
  const buyAmountAfterFee = applyPctFee(buyAmountBeforeFee, totalRelayerFeePct)

  // Calculate the fee
  const feeSellToken = sellAmountBeforeFee - applyPctFee(sellAmountBeforeFee, totalRelayerFeePct)
  const feeBuyToken = buyAmountBeforeFee - buyAmountAfterFee
  // TODO: Do we need to use any of the other fees, or they are included in totalRelayFee? I know 'lpFee' fee is, as stated in the docs, but not sure about the others.
  // const relayerCapitalFee = suggestedFees.relayerCapitalFee
  // const relayerGasFee = suggestedFees.relayerGasFee
  // const lpFee = suggestedFees.lpFee

  // Apply slippage
  const buyAmountAfterSlippage = applyBps(buyAmountAfterFee, slippageBps)

  return {
    beforeFee: {
      sellAmount: sellAmountBeforeFee,
      buyAmount: buyAmountBeforeFee, // Assuming the price is 1:1 (before fee). This is because we are exchanging the same asset
    },
    afterFee: {
      sellAmount: sellAmountBeforeFee, // Sell amount does't change (fee is applied to the buy amount)
      buyAmount: buyAmountAfterFee,
    },
    afterSlippage: {
      sellAmount: sellAmountBeforeFee, // Sell amount does't change (slippage is applied to the buy amount)
      buyAmount: buyAmountAfterSlippage,
    },

    costs: {
      bridgingFee: {
        feeBps: pctToBps(totalRelayerFeePct),
        amountInSellCurrency: feeSellToken,
        amountInBuyCurrency: feeBuyToken,
      },
    },
    slippageBps,
  }
}

/**
 * Assert that a percentage is valid.
 */
function assertValidPct(pct: bigint): void {
  if (pct > PCT_100_PERCENT || pct < 0n) {
    throw new Error('Fee cannot exceed 100% or be negative')
  }
}

/**
 * pct is a represents a percentage.
 *
 * Note: 1% is represented as 1e16, 100% is 1e18, 50% is 5e17, etc. These values are in the same format that the contract understands.
 *
 * Bps is a percentage in basis points (1/100th of a percent). For example, 1% is 100 bps.
 *
 * @param pct - The percentage to convert to bps
 * @returns The percentage in bps
 * @throws If the percentage is greater than 100% or less than 0%
 */
export function pctToBps(pct: bigint): number {
  assertValidPct(pct)

  return Number((pct * 10_000n) / PCT_100_PERCENT)
}

/**
 * Apply a percentage fee to an amount.
 *
 * @param amount - The amount to apply the fee to
 * @param pct - The percentage fee to apply
 * @throws If the percentage fee is greater than 100% or less than 0%
 * @returns The amount after the fee has been applied
 */
export function applyPctFee(amount: bigint, pct: bigint): bigint {
  assertValidPct(pct)

  // Compute amount after fee: amount * (1 - pct / 1e18)
  const amountAfterFee = (amount * (PCT_100_PERCENT - pct)) / PCT_100_PERCENT

  return amountAfterFee
}

export function applyBps(amount: bigint, bps: number): bigint {
  return (amount * BigInt(10_000 - bps)) / 10_000n
}
