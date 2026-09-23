import {
  QuoteResults,
  SwapAdvancedSettings,
  TradingSdk,
  WithPartialTraderParams,
  TradeParameters,
} from '@cowprotocol/sdk-trading'
import { getGlobalAdapter, log, SignerLike } from '@cowprotocol/sdk-common'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { TokenInfo } from '@cowprotocol/sdk-config'
import {
  BridgeQuoteResult,
  BridgeQuoteResults,
  BridgeThenSwapProvider,
  BridgeThenSwapQuoteAndPost,
  QuoteBridgeRequest,
} from '../types'
import { GetQuoteWithBridgeThenSwapParams } from './types'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../errors'
import { determineIntermediateToken } from './determineIntermediateToken'

const DESTINATION_GAS_BUFFER = 30_000

/**
 * Get a quote for a bridge-then-swap operation.
 *
 * Flow:
 * 1. Determine the intermediate token on the destination chain (what can be bridged)
 * 2. Get a bridge quote from source chain to destination chain (for the intermediate token)
 * 3. Get a swap quote on the destination chain (intermediate token → final buy token)
 * 4. Compute the OrderFlow address (CREATE2)
 * 5. Encode the destination order data
 * 6. Build the bridge transaction (includes destination payload)
 * 7. Return the combined quote
 */
export async function getQuoteWithBridgeThenSwap<T extends BridgeQuoteResult>(
  provider: BridgeThenSwapProvider<T>,
  params: GetQuoteWithBridgeThenSwapParams,
): Promise<BridgeThenSwapQuoteAndPost> {
  const { swapAndBridgeRequest, tradingSdk, advancedSettings } = params
  const {
    kind,
    sellTokenChainId,
    sellTokenAddress,
    sellTokenDecimals,
    buyTokenChainId,
    buyTokenAddress,
    buyTokenDecimals,
    amount,
    signer: signerLike,
  } = swapAndBridgeRequest

  if (kind !== OrderKind.SELL) {
    throw new Error('Bridge-then-swap only supports SELL orders')
  }

  const adapter = getGlobalAdapter()
  const signer = signerLike ? adapter.createSigner(signerLike) : adapter.signer
  const owner = swapAndBridgeRequest.owner ?? swapAndBridgeRequest.account
  if (!owner) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.QUOTE_ERROR, {
      error: 'Owner address is required for bridge-then-swap',
    })
  }

  log(
    `Bridge-then-swap: ${amount} ${sellTokenAddress} (chain ${sellTokenChainId}) → bridge → swap for ${buyTokenAddress} (chain ${buyTokenChainId})`,
  )

  // Step 1: Get intermediate tokens (tokens that can be bridged to the destination chain)
  const intermediateTokens = await provider.getIntermediateTokens(swapAndBridgeRequest)

  if (intermediateTokens.length === 0) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS)
  }

  // Determine the best intermediate token for bridging
  const intermediateToken = await determineIntermediateToken(
    sellTokenChainId,
    sellTokenAddress,
    intermediateTokens,
    advancedSettings?.getCorrelatedTokens,
  )

  log(`Using ${intermediateToken?.name ?? intermediateToken?.address} as bridge intermediate token`)

  // Step 2: Get bridge quote (source chain sell token → destination chain intermediate token)
  const bridgeRequest: QuoteBridgeRequest = {
    ...swapAndBridgeRequest,
    // The sell token is the user's source token
    sellTokenAddress,
    sellTokenChainId,
    sellTokenDecimals,
    // The buy token for the bridge is the intermediate token on the destination chain
    buyTokenAddress: intermediateToken.address,
    buyTokenChainId,
    buyTokenDecimals: intermediateToken.decimals,
  }

  const bridgeQuote = await provider.getQuote(bridgeRequest)

  // The amount that arrives on the destination chain after bridge fees
  const bridgedAmount = bridgeQuote.amountsAndCosts.afterSlippage.buyAmount

  log(`Bridge quote: ${amount} → ${bridgedAmount} of ${intermediateToken.symbol} on chain ${buyTokenChainId}`)

  // Step 3: Get swap quote on the destination chain (intermediate token → final buy token)
  // This is an indicative quote — the actual order is created on-chain by OrderFlowFactory
  const destinationSwapResult = await getDestinationSwapQuote({
    tradingSdk,
    bridgedAmount,
    intermediateToken,
    buyTokenAddress,
    buyTokenDecimals,
    buyTokenChainId,
    swapAndBridgeRequest,
    signer,
    advancedSettings,
  })

  const destinationBuyAmount = destinationSwapResult.swapResult.amountsAndCosts.afterSlippage.buyAmount
  const estimatedBuyAmount = destinationSwapResult.swapResult.amountsAndCosts.afterPartnerFees.buyAmount

  // Step 4: Compute the OrderFlow address
  const orderFlowAddress = provider.getOrderFlowAddress(owner, buyTokenChainId)

  log(`OrderFlow address for ${owner} on chain ${buyTokenChainId}: ${orderFlowAddress}`)

  // Determine validTo for the destination order
  // Use a generous validity window since we need time for bridge + order settlement
  const validTo = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now

  // Step 5: Encode destination order data
  const receiver = swapAndBridgeRequest.receiver ?? owner
  const destinationOrderParams = {
    sellToken: intermediateToken.address,
    buyToken: buyTokenAddress,
    receiver,
    owner,
    sellAmount: bridgedAmount,
    buyAmount: destinationBuyAmount,
    validTo,
    appData: destinationSwapResult.swapResult.appDataInfo.appDataKeccak256,
    feeAmount: 0n,
    partiallyFillable: false,
    quoteId: undefined as number | undefined,
  }

  const destinationPayload = provider.encodeDestinationOrderData(destinationOrderParams)

  // Step 6: Estimate destination gas
  const baseGasLimit = await provider.getDestinationGasLimit(destinationOrderParams)
  const destinationGasLimit = baseGasLimit + DESTINATION_GAS_BUFFER

  log(`Destination gas limit: ${destinationGasLimit} (${baseGasLimit} + ${DESTINATION_GAS_BUFFER} buffer)`)

  // Step 7: Build bridge transaction
  const bridgeTransaction = await provider.getBridgeTransaction({
    bridgeQuote,
    destinationPayload,
    destinationGasLimit,
  })

  // Prepare bridge result
  const bridgeResult: BridgeQuoteResults = {
    providerInfo: provider.info,
    id: bridgeQuote.id,
    signature: bridgeQuote.signature,
    quoteBody: bridgeQuote.quoteBody,
    tradeParameters: bridgeRequest,
    isSell: bridgeQuote.isSell,
    expectedFillTimeSeconds: bridgeQuote.expectedFillTimeSeconds,
    fees: bridgeQuote.fees,
    limits: bridgeQuote.limits,
    quoteTimestamp: bridgeQuote.quoteTimestamp,
    amountsAndCosts: bridgeQuote.amountsAndCosts,
  }

  // Build buy token info
  const buyTokenInfo: TokenInfo = {
    address: buyTokenAddress,
    decimals: buyTokenDecimals,
    chainId: buyTokenChainId,
    name: destinationSwapResult.swapResult.tradeParameters.buyToken,
    symbol: destinationSwapResult.swapResult.tradeParameters.buyToken,
  }

  // Build sell token info for destination (the intermediate token)
  const destSellTokenInfo: TokenInfo = {
    ...intermediateToken,
    chainId: buyTokenChainId,
  }

  return {
    bridge: bridgeResult,
    destinationSwap: {
      sellToken: destSellTokenInfo,
      buyToken: buyTokenInfo,
      estimatedBuyAmount,
      minBuyAmount: destinationBuyAmount,
      validTo,
      quoteId: undefined,
    },
    orderFlowAddress,
    bridgeTransaction,
    approvalData: undefined, // TODO: Extract from Bungee build-tx approvalData if needed
    submitBridgeTransaction: async (txSigner: SignerLike) => {
      const resolvedSigner = adapter.createSigner(txSigner)
      const txResponse = await resolvedSigner.sendTransaction({
        to: bridgeTransaction.to,
        data: bridgeTransaction.data,
        value: BigInt(bridgeTransaction.value),
      })
      return { txHash: txResponse.hash }
    },
  }
}

interface GetDestinationSwapQuoteParams {
  tradingSdk: TradingSdk
  bridgedAmount: bigint
  intermediateToken: TokenInfo
  buyTokenAddress: string
  buyTokenDecimals: number
  buyTokenChainId: number
  swapAndBridgeRequest: QuoteBridgeRequest
  signer: SignerLike
  advancedSettings?: SwapAdvancedSettings
}

async function getDestinationSwapQuote(
  params: GetDestinationSwapQuoteParams,
): Promise<{ swapResult: QuoteResults }> {
  const {
    tradingSdk,
    bridgedAmount,
    intermediateToken,
    buyTokenAddress,
    buyTokenDecimals,
    buyTokenChainId,
    swapAndBridgeRequest,
    signer,
    advancedSettings,
  } = params

  const {
    kind,
    swapSlippageBps,
    owner,
    account,
    receiver,
  } = swapAndBridgeRequest

  const swapParams: WithPartialTraderParams<TradeParameters> = {
    kind,
    chainId: buyTokenChainId,
    sellToken: intermediateToken.address,
    sellTokenDecimals: intermediateToken.decimals,
    buyToken: buyTokenAddress,
    buyTokenDecimals,
    amount: bridgedAmount.toString(),
    slippageBps: swapSlippageBps,
    signer,
    receiver: receiver ?? owner ?? account,
  }

  log(
    `Getting destination swap quote on chain ${buyTokenChainId}: ${intermediateToken.symbol} → ${buyTokenAddress}. Amount: ${bridgedAmount}`,
  )

  const { result: swapResult } = await tradingSdk.getQuoteResults(swapParams, advancedSettings)

  return { swapResult }
}
