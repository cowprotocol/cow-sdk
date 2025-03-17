import { TargetChainId } from 'src/chains'

const ACROSS_API_URL = 'https://app.across.to/api'

export interface AvailableRoutesRequest {
  originChainId: string
  originToken: string
  destinationChainId: string
  destinationToken: string
}

export interface Route {
  originChainId: string
  originToken: string
  destinationChainId: string
  destinationToken: string
  originTokenSymbol: string
  destinationTokenSymbol: string
}

export interface SuggestedFeesRequest {
  token: string
  // inputToken: string
  // outputToken: string
  originChainId: TargetChainId
  destinationChainId: TargetChainId

  /**
   * Amount of the token to transfer.
   *
   * Note that this amount is in the native decimals of the token. So, for WETH, this would be the amount of
   * human-readable WETH multiplied by 1e18.
   *
   * For USDC, you would multiply the number of human-readable USDC by 1e6.
   *
   * Example: 1000000000000000000
   */
  amount: string

  /**
   * Recipient of the deposit. Can be an EOA or a contract. If this is an EOA and message is defined, then the API will throw a 4xx error.
   *
   * Example: 0xc186fA914353c44b2E33eBE05f21846F1048bEda
   */
  recipient?: string

  /**
   * The quote timestamp used to compute the LP fees. When bridging with across, the user only specifies the quote
   * timestamp in their transaction. The relayer then determines the utilization at that timestamp to determine the
   * user's fee. This timestamp must be close (within 10 minutes or so) to the current time on the chain where the
   * user is depositing funds and it should be <= the current block timestamp on mainnet. This allows the user to know
   * exactly what LP fee they will pay before sending the transaction.
   *
   * If this value isn't provided in the request, the API will assume the latest block timestamp on mainnet.
   *
   * Example: 1653547649
   */
  timestamp?: number

  /**
   * Optionally override the relayer address used to simulate the fillRelay() call that estimates the gas costs
   * needed to fill a deposit. This simulation result impacts the returned suggested-fees. The reason to customize the
   * EOA would be primarily if the recipientAddress is a contract and requires a certain relayer to submit the fill,
   * or if one specific relayer has the necessary token balance to make the fill.
   *
   * Example: 0x428AB2BA90Eba0a4Be7aF34C9Ac451ab061AC010
   */
  relayer?: string
}

export interface SuggestedFeesResponse {
  /**
   * Percentage of the transfer amount that should go to the relayer as a fee in total. The value is inclusive of lpFee.pct.
   *
   * This is the strongly recommended minimum value to ensure a relayer will perform the transfer under the current
   * network conditions.
   *
   * The value returned in this field is guaranteed to be at least 0.03% in order to meet minimum relayer fee requirements
   */
  totalRelayFee: PctFee

  /**
   * The percentage of the transfer amount that should go the relayer as a fee to cover relayer capital costs.
   */
  relayerCapitalFee: PctFee

  /**
   * The percentage of the transfer amount that should go the relayer as a fee to cover relayer gas costs.
   */
  relayerGasFee: PctFee

  /**
   * The percent of the amount that will go to the LPs as a fee for borrowing their funds.
   */
  lpFee: PctFee

  /**
   * The quote timestamp that was used to compute the lpFeePct. To pay the quoted LP fee, the user would need to pass
   * this quote timestamp to the protocol when sending their bridge transaction.
   */
  timestamp: string

  /**
   * Is the input amount below the minimum transfer amount.
   */
  isAmountTooLow: boolean

  /**
   * The block used associated with this quote, used to compute lpFeePct.
   */
  quoteBlock: string

  /**
   * The contract address of the origin SpokePool.
   */
  spokePoolAddress: string

  /**
   * The relayer that is suggested to be set as the exclusive relayer for in the depositV3 call for the fastest fill.
   *
   * Note: when set to "0x0000000000000000000000000000000000000000", relayer exclusivity will be disabled.
   * This value is returned in cases where using an exclusive relayer is not recommended.
   */
  exclusiveRelayer: string

  /**
   * The suggested exclusivity period (in seconds) the exclusive relayer should be given to fill before other relayers
   * are allowed to take the fill. Note: when set to "0", relayer exclusivity will be disabled.
   *
   * This value is returned in cases where using an exclusive relayer is not recommended.
   */
  exclusivityDeadline: string

  /**
   * The expected time (in seconds) for a fill to be made. Represents 75th percentile of the 7-day rolling average of times (updated daily). Times are dynamic by origin/destination token/chain for a given amount.
   */
  expectedFillTimeSec: string

  /**
   * The recommended deadline (UNIX timestamp in seconds) for the relayer to fill the deposit. After this destination chain timestamp, the fill will revert on the destination chain.
   */
  fillDeadline: string

  limits: {
    /**
     * The minimum deposit size in the tokens' units.
     *
     * Note: USDC has 6 decimals, so this value would be the number of USDC multiplied by 1e6. For WETH, that would be 1e18.
     */
    minDeposit: string

    /**
     * The maximum deposit size in the tokens' units. Note: The formatting of this number is the same as minDeposit.
     */
    maxDeposit: string

    /**
     * The max deposit size that can be relayed "instantly" on the destination chain.
     *
     * Instantly means that there is relayer capital readily available and that a relayer is expected to relay within
     * seconds to 5 minutes of the deposit.
     */
    maxDepositInstant: string

    /**
     * The max deposit size that can be relayed with a "short delay" on the destination chain.
     *
     * This means that there is relayer capital available on mainnet and that a relayer will immediately begin moving
     * that capital over the canonical bridge to relay the deposit. Depending on the chain, the time for this can vary.
     *
     * Polygon is the worst case where it can take between 20 and 35 minutes for the relayer to receive the funds
     * and relay.
     *
     * Arbitrum is much faster, with a range between 5 and 15 minutes. Note: if the transfer size is greater than this,
     * the estimate should be between 2-4 hours for a slow relay to be processed from the mainnet pool.
     */
    maxDepositShortDelay: string

    /**
     * The recommended deposit size that can be relayed "instantly" on the destination chain.
     *
     * Instantly means that there is relayer capital readily available and that a relayer is expected to relay
     * within seconds to 5 minutes of the deposit. Value is in the smallest unit of the respective token.
     */
    recommendedDepositInstant: string
  }
}

export interface PctFee {
  /**
   * Note: 1% is represented as 1e16, 100% is 1e18, 50% is 5e17, etc. These values are in the same format that the contract understands.
   *
   * Example: 100200000000000
   */
  pct: string

  total: string
}

export class AcrossApi {
  constructor(private readonly apiBaseUrl: string = ACROSS_API_URL) {}

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

    return this.fetchApi('/available-routes', params)
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
      amount: request.amount,
    }

    if (request.recipient) {
      params.recipient = request.recipient
    }

    // Get the quote from the Across API (see https://docs.across.to/reference/api-reference#suggested-fees)
    // Example: https://app.across.to/api/suggested-fees?token=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&originChainId=8453&destinationChainId=137&amount=100000000
    //
    // TODO: The API documented params don't match with the example above. Ideally I would use 'inputToken' and 'outputToken', but the example above uses 'token'. This will work for current implementation, since we bridge the canonical token, but this will need to be reviewed
    //       https://app.across.to/api/suggested-fees?inputToken=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&originChainId=8453&destinationChainId=137&outputToken=0xc2132D05D31c914a87C6611C10748AEb04B58e8F&amount=100000000
    return this.fetchApi('/suggested-fees', params)
  }

  protected async fetchApi<T>(path: string, params: Record<string, string>): Promise<T> {
    const baseUrl = this.apiBaseUrl || ACROSS_API_URL
    const url = `${baseUrl}${path}?${new URLSearchParams(params).toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return response.json()
  }
}
