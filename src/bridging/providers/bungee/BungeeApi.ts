import { log } from '../../../common/utils/log'
import { decodeBungeeBridgeTxData, getBungeeBridgeFromDisplayName, objectToSearchParams } from './util'
import {
  AcrossStatus,
  AcrossStatusAPIResponse,
  BungeeBuildTx,
  BungeeBuildTxAPIResponse,
  BungeeBuyTokensAPIResponse,
  BungeeEvent,
  BungeeEventsAPIResponse,
  BungeeQuote,
  BungeeQuoteAPIRequest,
  BungeeQuoteAPIResponse,
  BungeeQuoteWithBuildTx,
  SocketRequest,
  SupportedBridge,
  UserRequestValidation,
} from './types'
import { BridgeProviderQuoteError } from '../../errors'
import { SocketVerifierAddresses } from './const/contracts'
import { ethers } from 'ethers'
import { SOCKET_VERIFIER_ABI } from './abi'
import { SignerLike, TokenInfo } from '../../../common'
import { SupportedChainId, TargetChainId } from '../../../chains'
import { getSigner } from '../../../common/utils/wallet'

const BUNGEE_API_URL = 'https://public-backend.bungee.exchange/api/v1/bungee'
const BUNGEE_MANUAL_API_URL = 'https://public-backend.bungee.exchange/api/v1/bungee-manual'
const BUNGEE_EVENTS_API_URL = 'https://microservices.socket.tech/loki'
const ACROSS_API_URL = 'https://app.across.to/api'

export interface BungeeApiOptions {
  apiBaseUrl?: string
  manualApiBaseUrl?: string
  eventsApiBaseUrl?: string
  acrossApiBaseUrl?: string
  includeBridges?: SupportedBridge[]
}

export class BungeeApi {
  readonly SUPPORTED_BRIDGES: SupportedBridge[] = ['across', 'cctp']

  constructor(
    private readonly options: BungeeApiOptions = {
      apiBaseUrl: BUNGEE_API_URL,
      eventsApiBaseUrl: BUNGEE_EVENTS_API_URL,
      acrossApiBaseUrl: ACROSS_API_URL,
      includeBridges: this.SUPPORTED_BRIDGES,
    },
  ) {
    // throw if any bridge is not supported
    this.validateBridges(this.options.includeBridges ?? this.SUPPORTED_BRIDGES)
  }

  validateBridges(includeBridges: SupportedBridge[]): void {
    if (includeBridges?.some((bridge) => !this.SUPPORTED_BRIDGES.includes(bridge))) {
      throw new BridgeProviderQuoteError(
        `Unsupported bridge: ${includeBridges.filter((bridge) => !this.SUPPORTED_BRIDGES.includes(bridge)).join(', ')}`,
        { includeBridges },
      )
    }
  }

  async getBuyTokens(params: {
    targetChainId: TargetChainId
    includeBridges?: SupportedBridge[]
  }): Promise<TokenInfo[]> {
    const { targetChainId } = params

    // get includeBridges from params or use the default
    const includeBridges = params.includeBridges ?? this.options.includeBridges ?? this.SUPPORTED_BRIDGES

    // validate bridges
    this.validateBridges(includeBridges)

    const urlParams = objectToSearchParams({
      toChainId: targetChainId.toString(),
      includeBridges: includeBridges.join(','),
    })
    const response = await this.makeApiCall<BungeeBuyTokensAPIResponse>('bungee-manual', '/dest-tokens', urlParams)
    return response.result.map((token) => ({
      // transform the logoURI to a logoUrl to match the TokenInfo interface
      // keep the rest as is
      ...token,
      logoUrl: token.logoURI,
    }))
  }

  /**
   * Makes a GET request to Bungee APIs for quote and build tx
   */
  async getBungeeQuoteWithBuildTx(params: BungeeQuoteAPIRequest): Promise<BungeeQuoteWithBuildTx> {
    const bungeeQuote = await this.getBungeeQuote(params)
    const buildTx = await this.getBungeeBuildTx(bungeeQuote)
    return {
      bungeeQuote,
      buildTx,
    }
  }

  /**
   * Makes a GET request to Bungee APIs for quote
   * https://docs.bungee.exchange/bungee-api/api-reference/bungee-controller-quote-v-1
   */
  async getBungeeQuote(params: BungeeQuoteAPIRequest): Promise<BungeeQuote> {
    try {
      // if no bridges are provided, use all supported bridges
      params.includeBridges = params.includeBridges ?? this.options.includeBridges ?? this.SUPPORTED_BRIDGES

      // throw if any bridge is not supported
      this.validateBridges(params.includeBridges)

      const urlParams = objectToSearchParams(params)
      const response = await this.makeApiCall<BungeeQuoteAPIResponse>(
        'bungee',
        '/quote',
        urlParams,
        isValidQuoteResponse,
      )
      if (!response.success) {
        throw new BridgeProviderQuoteError('Bungee Api Error: Quote failed', response)
      }
      // prepare quote timestamp from current timestamp
      const quoteTimestamp = Math.floor(Date.now() / 1000)

      // check if manualRoutes is empty
      const { manualRoutes } = response.result
      if (manualRoutes.length === 0) {
        throw new BridgeProviderQuoteError('No routes found', response.result)
      }

      // Ensure we have a valid route with details
      const firstRoute = manualRoutes[0]
      if (!firstRoute?.routeDetails?.name) {
        throw new BridgeProviderQuoteError('Invalid route: missing route details or name', { manualRoutes })
      }

      // validate bridge name
      const bridgeName = getBungeeBridgeFromDisplayName(firstRoute.routeDetails.name)

      if (!bridgeName) {
        throw new BridgeProviderQuoteError('Invalid bridge name', { firstRoute })
      }

      // sort manual routes by output
      // @todo do we give users the option to choose bw time and output and any other factors?
      const sortedManualRoutes = manualRoutes.sort((a, b) => {
        return Number(b.output.amount) - Number(a.output.amount)
      })

      // refactor the response
      const bungeeQuote: BungeeQuote = {
        originChainId: response.result.originChainId,
        destinationChainId: response.result.destinationChainId,
        userAddress: response.result.userAddress,
        receiverAddress: response.result.receiverAddress,
        input: response.result.input,
        route: sortedManualRoutes[0],
        routeBridge: bridgeName,
        quoteTimestamp,
      }

      return bungeeQuote
    } catch (error) {
      console.error('🔴 Error getting bungee quote:', error)
      throw error
    }
  }

  /**
   * Makes a GET request to Bungee APIs for build tx
   * https://docs.bungee.exchange/bungee-api/api-reference/bungee-controller-build-tx-v-1
   */
  async getBungeeBuildTx(quote: BungeeQuote): Promise<BungeeBuildTx> {
    const response = await this.makeApiCall<BungeeBuildTxAPIResponse>('bungee', '/build-tx', {
      quoteId: quote.route.quoteId,
    })
    if (!response.success) {
      throw new BridgeProviderQuoteError('Bungee Api Error: Build tx failed', response)
    }
    return response.result
  }

  /**
   * Verifies the build tx data for a quote using the SocketVerifier contract
   * @param quote - The quote object
   * @param buildTx - The build tx object
   * @param signer - The signer object
   * @returns True if the build tx data is valid, false otherwise
   */
  async verifyBungeeBuildTx(quote: BungeeQuote, buildTx: BungeeBuildTx, signer: SignerLike): Promise<boolean> {
    const { routeId, functionSelector } = decodeBungeeBridgeTxData(buildTx.txData.data)

    const expectedSocketRequest: SocketRequest = {
      amount: quote.input.amount,
      recipient: quote.receiverAddress,
      toChainId: quote.destinationChainId.toString(),
      token: quote.input.token.address,
      signature: functionSelector,
    }
    return this.verifyBungeeBuildTxData(
      quote.originChainId,
      buildTx.txData.data,
      routeId,
      expectedSocketRequest,
      signer,
    )
  }

  /**
   * Verifies the bungee tx data using the SocketVerifier contract
   * @param originChainId - The origin chain id
   * @param txData - The tx data
   * @param routeId - The route id
   * @param expectedSocketRequest - The expected socket request
   * @param signer - The signer object
   * @returns True if the bungee tx data is valid, false otherwise
   */
  async verifyBungeeBuildTxData(
    originChainId: SupportedChainId,
    txData: string,
    routeId: string,
    expectedSocketRequest: SocketRequest,
    signer: SignerLike,
  ): Promise<boolean> {
    const _signer = getSigner(signer)
    const socketVerifierAddress = SocketVerifierAddresses[originChainId]

    if (!socketVerifierAddress) {
      throw new BridgeProviderQuoteError(`Socket verifier not found`, { originChainId })
    }

    const SocketVerifier = new ethers.Contract(socketVerifierAddress, SOCKET_VERIFIER_ABI, _signer)

    // should not revert
    try {
      await SocketVerifier.callStatic.validateRotueId(txData, routeId)
    } catch (error) {
      console.error('🔴 Error validating routeId:', error)
      return false
    }

    const expectedUserRequestValidation: UserRequestValidation = {
      routeId,
      socketRequest: expectedSocketRequest,
    }

    // should not revert
    try {
      await SocketVerifier.callStatic.validateSocketRequest(txData, expectedUserRequestValidation)
    } catch (error) {
      console.error('🔴 Error validating socket request:', error)
      return false
    }

    return true
  }

  async getEvents(params: { orderId: string }): Promise<BungeeEvent[]> {
    const response = await this.makeApiCall<BungeeEventsAPIResponse>(
      'events',
      '/order',
      {
        orderId: params.orderId,
      },
      isValidBungeeEventsResponse,
    )
    if (!response.success) {
      throw new BridgeProviderQuoteError('Bungee Events Api Error', response)
    }
    return response.result
  }

  async getAcrossStatus(depositTxHash: string): Promise<AcrossStatus> {
    const response = await this.makeApiCall<AcrossStatusAPIResponse>(
      'across',
      '/deposit/status',
      {
        depositTxHash,
      },
      isValidAcrossStatusResponse,
    )
    return response.status
  }

  private async makeApiCall<T>(
    apiType: 'bungee' | 'events' | 'across' | 'bungee-manual',
    path: string,
    params: Record<string, string> | URLSearchParams,
    isValidResponse?: (response: unknown) => response is T,
  ): Promise<T> {
    const baseUrlMap = {
      bungee: this.options.apiBaseUrl || BUNGEE_API_URL,
      events: this.options.eventsApiBaseUrl || BUNGEE_EVENTS_API_URL,
      across: this.options.acrossApiBaseUrl || ACROSS_API_URL,
      'bungee-manual': this.options.manualApiBaseUrl || BUNGEE_MANUAL_API_URL,
    }

    const errorMessageMap = {
      bungee: 'Bungee Api Error',
      events: 'Bungee Events Api Error',
      across: 'Across Api Error',
      'bungee-manual': 'Bungee Manual Api Error',
    }

    const baseUrl = baseUrlMap[apiType]
    const url = `${baseUrl}${path}?${new URLSearchParams(params).toString()}`

    log(`Fetching ${apiType} API: GET ${url}. Params: ${JSON.stringify(params)}`)

    const response = await fetch(url, { method: 'GET' })

    if (!response.ok) {
      const errorBody = await response.json()
      throw new BridgeProviderQuoteError(errorMessageMap[apiType], errorBody)
    }

    const json = await response.json()
    if (isValidResponse && !isValidResponse(json)) {
      throw new BridgeProviderQuoteError(
        `Invalid response for ${apiType} API call ${path}. The response doesn't pass the validation. Did the API change?`,
        json,
      )
    }

    return json
  }
}

/**
 * Validate the response from the Bungee API is a SuggestedFeesResponse
 *
 * @param response - The response from the Bungee API
 * @returns True if the response is a QuoteResponse, false otherwise
 */
function isValidQuoteResponse(response: unknown): response is BungeeQuoteAPIResponse {
  if (typeof response !== 'object' || response === null) {
    return false
  }

  const resp = response as Record<string, unknown>

  // Check top level fields
  if (
    !('success' in resp) ||
    !('statusCode' in resp) ||
    !('result' in resp) ||
    typeof resp.success !== 'boolean' ||
    typeof resp.statusCode !== 'number'
  ) {
    return false
  }

  const result = resp.result
  if (typeof result !== 'object' || result === null) {
    return false
  }

  const res = result as Record<string, unknown>

  // Check required fields in result
  if (
    !('originChainId' in res) ||
    !('destinationChainId' in res) ||
    !('userAddress' in res) ||
    !('receiverAddress' in res) ||
    !('manualRoutes' in res) ||
    !Array.isArray(res.manualRoutes)
  ) {
    return false
  }

  // Validate manual routes array
  return res.manualRoutes.every((route) => {
    if (typeof route !== 'object' || route === null) {
      return false
    }

    const r = route

    // Check if routeDetails exists
    if (!('routeDetails' in r) || typeof r.routeDetails !== 'object' || r.routeDetails === null) {
      return false
    }

    // Validate if route.routeDetails.routeFee.amount exists
    if (!('routeFee' in r.routeDetails)) {
      return false
    }
    const routeFee = r.routeDetails.routeFee
    if (typeof routeFee !== 'object' || routeFee === null) {
      return false
    }
    if (!('amount' in routeFee)) {
      return false
    }

    return (
      'quoteId' in r &&
      'quoteExpiry' in r &&
      'output' in r &&
      'gasFee' in r &&
      'slippage' in r &&
      'estimatedTime' in r &&
      'routeDetails' in r
    )
  })
}

function isValidBungeeEventsResponse(response: unknown): response is BungeeEventsAPIResponse {
  if (typeof response !== 'object' || response === null) {
    return false
  }

  const resp = response as Record<string, unknown>

  // Check top level fields
  if (!('success' in resp) || !('result' in resp) || typeof resp.success !== 'boolean' || !Array.isArray(resp.result)) {
    return false
  }

  // Validate each event in the result array
  return resp.result.every((event) => {
    if (typeof event !== 'object' || event === null) {
      return false
    }

    const e = event as Record<string, unknown>

    // Check required fields
    return (
      'identifier' in e &&
      'bridgeName' in e &&
      'fromChainId' in e &&
      'isCowswapTrade' in e &&
      'orderId' in e &&
      'recipient' in e &&
      'sender' in e &&
      'srcTxStatus' in e &&
      'destTxStatus' in e
    )
  })
}

function isValidAcrossStatusResponse(response: unknown): response is AcrossStatusAPIResponse {
  if (typeof response !== 'object' || response === null) {
    return false
  }

  const resp = response as Record<string, unknown>

  if (!('status' in resp)) {
    return false
  }

  return true
}
