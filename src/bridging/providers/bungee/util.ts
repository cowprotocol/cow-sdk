import { BungeeQuoteResult } from './BungeeBridgeProvider'
import { BridgeQuoteAmountsAndCosts, QuoteBridgeRequest } from 'src/bridging/types'
import { OrderKind } from '@cowprotocol/contracts'
import { BungeeQuote, BungeeQuoteWithBuildTx } from './types'
import { getBigNumber } from 'src/order-book'
import { SignerLike } from 'src/common'
import { ethers, Signer } from 'ethers'
import { ERC20_ABI } from './abi'
import { getSigner } from 'src/common/utils/wallet'
import { BungeeTxDataBytesIndices } from './const/misc'
import { BungeeBridge, BungeeBridgeNames } from './types'

/**
 * Convert a QuoteBridgeRequest to a BungeeQuoteResult
 * @param request - The QuoteBridgeRequest to convert
 * @param slippageBps
 * @param bungeeQuoteWithBuildTx
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
 * Decodes the txData from Bungee API
 * @param txData - The txData to decode
 * @returns The routeId and encoded function data
 */
export function decodeBungeeBridgeTxData(txData: string) {
  // remove first two characters = 0x
  const txDataWithout0x = txData.slice(2)
  // first four bytes are the routeId
  const routeId = `0x${txDataWithout0x.slice(0, 8)}`
  // rest is the encoded function data
  const encodedFunctionData = `0x${txDataWithout0x.slice(8)}`
  // first 2+8 characters of encodedFunctionData are the function selector
  const functionSelector = `${encodedFunctionData.slice(0, 10)}`
  return { routeId, encodedFunctionData, functionSelector }
}

export function applyBps(amount: bigint, bps: number): bigint {
  return (amount * BigInt(10_000 - bps)) / 10_000n
}

/**
 * Converts an object to URLSearchParams, handling arrays by joining values with commas
 * @param params Object to convert to URLSearchParams
 * @returns URLSearchParams instance
 *
 * @example
 * const params = {
 *   userAddress: '0x123',
 *   includeBridges: ['across', 'cctp']
 * }
 * const searchParams = objectToSearchParams(params)
 * Results in: ?userAddress=0x123&includeBridges=across,cctp
 */
export function objectToSearchParams(params: object): URLSearchParams {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      searchParams.append(key, value.join(','))
    } else {
      searchParams.append(key, String(value))
    }
  })

  return searchParams
}

export async function getSignerForChainId(chainId: number, signer: SignerLike): Promise<Signer> {
  const _signer = getSigner(signer)
  const connectedChainId = await _signer.getChainId()
  if (connectedChainId !== chainId) {
    throw new Error(`Signer chainId ${connectedChainId} does not match expected sourceChainId ${chainId}`)
  }
  return _signer
}

export async function fetchTokenAllowance(params: {
  chainId: number
  tokenAddress: string
  ownerAddress: string
  spenderAddress: string
  signer: SignerLike
}): Promise<bigint> {
  const { chainId, tokenAddress, ownerAddress, spenderAddress, signer } = params

  const _signer = await getSignerForChainId(chainId, signer)
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
