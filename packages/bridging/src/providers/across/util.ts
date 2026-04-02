import { BridgeQuoteAmountsAndCosts, BridgeStatus, QuoteBridgeRequest } from '../../types'

import { AcrossDepositEvent, DepositStatusResponse } from './types'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import {
  ACROSS_SWAP_APPROVAL_MAX_DEPOSIT_LIMIT,
  parseDepositTimingFromSwapTxData,
  type SwapApprovalApiResponse,
} from './swapApprovalMapper'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { ACROSS_DEPOSIT_EVENT_INTERFACE } from './const/interfaces'
import { ACROSS_SPOKE_POOL_CONTRACT_ADDRESSES } from './const/contracts'
import { SupportedChainId, TargetChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { getAddressKey, getGlobalAdapter, getWrappedNativeToken, isNativeToken, Log } from '@cowprotocol/sdk-common'
import stringify from 'json-stable-stringify'

const PCT_100_PERCENT = 10n ** 18n

/**
 * Across uses wrapped native token address for both native and wrapped tokens
 * In CoW we use 0xeeee...eeeee for native token, which is not supported by Across
 * Because of that, we have to map the address
 */
export function mapNativeOrWrappedTokenAddress(token: { chainId: TargetChainId; address: string }): string {
  if (isNativeToken(token)) {
    const wrapped = getWrappedNativeToken(token.chainId)

    if (!wrapped) {
      throw new Error('Specified token.chainId does not belong to TargetChainId!')
    }

    return wrapped.address
  }

  return token.address
}

export function toBridgeQuoteResult(
  request: QuoteBridgeRequest,
  slippageBps: number,
  swapApproval: SwapApprovalApiResponse,
): AcrossQuoteResult {
  const { kind } = request

  const timing = parseDepositTimingFromSwapTxData(swapApproval.swapTx.data)
  if (!timing) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.INVALID_API_JSON_RESPONSE, {
      reason: 'swapTx.data missing deposit timing words',
    })
  }

  return {
    id: swapApproval.id,
    isSell: kind === OrderKind.SELL,
    amountsAndCosts: toAmountsAndCosts(request, slippageBps, swapApproval),
    quoteTimestamp: Number(timing.quoteTimestamp),
    quoteBody: stringify(swapApproval),
    expectedFillTimeSeconds: swapApproval.expectedFillTime,
    fees: bridgeFeesFromSwapApproval(swapApproval),
    // `BridgeQuoteResult.limits` is kept for callers that expect bounds. Swap approval gives
    // `inputAmount` (quoted size) but not suggested-fees-style max/instant limits; see
    // `ACROSS_SWAP_APPROVAL_MAX_DEPOSIT_LIMIT` for why max uses uint256 max as a fallback.
    limits: {
      minDeposit: BigInt(swapApproval.inputAmount),
      maxDeposit: BigInt(ACROSS_SWAP_APPROVAL_MAX_DEPOSIT_LIMIT),
    },
    swapApproval,
  }
}

function bridgeFeesFromSwapApproval(swapApproval: SwapApprovalApiResponse): {
  bridgeFee: bigint
  destinationGasFee: bigint
} {
  const details = swapApproval.steps.bridge?.fees?.details
  const relayerCapital = details?.relayerCapital ?? { amount: '0' }
  const destinationGas = details?.destinationGas ?? { amount: '0' }
  return {
    bridgeFee: BigInt(relayerCapital.amount),
    destinationGasFee: BigInt(destinationGas.amount),
  }
}

function toAmountsAndCosts(
  request: QuoteBridgeRequest,
  slippageBps: number,
  swapApproval: SwapApprovalApiResponse,
): BridgeQuoteAmountsAndCosts {
  const { amount } = request

  const sellAmountBeforeFee = amount
  // Sell and buy token should be the same asset for current implementation, but technically they can have different decimals
  const bridge = swapApproval.steps.bridge
  const outputAmountStr = bridge?.outputAmount ?? swapApproval.expectedOutputAmount
  const buyAmountBeforeFee = BigInt(outputAmountStr)

  // Apply the fee to the buy amount (sell amount doesn't change)
  const feeRoot = bridge?.fees
  const totalRelayerFeePct = BigInt(feeRoot?.pct ?? '0')
  const buyAmountAfterFee = applyPctFee(buyAmountBeforeFee, totalRelayerFeePct)

  // Calculate the fee
  const feeSellToken = sellAmountBeforeFee - applyPctFee(sellAmountBeforeFee, totalRelayerFeePct)
  const feeBuyToken = buyAmountBeforeFee - buyAmountAfterFee

  // Apply slippage
  const buyAmountAfterSlippage = applyBps(buyAmountAfterFee, slippageBps)

  return {
    beforeFee: {
      sellAmount: sellAmountBeforeFee,
      buyAmount: buyAmountBeforeFee,
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

function bytes32ToAddress(address: string): string {
  return getGlobalAdapter().utils.decodeAbi(['address'], address).toString()
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
 * pct represents a percentage.
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
  return (amount * (PCT_100_PERCENT - pct)) / PCT_100_PERCENT
}

export function applyBps(amount: bigint, bps: number): bigint {
  return (amount * BigInt(10_000 - bps)) / 10_000n
}

const AcrossStatusToBridgeStatus: Record<DepositStatusResponse['status'], BridgeStatus> = {
  filled: BridgeStatus.EXECUTED,
  slowFillRequested: BridgeStatus.EXECUTED,
  pending: BridgeStatus.IN_PROGRESS,
  expired: BridgeStatus.EXPIRED,
  refunded: BridgeStatus.REFUND,
}

export function mapAcrossStatusToBridgeStatus(status: DepositStatusResponse['status']): BridgeStatus {
  return AcrossStatusToBridgeStatus[status]
}

export function getAcrossDepositEvents(chainId: SupportedChainId, logs: Log[]): AcrossDepositEvent[] {
  const spokePoolContractAddress = ACROSS_SPOKE_POOL_CONTRACT_ADDRESSES[chainId]
  const spokePoolContractAddressKey = spokePoolContractAddress ? getAddressKey(spokePoolContractAddress) : undefined

  if (!spokePoolContractAddressKey) {
    return []
  }

  const acrossDepositInterface = ACROSS_DEPOSIT_EVENT_INTERFACE()
  const ACROSS_DEPOSIT_EVENT_TOPIC = acrossDepositInterface.getEventTopic('FundsDeposited')

  // Get Across deposit events
  const depositEvents = logs.filter((log) => {
    return getAddressKey(log.address) === spokePoolContractAddressKey && log.topics[0] === ACROSS_DEPOSIT_EVENT_TOPIC
  })

  // Parse logs
  return depositEvents.map((event) => {
    const parsedLog = acrossDepositInterface.parseLog(event)

    if (!parsedLog) {
      throw new Error('Could not parse log of Across Deposit')
    }

    const {
      inputToken,
      outputToken,
      inputAmount,
      outputAmount,
      destinationChainId,
      depositId,
      quoteTimestamp,
      fillDeadline,
      exclusivityDeadline,
      depositor,
      recipient,
      exclusiveRelayer,
      message,
    } = parsedLog.args as AcrossDepositEvent

    return {
      inputToken: bytes32ToAddress(inputToken),
      outputToken: bytes32ToAddress(outputToken),
      inputAmount,
      outputAmount,
      destinationChainId,
      depositId,
      quoteTimestamp,
      fillDeadline,
      exclusivityDeadline,
      depositor: bytes32ToAddress(depositor),
      recipient: bytes32ToAddress(recipient),
      exclusiveRelayer,
      message,
    }
  })
}
