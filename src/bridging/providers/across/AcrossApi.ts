import { log } from '../../../common/utils/log'
import {
  AvailableRoutesRequest,
  PctFee,
  Route,
  SuggestedFeesLimits,
  SuggestedFeesRequest,
  SuggestedFeesResponse,
} from './types'
import { BridgeProviderQuoteError } from '../../errors'

const ACROSS_API_URL = 'https://app.across.to/api'

export interface AcrossApiOptions {
  apiBaseUrl?: string
}

export class AcrossApi {
  constructor(private readonly options: AcrossApiOptions = {}) {}

  /**
   * Retrieve available routes for transfers
   *
   * Returns available routes based on specified parameters. If no parameters are provided, available routes on all
   * chains are returned.
   *
   * See https://docs.across.to/reference/api-reference#available-routes
   */
  async getAvailableRoutes({
    originChainId,
    originToken,
    destinationChainId,
    destinationToken,
  }: AvailableRoutesRequest): Promise<Route[]> {
    const params: Record<string, string> = {}
    if (originChainId) params.originChainId = originChainId
    if (originToken) params.originToken = originToken
    if (destinationChainId) params.destinationChainId = destinationChainId
    if (destinationToken) params.destinationToken = destinationToken

    return this.fetchApi('/available-routes', params, isValidRoutes)
  }

  /**
   * Retrieve suggested fee quote for a deposit.
   *
   * Returns suggested fees based inputToken+outputToken, originChainId, destinationChainId, and amount.
   * Also includes data used to compute the fees.
   *
   * * See https://docs.across.to/reference/api-reference#suggested-fees
   */
  async getSuggestedFees(request: SuggestedFeesRequest): Promise<SuggestedFeesResponse> {
    const params: Record<string, string> = {
      token: request.token,
      originChainId: request.originChainId.toString(),
      destinationChainId: request.destinationChainId.toString(),
      amount: request.amount.toString(),
    }

    if (request.recipient) {
      params.recipient = request.recipient
    }

    // Get the quote from the Across API (see https://docs.across.to/reference/api-reference#suggested-fees)
    // Example: https://app.across.to/api/suggested-fees?token=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&originChainId=8453&destinationChainId=137&amount=100000000
    //
    // TODO: The API documented params don't match with the example above. Ideally I would use 'inputToken' and 'outputToken', but the example above uses 'token'. This will work for current implementation, since we bridge the canonical token, but this will need to be reviewed
    //       https://app.across.to/api/suggested-fees?inputToken=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&originChainId=8453&destinationChainId=137&outputToken=0xc2132D05D31c914a87C6611C10748AEb04B58e8F&amount=100000000
    return await this.fetchApi('/suggested-fees', params, isValidSuggestedFeesResponse)
  }

  protected async fetchApi<T>(
    path: string,
    params: Record<string, string>,
    isValidResponse?: (response: unknown) => response is T
  ): Promise<T> {
    const baseUrl = this.options.apiBaseUrl || ACROSS_API_URL
    const url = `${baseUrl}${path}?${new URLSearchParams(params).toString()}`

    log(`Fetching Across API: GET ${url}. Params: ${JSON.stringify(params)}`)

    const response = await fetch(url, {
      method: 'GET',
    })

    if (!response.ok) {
      const errorBody = await response.json()
      throw new BridgeProviderQuoteError('Across Api Error', errorBody)
    }

    // Validate the response
    const json = await response.json()
    if (isValidResponse) {
      if (isValidResponse(json)) {
        return json
      } else {
        throw new BridgeProviderQuoteError(
          `Invalid response for Across API call ${path}. The response doesn't pass the validation. Did the API change?`,
          json
        )
      }
    }

    return json
  }
}

/**
 * Validate the response from the Across API is a SuggestedFeesResponse
 *
 * @param response - The response from the Across API
 * @returns True if the response is a SuggestedFeesResponse, false otherwise
 */
function isValidSuggestedFeesResponse(response: unknown): response is SuggestedFeesResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'totalRelayFee' in response &&
    isValidPctFee(response.totalRelayFee) &&
    'relayerCapitalFee' in response &&
    isValidPctFee(response.relayerCapitalFee) &&
    'relayerGasFee' in response &&
    isValidPctFee(response.relayerGasFee) &&
    'lpFee' in response &&
    isValidPctFee(response.lpFee) &&
    'timestamp' in response &&
    'isAmountTooLow' in response &&
    'quoteBlock' in response &&
    'spokePoolAddress' in response &&
    'exclusiveRelayer' in response &&
    'exclusivityDeadline' in response &&
    'estimatedFillTimeSec' in response &&
    'fillDeadline' in response &&
    'limits' in response &&
    isValidSuggestedFeeLimits(response.limits)
  )
}

function isValidPctFee(pctFee: unknown): pctFee is PctFee {
  return typeof pctFee === 'object' && pctFee !== null && 'pct' in pctFee && 'total' in pctFee
}

function isValidSuggestedFeeLimits(limits: unknown): limits is SuggestedFeesLimits {
  return (
    typeof limits === 'object' &&
    limits !== null &&
    'minDeposit' in limits &&
    'maxDeposit' in limits &&
    'maxDepositInstant' in limits &&
    'maxDepositShortDelay' in limits &&
    'recommendedDepositInstant' in limits
  )
}

/**
 * Validate the response from the Across API is an AvailableRoutesResponse
 *
 * @param response - The response from the Across API
 * @returns True if the response is an AvailableRoutesResponse, false otherwise
 */
function isValidRoutes(response: unknown): response is Route[] {
  // make sure the response is an array
  if (!Array.isArray(response)) {
    return false
  }

  // make sure each item in the array is an AvailableRoutesResponseItem
  return response.every((item) => isValidRoute(item))
}

function isValidRoute(item: unknown): item is Route {
  return (
    typeof item === 'object' &&
    item !== null &&
    'originChainId' in item &&
    'originToken' in item &&
    'destinationChainId' in item &&
    'destinationToken' in item &&
    'originTokenSymbol' in item &&
    'destinationTokenSymbol' in item
  )
}
