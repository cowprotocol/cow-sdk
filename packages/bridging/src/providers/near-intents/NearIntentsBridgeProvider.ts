import { getGlobalAdapter, setGlobalAdapter } from '@cowprotocol/sdk-common'
import { ETH_ADDRESS } from '@cowprotocol/sdk-config'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { createWeirollContract, createWeirollDelegateCall, WeirollCommandFlags } from '@cowprotocol/sdk-weiroll'
import { QuoteRequest } from '@defuse-protocol/one-click-sdk-typescript'
import { encodeFunctionData, erc20Abi } from 'viem'
import { BridgeStatus } from '../../types'

import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX, RAW_PROVIDERS_FILES_PATH } from '../../const'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { getCowTradeEvents } from '../../providers/across/util'
import { getGasLimitEstimationForHook } from '../utils/getGasLimitEstimationForHook'
import { NearIntentsApi } from './NearIntentsApi'
import {
  NEAR_INTENTS_BLOCKCHAIN_TO_NATIVE_WRAPPED_TOKEN_ADDRESS,
  NEAR_INTENTS_STATUS_TO_COW_STATUS,
  NEAR_INTENTS_SUPPORTED_NETWORKS,
} from './const'
import { adaptToken, adaptTokens, calculateDeadline, getTokenByAddressAndChainId } from './util'

import type { cowAppDataLatestScheme as latestAppData } from '@cowprotocol/sdk-app-data'
import type { AbstractProviderAdapter, SignerLike } from '@cowprotocol/sdk-common'
import type { ChainId, ChainInfo, EvmCall, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import type { CowShedSdkOptions } from '@cowprotocol/sdk-cow-shed'
import type { Hex } from 'viem'
import type {
  BridgeDeposit,
  BridgeHook,
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  BridgingDepositParams,
  BuyTokensParams,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
} from '../../types'

export interface NearIntentsQuoteResult extends BridgeQuoteResult {
  depositAddress: Hex
}

export const NEAR_INTENTS_HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/near-intents`

export interface NearIntentsBridgeProviderOptions {
  cowShedOptions?: CowShedSdkOptions
}

export class NearIntentsBridgeProvider implements BridgeProvider<NearIntentsQuoteResult> {
  protected api: NearIntentsApi
  protected cowShedSdk: CowShedSdk

  info: BridgeProviderInfo = {
    name: 'Near Intents',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/near-intents/near-intents-logo.png`, // todo
    dappId: NEAR_INTENTS_HOOK_DAPP_ID,
    website: 'https://www.near.org/intents',
  }

  constructor(options?: NearIntentsBridgeProviderOptions, _adapter?: AbstractProviderAdapter) {
    const adapter = _adapter || options?.cowShedOptions?.adapter
    if (adapter) {
      setGlobalAdapter(adapter)
    }
    this.api = new NearIntentsApi()
    this.cowShedSdk = new CowShedSdk(adapter, options?.cowShedOptions?.factoryOptions)
  }

  async getNetworks(): Promise<ChainInfo[]> {
    // TODO: non evm networks?
    return NEAR_INTENTS_SUPPORTED_NETWORKS
  }

  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    const tokens = adaptTokens(await this.api.getTokens())
    return {
      tokens: tokens.filter((token) => token.chainId === params.buyChainId),
      isRouteAvailable: tokens.length > 0,
    }
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<TokenInfo[]> {
    if (request.kind !== OrderKind.SELL) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED, { kind: request.kind })
    }

    const { sellTokenChainId, buyTokenChainId, buyTokenAddress } = request

    const tokens = adaptTokens(await this.api.getTokens())
    const sourceTokens = tokens.filter((token) => token.chainId === sellTokenChainId)
    const targetTokens = tokens.filter((token) => token.chainId === buyTokenChainId)

    const wrappedTokenAddresses = Object.values(NEAR_INTENTS_BLOCKCHAIN_TO_NATIVE_WRAPPED_TOKEN_ADDRESS).map((a) =>
      a.toLowerCase(),
    )
    const buyTokens = targetTokens.find((token) => {
      // Supports both the native token and its wrapped version (e.g. POL and WPOL, where POL is represented by ETH_ADDRESS).
      if (token.address === ETH_ADDRESS || wrappedTokenAddresses.includes(token.address.toLowerCase()))
        return token.chainId === buyTokenChainId
      return token.address.toLowerCase() === buyTokenAddress.toLowerCase()
    })
    if (!buyTokens) return []

    // If buyToken is supported, all source tokens can be used to buy buyToken
    return sourceTokens
  }

  async getQuote(request: QuoteBridgeRequest): Promise<NearIntentsQuoteResult> {
    const {
      sellTokenAddress,
      sellTokenChainId,
      buyTokenAddress,
      buyTokenChainId,
      account,
      amount,
      receiver,
      validFor,
      owner,
    } = request
    const tokens = await this.api.getTokens()

    const sellToken = getTokenByAddressAndChainId(tokens, sellTokenAddress, sellTokenChainId)
    const buyToken = getTokenByAddressAndChainId(tokens, buyTokenAddress, buyTokenChainId)
    if (!sellToken || !buyToken) throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES)

    const { quote, timestamp: isoDate } = await this.api.getQuote({
      dry: false,
      swapType: QuoteRequest.swapType.EXACT_INPUT,
      slippageTolerance: request.slippageBps || 100, // fallback to 1%,
      originAsset: sellToken.assetId,
      depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
      destinationAsset: buyToken.assetId,
      amount: amount.toString(),
      refundTo: owner || account,
      refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
      recipient: receiver || account,
      recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
      deadline: calculateDeadline(validFor || 3600),
    })

    const slippage = (1 - Number(quote.amountOutUsd) / Number(quote.amountInUsd)) * 100

    return {
      isSell: request.kind === OrderKind.SELL,
      depositAddress: quote.depositAddress as Hex,
      quoteTimestamp: new Date(isoDate).getTime(),
      expectedFillTimeSeconds: quote.timeEstimate,
      limits: {
        minDeposit: BigInt(quote.minAmountIn),
        maxDeposit: BigInt(quote.amountIn),
      },
      fees: {
        bridgeFee: BigInt(0),
        destinationGasFee: BigInt(0),
      },
      amountsAndCosts: {
        beforeFee: {
          sellAmount: BigInt(quote.amountOut),
          buyAmount: BigInt(quote.amountIn),
        },
        afterFee: {
          sellAmount: BigInt(quote.amountOut),
          buyAmount: BigInt(quote.amountIn),
        },
        afterSlippage: {
          sellAmount: BigInt(quote.minAmountOut),
          buyAmount: BigInt(quote.minAmountIn),
        },
        slippageBps: Math.trunc(slippage * 100),
        costs: {
          bridgingFee: {
            feeBps: 0,
            amountInSellCurrency: BigInt(0),
            amountInBuyCurrency: BigInt(0),
          },
        },
      },
    }
  }

  // Two possible execution paths for delivering `buyToken` to NEAR Intents:
  //
  // 1) Through CoWShed (call getUnsignedBridgeCall)
  //    - Funds first pass through the CoWShed hook contract.
  //    - The hook then forwards them to the NEAR Intents deposit address.
  //
  // 2) Direct transfer (call getUnsignedBridgeCallWithoutHooks)
  //    - Sends funds straight to the NEAR Intents deposit address.
  //    - No approvals or hooks are involved.
  //
  // Note: the calldata for the ERC20 `transfer` is identical in both flows —
  // only the sender differs (user → deposit address vs CowShed account → deposit address).

  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: NearIntentsQuoteResult): Promise<EvmCall> {
    // Case 1: Called via a CoWShed account
    // - Funds are routed through the hook.
    // - The hook performs the ERC20 `transfer` to the NEAR Intents deposit address on behalf of the user.

    const { account, sellTokenAddress, sellTokenChainId } = request
    const { depositAddress } = quote

    const cowShedAccount = this.cowShedSdk.getCowShedAccount(sellTokenChainId, account)

    const adapter = getGlobalAdapter()
    return createWeirollDelegateCall((planner) => {
      const amount = planner.add(
        createWeirollContract(
          adapter.getContract(sellTokenAddress, erc20Abi),
          WeirollCommandFlags.STATICCALL,
        ).balanceOf(cowShedAccount),
      )
      planner.add(
        createWeirollContract(adapter.getContract(sellTokenAddress, erc20Abi), WeirollCommandFlags.CALL).transfer(
          depositAddress,
          amount,
        ),
      )
    })
  }

  // Because direct transfers to a NEAR Intents deposit address require changes to the CoW SDK,
  // and there’s no reliable way to check whether `getUnsignedBridgeCall` is invoked for a CoWShed account,
  // we introduced a separate function (`getUnsignedBridgeCallWithoutHooks`) for that scenario.
  // The original `getUnsignedBridgeCall` remains dedicated to hook-based flows, generating
  // calldata for execution via the CoWShed account.
  async getUnsignedBridgeCallWithoutHooks(
    request: QuoteBridgeRequest,
    quote: NearIntentsQuoteResult,
  ): Promise<EvmCall> {
    // Case 2: Called directly (not via CoWShed)
    // - The `owner` must match the provided `account`.
    // - Funds are sent straight to the NEAR Intents deposit address.
    // - Execution differs depending on whether the asset is native or an ERC20.

    const { sellTokenAddress } = request
    const {
      depositAddress,
      amountsAndCosts: {
        beforeFee: { sellAmount },
      },
    } = quote

    if (sellTokenAddress.toLowerCase() === ETH_ADDRESS.toLowerCase()) {
      // Direct native token transfer
      return {
        to: depositAddress,
        value: sellAmount,
        data: '0x',
      }
    } else {
      // Direct ERC20 transfer
      return {
        to: sellTokenAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [depositAddress, sellAmount],
        }),
      }
    }
  }

  async getGasLimitEstimationForHook(request: QuoteBridgeRequest): Promise<number> {
    return getGasLimitEstimationForHook({
      cowShedSdk: this.cowShedSdk,
      request,
    })
  }

  async getSignedHook(
    chainId: SupportedChainId,
    unsignedCall: EvmCall,
    bridgeHookNonce: string,
    deadline: bigint,
    hookGasLimit: number,
    signer?: SignerLike,
  ): Promise<BridgeHook> {
    // Call this function only when using CowShed accounts — i.e.
    // when a CoW swap must be executed before depositing into NEAR Intents.
    const { signedMulticall, cowShedAccount, gasLimit } = await this.cowShedSdk.signCalls({
      calls: [
        {
          target: unsignedCall.to,
          value: unsignedCall.value,
          callData: unsignedCall.data,
          allowFailure: false,
          isDelegateCall: true,
        },
      ],
      chainId,
      signer,
      gasLimit: BigInt(hookGasLimit),
      deadline,
      nonce: bridgeHookNonce,
    })

    const { to, data } = signedMulticall
    return {
      postHook: {
        target: to,
        callData: data,
        gasLimit: gasLimit.toString(),
        dappId: NEAR_INTENTS_HOOK_DAPP_ID,
      },
      recipient: cowShedAccount,
    }
  }

  decodeBridgeHook(hook: latestAppData.CoWHook): Promise<BridgeDeposit> {
    throw new Error('Not implemented')
  }

  async getBridgingParams(
    chainId: ChainId,
    orderUid: string,
    txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    // Two possible flows:
    // 1. Indirect transfer → funds first move through the hook contract before reaching the deposit address.
    //    Example: to swap CRV → AVAX via CoW + NEAR Intents, the flow is:
    //      - Sell CRV for USDC on CoW.
    //      - The hook contract receives USDC, then forwards it to the NEAR Intents deposit address.
    //      - NEAR Intents uses that USDC to complete the swap into AVAX.
    // 2. Direct transfer → funds are sent straight to the NEAR Intents deposit address.
    const adapter = getGlobalAdapter()
    const receipt = await adapter.getTransactionReceipt(txHash)
    if (!receipt) return null

    const tradeEvent = (await getCowTradeEvents(chainId, receipt.logs)).find((event) => event.orderUid === orderUid)
    if (!tradeEvent) {
      // TODO: Handle the case where the buyToken is sent directly to the NEAR Intents deposit address.
      // In that scenario, the TransactionReceipt should expose `.to` (the recipient address or the token contract address).
      // Currently, `.to` is not included in the receipt, so direct deposits cannot be resolved yet.
      throw new Error(`Trade event not found for orderUid=${orderUid}`)
    }

    // Identify the recipient addresses of the buyToken transfer.
    // Example: to swap CRV → AVAX via CoW + NEAR Intents, the flow is:
    //   1. Sell CRV for USDC on CoW.
    //   2. Sell USDC for AVAX on NEAR Intents.
    // This filter extracts the ERC20 Transfer logs of the buyToken (e.g. USDC)
    // that exactly match the buyAmount from the CoW trade.
    const buyTokenTransfersReceivers = receipt.logs
      .filter(
        (log) =>
          log.address.toLowerCase() === tradeEvent.buyToken.toLowerCase() &&
          log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' &&
          log.topics[1] !== '0x0000000000000000000000000000000000000000000000000000000000000000' &&
          log.topics[2] !== '0x0000000000000000000000000000000000000000000000000000000000000000' &&
          BigInt(log.data) === BigInt(tradeEvent.buyAmount),
      )
      .map((log) => `0x${log.topics[2]?.slice(26)}`)

    // Resolve the unique EOA (Externally Owned Account) among the buyToken transfer recipients.
    // A deposit address on NEAR Intents must be an EOA (no contract code).
    // We fetch the code for each address and filter out any contracts.
    // Expect exactly one valid EOA → the NEAR Intents deposit address.
    const eoaAddresses = (
      await Promise.all(buyTokenTransfersReceivers.map((address) => adapter.getCode(address)))
    ).filter((code) => code === '0x')
    if (eoaAddresses.length !== 1) {
      throw new Error('Failed to retrieve the deposit address')
    }

    // Resolve tokens + status in parallel
    const depositAddress = eoaAddresses[0]!
    const [tokens, status] = await Promise.all([this.api.getTokens(), this.api.getStatus(depositAddress)])

    // Unpack quote data
    const qr = status.quoteResponse?.quoteRequest
    const quote = status.quoteResponse?.quote
    const timestampMs = Date.parse(status.quoteResponse?.timestamp ?? '')
    if (!qr || !quote || Number.isNaN(timestampMs)) {
      throw new Error('Malformed quote response from NEAR Intents')
    }

    const quoteTimestamp = Math.floor(timestampMs / 1000)

    // Locate origin/destination tokens
    const inputToken = tokens.find((t) => t.assetId === qr.originAsset)
    const outputToken = tokens.find((t) => t.assetId === qr.destinationAsset)
    if (!inputToken || !outputToken) throw new Error('Token not supported')

    // Normalize to local token shape
    const adaptedInput = adaptToken(inputToken)
    const adaptedOutput = adaptToken(outputToken)
    if (!adaptedInput?.chainId || !adaptedOutput?.chainId) {
      throw new Error('Token not supported')
    }

    // Build response
    return {
      status: {
        fillTimeInSeconds: quote.timeEstimate,
        status: NEAR_INTENTS_STATUS_TO_COW_STATUS[status.status] ?? BridgeStatus.UNKNOWN,
        fillTxHash: status.swapDetails?.destinationChainTxHashes?.[0]?.hash,
      },
      params: {
        inputTokenAddress: inputToken.contractAddress ?? ETH_ADDRESS,
        outputTokenAddress: outputToken.contractAddress ?? ETH_ADDRESS,
        inputAmount: BigInt(quote.amountIn),
        outputAmount: BigInt(quote.amountOut),
        owner: tradeEvent.owner,
        quoteTimestamp,
        fillDeadline: quoteTimestamp + quote.timeEstimate,
        recipient: qr.recipient,
        sourceChainId: adaptedInput.chainId,
        destinationChainId: adaptedOutput.chainId,
        bridgingId: depositAddress, // NEAR Intents deposit address
      },
    }
  }

  getExplorerUrl(bridgingId: string): string {
    return `https://explorer.near-intents.org/transactions/${bridgingId}`
  }

  async getStatus(bridgingId: string, originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    // bridingId must be the deposit address
    try {
      const statusResponse = await this.api.getStatus(bridgingId)
      return {
        status: NEAR_INTENTS_STATUS_TO_COW_STATUS[statusResponse.status] || BridgeStatus.UNKNOWN,
        depositTxHash: statusResponse.swapDetails.originChainTxHashes[0]?.hash,
        fillTxHash: statusResponse.swapDetails.destinationChainTxHashes[0]?.hash,
      }
    } catch {
      return {
        status: BridgeStatus.UNKNOWN,
      }
    }
  }

  getCancelBridgingTx(bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }

  getRefundBridgingTx(bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
}

export default NearIntentsBridgeProvider
