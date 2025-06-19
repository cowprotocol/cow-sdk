import { Signer } from 'ethers'
import { latest as latestAppData } from '@cowprotocol/app-data'
import { JsonRpcProvider } from '@ethersproject/providers'
import { OrderKind } from '@cowprotocol/contracts'

import {
  BridgeDeposit,
  BridgeHook,
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatus,
  BridgeStatusResult,
  BridgingDepositParams,
  QuoteBridgeRequest,
} from '../../types'
import { DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION, RAW_PROVIDERS_FILES_PATH } from '../../const'
import { ChainId, ChainInfo, SupportedChainId, TargetChainId } from '../../../chains'
import { EvmCall, TokenInfo } from '../../../common'
import { mainnet } from '../../../chains/details/mainnet'
import { polygon } from '../../../chains/details/polygon'
import { arbitrumOne } from '../../../chains/details/arbitrum'
import { base } from '../../../chains/details/base'
import { optimism } from '../../../chains/details/optimism'
import { BungeeApi, BungeeApiOptions } from './BungeeApi'
import { toBridgeQuoteResult } from './util'
import { CowShedSdk, CowShedSdkOptions } from '../../../cow-shed'
import { createBungeeDepositCall } from './createBungeeDepositCall'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from './const/misc'
import { BungeeBridgeName, BungeeBuildTx, BungeeEventStatus, BungeeQuote, BungeeQuoteAPIRequest } from './types'
import { getSigner } from '../../../common/utils/wallet'
import { BridgeProviderQuoteError } from '../../errors'

export const BUNGEE_HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/bungee`
export const BUNGEE_SUPPORTED_NETWORKS = [mainnet, polygon, arbitrumOne, base, optimism]

/** There will be no dex swaps happening while bridging. Hence slippage will be zero */
const SLIPPAGE_TOLERANCE_BPS = 0

export interface BungeeBridgeProviderOptions {
  // API options
  apiOptions?: BungeeApiOptions

  // Cow-shed options
  cowShedOptions?: CowShedSdkOptions
}

export interface BungeeQuoteResult extends BridgeQuoteResult {
  bungeeQuote: BungeeQuote
  buildTx: BungeeBuildTx
}

export class BungeeBridgeProvider implements BridgeProvider<BungeeQuoteResult> {
  protected api: BungeeApi
  protected cowShedSdk: CowShedSdk

  constructor(private options: BungeeBridgeProviderOptions = {}) {
    this.api = new BungeeApi(options.apiOptions)
    this.cowShedSdk = new CowShedSdk(options.cowShedOptions)
  }

  info: BridgeProviderInfo = {
    name: 'Bungee',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/bungee/bungee-logo.png`,
    dappId: BUNGEE_HOOK_DAPP_ID,
    website: 'https://www.bungee.exchange',
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return BUNGEE_SUPPORTED_NETWORKS
  }

  async getBuyTokens(targetChainId: TargetChainId): Promise<TokenInfo[]> {
    return this.api.getBuyTokens({ targetChainId })
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<TokenInfo[]> {
    if (request.kind !== OrderKind.SELL) {
      throw new BridgeProviderQuoteError('Only SELL is supported for now', { kind: request.kind })
    }

    return this.api.getIntermediateTokens({
      fromChainId: request.sellTokenChainId,
      toChainId: request.buyTokenChainId,
      toTokenAddress: request.buyTokenAddress,
    })
  }

  async getQuote(request: QuoteBridgeRequest): Promise<BungeeQuoteResult> {
    // @note sellTokenAddress here will be the intermediate token in usage. the naming might be a bit misleading
    //       see getQuoteWithBridge.ts::getBaseBridgeQuoteRequest()
    const { sellTokenAddress, sellTokenChainId, buyTokenChainId, buyTokenAddress, amount, receiver, account, owner } =
      request

    // @note bungee api requires the sender address. sender address would be the cowshed account
    // fetch the cowshed account
    const ownerAddress = owner ?? account
    const cowshedAccount = this.cowShedSdk.getCowShedAccount(sellTokenChainId, ownerAddress)

    // fetch quote from bungee api
    const bungeeQuoteRequest: BungeeQuoteAPIRequest = {
      userAddress: cowshedAccount,
      originChainId: sellTokenChainId.toString(),
      destinationChainId: buyTokenChainId.toString(),
      inputToken: sellTokenAddress, // use intermediate token for the bridging quote
      inputAmount: amount.toString(),
      receiverAddress: receiver ?? account, // receiver is required on bungee api
      outputToken: buyTokenAddress,
      includeBridges: this.options.apiOptions?.includeBridges,
      enableManual: true,
      disableSwapping: true,
      disableAuto: true,
    }
    const quoteWithBuildTx = await this.api.getBungeeQuoteWithBuildTx(bungeeQuoteRequest)

    // verify build-tx data
    const isBuildTxValid = await this.api.verifyBungeeBuildTx(
      quoteWithBuildTx.bungeeQuote,
      quoteWithBuildTx.buildTx,
      getSigner(request.signer),
    )

    if (!isBuildTxValid) {
      throw new BridgeProviderQuoteError('Build tx data is invalid', quoteWithBuildTx)
    }

    // convert bungee quote response to BridgeQuoteResult
    return toBridgeQuoteResult(request, SLIPPAGE_TOLERANCE_BPS, quoteWithBuildTx)
  }

  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: BungeeQuoteResult): Promise<EvmCall> {
    return createBungeeDepositCall({
      request,
      quote,
      cowShedSdk: this.cowShedSdk,
    })
  }

  getGasLimitEstimationForHook(_request: QuoteBridgeRequest): number {
    return DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION
  }

  async getSignedHook(
    chainId: SupportedChainId,
    unsignedCall: EvmCall,
    signer: Signer,
    bridgeHookNonce: string,
    deadline: bigint,
    defaultGasLimit?: bigint,
  ): Promise<BridgeHook> {
    // Sign the multicall
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
      defaultGasLimit,
      deadline,
      nonce: bridgeHookNonce,
    })

    const { to, data } = signedMulticall
    return {
      postHook: {
        target: to,
        callData: data,
        gasLimit: gasLimit.toString(),
        dappId: BUNGEE_HOOK_DAPP_ID,
      },
      recipient: cowShedAccount,
    }
  }

  async getBridgingParams(
    _chainId: ChainId,
    _provider: JsonRpcProvider,
    orderId: string,
    _txHash: string,
  ): Promise<BridgingDepositParams | null> {
    const events = await this.api.getEvents({ orderId })
    const event = events[0]

    if (!event) return null

    return {
      inputTokenAddress: event.srcTokenAddress,
      outputTokenAddress: event.destTokenAddress,
      inputAmount: BigInt(event.srcAmount),
      outputAmount: event.destAmount ? BigInt(event.destAmount) : null,
      owner: event.sender,
      quoteTimestamp: null,
      fillDeadline: null,
      recipient: event.recipient,
      sourceChainId: event.fromChainId,
      destinationChainId: event.toChainId,
      bridgingId: orderId,
    }
  }

  async decodeBridgeHook(_hook: latestAppData.CoWHook): Promise<BridgeDeposit> {
    // Decoding the full quote from just hook calldata is quite hard right now
    // This will need more context and thus changes to either the hook calldata or the function interface
    // Can revisit once the approach is decided
    throw new Error('Not implemented')
  }

  async getBridgingId(_orderUid: string, _settlementTx: string, _logIndex: number): Promise<string> {
    // order uid itself can be used as bridging id on Bungee
    return _orderUid
  }

  getExplorerUrl(bridgingId: string): string {
    return `https://socketscan.io/tx/${bridgingId}`
  }

  async getStatus(_bridgingId: string): Promise<BridgeStatusResult> {
    // fetch indexed event from api
    const events = await this.api.getEvents({ orderId: _bridgingId })

    // if empty, return not_initiated
    // order id exists so order is valid, but
    // - bungee may not have indexed the event yet, which it will do eventually
    // - or the order is not filled yet on cowswap
    if (!events?.length) {
      return { status: BridgeStatus.UNKNOWN }
    }
    const event = events[0]

    // if srcTxStatus = pending, return in_progress
    if (event.srcTxStatus === BungeeEventStatus.PENDING) {
      return { status: BridgeStatus.IN_PROGRESS }
    }

    // if srcTxStatus = completed & destTxStatus = pending,
    if (event.srcTxStatus === BungeeEventStatus.COMPLETED && event.destTxStatus === BungeeEventStatus.PENDING) {
      // if bridgeName = across,
      if (event.bridgeName === BungeeBridgeName.ACROSS) {
        try {
          // check across api to check status is expired or refunded
          const acrossStatus = await this.api.getAcrossStatus(event.orderId)
          if (acrossStatus === 'expired') {
            return { status: BridgeStatus.EXPIRED, depositTxHash: event.srcTransactionHash }
          }
          if (acrossStatus === 'refunded') {
            // refunded means failed
            return { status: BridgeStatus.REFUND, depositTxHash: event.srcTransactionHash }
          }
        } catch (e) {
          console.error('BungeeBridgeProvider get across status error', e)
        }
      }
      // if not across or across API fails, waiting for dest tx, return in_progress
      return { status: BridgeStatus.IN_PROGRESS, depositTxHash: event.srcTransactionHash }
    }

    // if srcTxStatus = completed & destTxStatus = completed, return executed
    if (event.srcTxStatus === BungeeEventStatus.COMPLETED && event.destTxStatus === BungeeEventStatus.COMPLETED) {
      return {
        status: BridgeStatus.EXECUTED,
        depositTxHash: event.srcTransactionHash,
        fillTxHash: event.destTransactionHash,
      }
    }

    // there is no failed case for across - gets auto-refunded - or cctp - attestation can be relayed by anyone on destination chain
    throw new Error('Unknown status')
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    // Support for cancellation will depend on the actual bridge an order went through.
    // Across & CCTP doesn't support cancellation.
    // Therefore, not implementing cancellation
    throw new Error('Not implemented')
  }

  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    // Support for refund will depend on the actual bridge an order went through.
    // CCTP doesn't support refund.
    // Across auto-relays refund txns some time after the order expires. No user action needed.
    // Therefore, not implementing refund
    throw new Error('Not implemented')
  }
}
