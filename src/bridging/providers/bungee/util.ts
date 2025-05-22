import { BungeeQuoteResult } from './BungeeBridgeProvider'
import { TargetChainId } from 'src/chains'
import { BUNGEE_TOKEN_MAPPING } from './const/tokens'
import { BungeeChainConfig } from './const/tokens'
import { BridgeQuoteAmountsAndCosts, QuoteBridgeRequest } from 'src/bridging/types'
import { OrderKind } from '@cowprotocol/contracts'
import { BungeeQuote, BungeeQuoteWithBuildTx } from './types'
import { getBigNumber } from 'src/order-book'
import { SignerLike } from 'src/common'
import { ethers } from 'ethers'
import { ERC20_ABI } from './abi'
import { getSigner } from 'src/common/utils/wallet'
import { BungeeTxDataBytesIndices } from './const/misc'
import { BungeeBridge, BungeeBridgeNames } from './types'

export function getChainConfigs(
  sourceChainId: TargetChainId,
  targetChainId: TargetChainId,
): { sourceChainConfig: BungeeChainConfig; targetChainConfig: BungeeChainConfig } | undefined {
  const sourceChainConfig = getChainConfig(sourceChainId)
  const targetChainConfig = getChainConfig(targetChainId)

  if (!sourceChainConfig || !targetChainConfig) return

  return { sourceChainConfig, targetChainConfig }
}

function getChainConfig(chainId: number): BungeeChainConfig | undefined {
  return BUNGEE_TOKEN_MAPPING[chainId as unknown as TargetChainId]
}

export function getTokenSymbol(tokenAddress: string, chainConfig: BungeeChainConfig): string | undefined {
  return Object.keys(chainConfig.tokens).find((key) => chainConfig.tokens[key] === tokenAddress)
}

export function getTokenAddress(tokenSymbol: string, chainConfig: BungeeChainConfig): string | undefined {
  return chainConfig.tokens[tokenSymbol]
}

/**
 * Convert a QuoteBridgeRequest to a BungeeQuoteResult
 * @param request - The QuoteBridgeRequest to convert
 * @returns The BungeeQuoteResult
 */
export function toBridgeQuoteResult(
  request: QuoteBridgeRequest,
  slippageBps: number,
  bungeeQuoteWithBuildTx: BungeeQuoteWithBuildTx,
): BungeeQuoteResult {
  const { kind } = request
  const { bungeeQuote, buildTx } = bungeeQuoteWithBuildTx

  return {
    isSell: kind === OrderKind.SELL,
    amountsAndCosts: toAmountsAndCosts(request, slippageBps, bungeeQuote),
    quoteTimestamp: Number(bungeeQuote.quoteTimestamp),
    expectedFillTimeSeconds: Number(bungeeQuote.route.estimatedTime),
    fees: {
      // @note routeFee is taken in the src chain intermediate token
      bridgeFee: BigInt(bungeeQuote.route.routeDetails.routeFee.amount),
      // @note bungee api does not return destination gas fee separately
      // it is included in the routeFee
      destinationGasFee: BigInt(0),
    },
    // @note bungee api does not return limits
    limits: {
      minDeposit: BigInt(0),
      maxDeposit: BigInt(0),
    },
    bungeeQuote,
    buildTx,
  }
}

function toAmountsAndCosts(
  request: QuoteBridgeRequest,
  slippageBps: number,
  bungeeQuote: BungeeQuote,
): BridgeQuoteAmountsAndCosts {
  const { amount, sellTokenDecimals, buyTokenDecimals } = request

  // Get the amounts before fees
  const sellAmountBeforeFeeBig = getBigNumber(amount, sellTokenDecimals)
  const sellAmountBeforeFee = sellAmountBeforeFeeBig.big
  const buyAmountFromBungeeQuote = bungeeQuote.route.output.amount
  const buyAmountBeforeFee = getBigNumber(buyAmountFromBungeeQuote, buyTokenDecimals).big
  // @note buyAmountAfterFee does not change, since routeFee is taken in the src chain intermediate token
  const buyAmountAfterFee = buyAmountBeforeFee

  // Calculate the fee
  const feeSellToken = bungeeQuote.route.routeDetails.routeFee.amount
  // @note feeBuyToken is 0, since routeFee is taken in the src chain intermediate token
  const feeBuyToken = 0

  // Apply slippage
  const buyAmountAfterSlippage = applyBps(buyAmountAfterFee, slippageBps)

  // Calculate bridge fee bps from input amount routeFee
  // input amount and routeFee would be in token decimals so we need to convert to bigInt
  const bridgeFeeBps = Number((BigInt(bungeeQuote.route.routeDetails.routeFee.amount) * 10_000n) / BigInt(amount))

  return {
    beforeFee: {
      sellAmount: sellAmountBeforeFee,
      buyAmount: buyAmountBeforeFee,
    },
    afterFee: {
      sellAmount: sellAmountBeforeFee,
      buyAmount: buyAmountAfterFee,
    },
    afterSlippage: {
      sellAmount: sellAmountBeforeFee,
      buyAmount: buyAmountAfterSlippage,
    },

    costs: {
      bridgingFee: {
        feeBps: bridgeFeeBps,
        amountInSellCurrency: BigInt(feeSellToken),
        amountInBuyCurrency: BigInt(feeBuyToken),
      },
    },
    slippageBps,
  }
}

/**
 * pct represents a percentage.
 *
 * bps is a percentage in basis points (1/100th of a percent). For example, 1% is 100 bps.
 *
 * @param pct - The percentage to convert to bps
 * @returns The percentage in bps
 * @throws If the percentage is greater than 100% or less than 0%
 */
export function pctToBpsNumber(pct: number): number {
  if (pct > 100 || pct < 0) {
    throw new Error('Fee cannot exceed 100% or be negative')
  }

  return Math.round(pct * 100)
}
export function pctToBpsBigInt(pct: bigint): bigint {
  if (pct > 100n || pct < 0n) {
    throw new Error('Fee cannot exceed 100% or be negative')
  }

  return (pct * 100n) / 100n
}

export function applyBps(amount: bigint, bps: number): bigint {
  return (amount * BigInt(10_000 - bps)) / 10_000n
}

/**
 * Converts an object to URLSearchParams, handling arrays by creating multiple parameters
 * @param params Object to convert to URLSearchParams
 * @returns URLSearchParams instance
 *
 * @example
 * const params = {
 *   userAddress: '0x123',
 *   includeBridges: ['across', 'cctp']
 * }
 * const searchParams = objectToSearchParams(params)
 * Results in: ?userAddress=0x123&includeBridges=across&includeBridges=cctp
 */
export function objectToSearchParams(params: { [key: string]: any }): URLSearchParams {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, String(item))
      })
    } else {
      searchParams.append(key, String(value))
    }
  })

  return searchParams
}

export async function fetchTokenAllowance(params: {
  tokenAddress: string
  ownerAddress: string
  spenderAddress: string
  signer: SignerLike
}): Promise<bigint> {
  const { tokenAddress, ownerAddress, spenderAddress, signer } = params

  // @todo does this actually work and connect to source chain id ¿
  const _signer = getSigner(signer)
  const tokenContract = getErc20Contract(tokenAddress, _signer)
  const allowance = await tokenContract.allowance(ownerAddress, spenderAddress)
  return allowance
}

export function getErc20Contract(
  tokenAddress: string,
  signer?: ethers.Signer | ethers.providers.Provider,
): ethers.Contract {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer)
}

export const decodeBungeeTxData = (txData: string) => {
  // remove first two characters = 0x
  const txDataWithout0x = txData.slice(2)
  // first four bytes are the routeId
  const routeId = `0x${txDataWithout0x.slice(0, 8)}`
  // rest is the encoded function data
  const encodedFunctionData = `0x${txDataWithout0x.slice(8)}`
  return { routeId, encodedFunctionData }
}

// Helper function to get enum value from display name
export const getBungeeBridgeFromDisplayName = (displayName: string): BungeeBridge | undefined => {
  return BungeeBridgeNames[displayName]
}

// Helper function to get display name from enum value
export const getDisplayNameFromBungeeBridge = (bridge: BungeeBridge): string | undefined => {
  return Object.entries(BungeeBridge).find(([_, value]) => value === bridge)?.[0]
}

export const decodeAmountsBungeeTxData = (txData: string, bridge: BungeeBridge) => {
  // decode input amount
  const inputAmountBytes = `0x${txData.slice(
    BungeeTxDataBytesIndices[bridge].inputAmount.bytesString_startIndex,
    BungeeTxDataBytesIndices[bridge].inputAmount.bytesString_startIndex +
      BungeeTxDataBytesIndices[bridge].inputAmount.bytesString_length,
  )}`
  const inputAmountBigNumber = ethers.BigNumber.from(inputAmountBytes)

  // decode output amount if available
  // check if output amount is available
  if (bridge === BungeeBridge.Across) {
    const outputAmountBytes = `0x${txData.slice(
      BungeeTxDataBytesIndices[bridge].outputAmount.bytesString_startIndex,
      BungeeTxDataBytesIndices[bridge].outputAmount.bytesString_startIndex +
        BungeeTxDataBytesIndices[bridge].outputAmount.bytesString_length,
    )}`
    const outputAmountBigNumber = ethers.BigNumber.from(outputAmountBytes)
    return {
      inputAmountBytes,
      inputAmountBigNumber,
      outputAmountBytes,
      outputAmountBigNumber,
    }
  }
  return {
    inputAmountBytes,
    inputAmountBigNumber,
  }
}
