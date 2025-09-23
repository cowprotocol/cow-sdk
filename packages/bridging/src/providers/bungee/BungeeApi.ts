import { decodeBungeeBridgeTxData, getBungeeBridgeFromDisplayName, objectToSearchParams } from './util'
import {
  AcrossStatus,
  AcrossStatusAPIResponse,
  BungeeApiOptions,
  BungeeBuildTx,
  BungeeBuildTxAPIResponse,
  BungeeBuyTokensAPIResponse,
  BungeeEvent,
  BungeeEventsAPIResponse,
  BungeeIntermediateTokensAPIResponse,
  BungeeQuote,
  BungeeQuoteAPIRequest,
  BungeeQuoteAPIResponse,
  BungeeQuoteWithBuildTx,
  GetBuyTokensParams,
  IntermediateTokensParams,
  SocketRequest,
  SupportedBridge,
  UserRequestValidation,
} from './types'
import { BridgeProviderError, BridgeProviderQuoteError, BridgeQuoteErrors } from '../../errors'
import { SocketVerifierAddresses } from './const/contracts'
import { SOCKET_VERIFIER_ABI } from './abi'
import { BuyTokensParams } from '../../types'
import { SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { getGlobalAdapter, log } from '@cowprotocol/sdk-common'
import { BUNGEE_BASE_URL, DEFAULT_API_OPTIONS, errorMessageMap, SUPPORTED_BRIDGES } from './consts'
import { isValidAcrossStatusResponse, isValidBungeeEventsResponse, isValidQuoteResponse } from './apiUtils'

type BungeeApiType = 'bungee' | 'events' | 'across' | 'bungee-manual'

export class BungeeApi {
  constructor(private readonly options: BungeeApiOptions = DEFAULT_API_OPTIONS) {
    // throw if any bridge is not supported
    this.validateBridges(this.getSupportedBridges())
  }

  // TODO: why do we need options.includeBridges then? Practically, you cannot add more bridges dynamically
  validateBridges(includeBridges: SupportedBridge[]): void {
    if (includeBridges?.some((bridge) => !SUPPORTED_BRIDGES.includes(bridge))) {
      throw new BridgeProviderError(
        `Unsupported bridge: ${includeBridges.filter((bridge) => !SUPPORTED_BRIDGES.includes(bridge)).join(', ')}`,
        { includeBridges },
      )
    }
  }

  async getBuyTokens(
    params: BuyTokensParams,
    bridgeParams?: {
      includeBridges?: SupportedBridge[]
    },
  ): Promise<TokenInfo[]> {
    const { sellChainId, sellTokenAddress, buyChainId } = params

    // get includeBridges from params or use the default
    const includeBridges = this.getSupportedBridges(bridgeParams?.includeBridges)

    // validate bridges
    this.validateBridges(includeBridges)

    const request: GetBuyTokensParams = {
      toChainId: buyChainId.toString(),
      includeBridges: includeBridges.join(','),
    }

    if (sellChainId) {
      request.fromChainId = sellChainId.toString()
    }

    if (sellTokenAddress) {
      request.fromTokenAddress = sellTokenAddress
    }

    const urlParams = objectToSearchParams(request)
    const response = await this.makeApiCall<BungeeBuyTokensAPIResponse>('bungee-manual', '/dest-tokens', urlParams)
    if (!response.success) {
      throw new BridgeProviderError('Bungee Api Error: Buy tokens failed', response)
    }

    return response.result.map((token) => ({
      // transform the logoURI to a logoUrl to match the TokenInfo interface
      // keep the rest as is
      ...token,
      logoUrl: token.logoURI,
    }))
  }

  async getIntermediateTokens(params: IntermediateTokensParams): Promise<TokenInfo[]> {
    const { fromChainId, toChainId, toTokenAddress } = params

    // get includeBridges from params or use the default
    const includeBridges = this.getSupportedBridges(params.includeBridges)

    // validate bridges
    this.validateBridges(includeBridges)

    const urlParams = objectToSearchParams({
      fromChainId: fromChainId.toString(),
      toChainId: toChainId.toString(),
      toTokenAddress,
      includeBridges: includeBridges.join(','),
    })
    const response = await this.makeApiCall<BungeeIntermediateTokensAPIResponse>(
      'bungee-manual',
      '/intermediate-tokens',
      urlParams,
    )
    if (!response.success) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS, response)
    }

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
      params.includeBridges = this.getSupportedBridges(params.includeBridges)

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
        throw new BridgeProviderQuoteError(BridgeQuoteErrors.QUOTE_ERROR, response)
      }
      // prepare quote timestamp from current timestamp
      const quoteTimestamp = Math.floor(Date.now() / 1000)

      // check if manualRoutes is empty
      const { manualRoutes } = response.result
      if (manualRoutes.length === 0) {
        throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES, response.result)
      }

      // Ensure we have a valid route with details
      const firstRoute = manualRoutes[0]
      if (!firstRoute?.routeDetails?.name) {
        throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES, { manualRoutes })
      }

      // validate bridge name
      const bridgeName = getBungeeBridgeFromDisplayName(firstRoute.routeDetails.name)

      if (!bridgeName) {
        throw new BridgeProviderQuoteError(BridgeQuoteErrors.INVALID_BRIDGE, { firstRoute })
      }

      // sort manual routes by output
      // @todo do we give users the option to choose bw time and output and any other factors?
      const sortedManualRoutes = manualRoutes.sort((a, b) => {
        return Number(b.output.amount) - Number(a.output.amount)
      })

      if (!sortedManualRoutes[0]) {
        throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES, sortedManualRoutes)
      }

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
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.TX_BUILD_ERROR, response)
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
  async verifyBungeeBuildTx(quote: BungeeQuote, buildTx: BungeeBuildTx): Promise<boolean> {
    const { routeId, functionSelector } = decodeBungeeBridgeTxData(buildTx.txData.data)

    const expectedSocketRequest: SocketRequest = {
      amount: quote.input.amount,
      recipient: quote.receiverAddress,
      toChainId: quote.destinationChainId.toString(),
      token: quote.input.token.address,
      signature: functionSelector,
    }
    return this.verifyBungeeBuildTxData(quote.originChainId, buildTx.txData.data, routeId, expectedSocketRequest)
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
  ): Promise<boolean> {
    const adapter = getGlobalAdapter()
    const socketVerifierAddress = SocketVerifierAddresses[originChainId]

    if (!socketVerifierAddress) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.TX_BUILD_ERROR, {
        originChainId,
        error: 'Socket verifier not found',
      })
    }

    // should not revert
    try {
      // TODO: it might not work with Viem/Ethers 6, need to test
      await adapter.readContract({
        address: socketVerifierAddress,
        abi: SOCKET_VERIFIER_ABI,
        functionName: 'validateRotueId',
        args: [txData, routeId],
      })
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
      await adapter.readContract({
        address: socketVerifierAddress,
        abi: SOCKET_VERIFIER_ABI,
        functionName: 'validateSocketRequest',
        args: [txData, expectedUserRequestValidation],
      })
    } catch (error) {
      console.error('🔴 Error validating socket request:', error)
      return false
    }

    return true
  }

  async getEvents(params: { orderId: string } | { txHash: string }): Promise<BungeeEvent[]> {
    const response = await this.makeApiCall<BungeeEventsAPIResponse>(
      'events',
      (params as { orderId: string }).orderId ? '/order' : '/tx',
      params,
      isValidBungeeEventsResponse,
    )
    if (!response.success) {
      throw new BridgeProviderError('Bungee Events Api Error', response)
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

  private getSupportedBridges(bridges?: SupportedBridge[]): SupportedBridge[] {
    return bridges ?? this.options.includeBridges ?? SUPPORTED_BRIDGES
  }

  private shouldAddAffiliate(apiType: BungeeApiType, baseUrl: string): boolean {
    const isBungeeApi = apiType === 'bungee' || apiType === 'bungee-manual'

    return !baseUrl.includes(BUNGEE_BASE_URL) && isBungeeApi
  }

  private async makeApiCall<T>(
    apiType: BungeeApiType,
    path: string,
    params: Record<string, string> | URLSearchParams,
    isValidResponse?: (response: unknown) => response is T,
  ): Promise<T> {
    const baseUrlMap = {
      bungee: this.options.apiBaseUrl || DEFAULT_API_OPTIONS.apiBaseUrl,
      events: this.options.eventsApiBaseUrl || DEFAULT_API_OPTIONS.eventsApiBaseUrl,
      across: this.options.acrossApiBaseUrl || DEFAULT_API_OPTIONS.acrossApiBaseUrl,
      'bungee-manual': this.options.manualApiBaseUrl || DEFAULT_API_OPTIONS.manualApiBaseUrl,
    }

    const baseUrl = baseUrlMap[apiType]
    const url = `${baseUrl}${path}?${new URLSearchParams(params).toString()}`
    const headers: Record<string, string> = {}

    if (this.shouldAddAffiliate(apiType, baseUrl) && this.options.affiliate) {
      headers['affiliate'] = this.options.affiliate
    }

    log(`Fetching ${apiType} API: GET ${url}. Params: ${JSON.stringify(params)}`)

    const response = await fetch(url, { method: 'GET', headers })

    if (!response.ok) {
      const errorBody = await response.json()
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.API_ERROR, { errorBody, type: errorMessageMap[apiType] })
    }

    const json = await response.json()
    if (isValidResponse && !isValidResponse(json)) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.INVALID_API_JSON_RESPONSE, { json, apiType, params })
    }

    return json
  }
}
