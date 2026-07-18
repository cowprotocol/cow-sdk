import stringify from 'json-stable-stringify'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { ALL_CHAINS_MAP, ChainInfo, TokenInfo } from '@cowprotocol/sdk-config'
import { BridgeQuoteAmountsAndCosts, BridgeStatus, QuoteBridgeRequest } from '../../types'
import { SocketQuoteRoute, SocketStatusCode, SocketToken } from './types'
import type { SocketDepositQuoteResult } from './SocketDepositBridgeProvider'

export function adaptSocketToken(token: SocketToken): TokenInfo {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    name: token.name,
    symbol: token.symbol,
    logoUrl: token.logoURI || token.icon,
  }
}

export function mapSocketChains(chainIds: number[]): ChainInfo[] {
  return chainIds.reduce<ChainInfo[]>((acc, chainId) => {
    const chain = ALL_CHAINS_MAP[chainId as keyof typeof ALL_CHAINS_MAP]
    if (chain && !acc.includes(chain)) {
      acc.push(chain)
    }
    return acc
  }, [])
}

export function selectBestDepositRoute(routes: SocketQuoteRoute[]): SocketQuoteRoute | undefined {
  return (
    routes.find((route) => route.userOp === 'deposit' && route.routeTags?.includes('SUGGESTED')) ??
    routes
      .filter((route) => route.userOp === 'deposit')
      .sort((a, b) => Number(BigInt(b.output.amount) - BigInt(a.output.amount)))[0]
  )
}

export function toBridgeQuoteResult(request: QuoteBridgeRequest, route: SocketQuoteRoute): SocketDepositQuoteResult {
  const slippageBps = Math.round((route.slippage ?? route.suggestedSlippage ?? 0) * 100)

  return {
    id: route.quoteId,
    isSell: request.kind === OrderKind.SELL,
    depositAddress: route.deposit.depositAddress,
    quoteTimestamp: Math.floor(Date.now() / 1000),
    quoteBody: stringify(route),
    expectedFillTimeSeconds: route.estimatedTime,
    limits: {
      minDeposit: BigInt(route.deposit.amount),
      maxDeposit: BigInt(route.deposit.amount),
    },
    fees: {
      bridgeFee: 0n,
      destinationGasFee: 0n,
    },
    amountsAndCosts: toAmountsAndCosts(request, route, slippageBps),
    socketRoute: route,
  }
}

function toAmountsAndCosts(
  request: QuoteBridgeRequest,
  route: SocketQuoteRoute,
  slippageBps: number,
): BridgeQuoteAmountsAndCosts {
  const sellAmount = BigInt(request.amount)
  const buyAmount = BigInt(route.output.amount)
  const minBuyAmount = BigInt(route.output.minAmountOut)
  const slippageAmount = buyAmount > minBuyAmount ? buyAmount - minBuyAmount : 0n

  return {
    beforeFee: {
      sellAmount,
      buyAmount,
    },
    afterFee: {
      sellAmount,
      buyAmount,
    },
    afterSlippage: {
      sellAmount,
      buyAmount: minBuyAmount,
    },
    costs: {
      bridgingFee: {
        feeBps: 0,
        amountInSellCurrency: 0n,
        amountInBuyCurrency: slippageAmount,
      },
    },
    slippageBps,
  }
}

export const SOCKET_STATUS_TO_COW_STATUS: Record<SocketStatusCode, BridgeStatus> = {
  PENDING: BridgeStatus.IN_PROGRESS,
  IN_PROGRESS: BridgeStatus.IN_PROGRESS,
  COMPLETED: BridgeStatus.EXECUTED,
  FAILED: BridgeStatus.UNKNOWN,
  EXPIRED: BridgeStatus.EXPIRED,
  REFUNDED: BridgeStatus.REFUND,
}
