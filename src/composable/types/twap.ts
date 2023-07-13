import { BigNumber, constants } from 'ethers'
import { BaseConditionalOrder } from '../conditionalorder'
import { Context } from '../multiplexer'

// The type of Conditional Order
const TWAP_ORDER_TYPE = 'TWAP'
// The address of the TWAP handler contract
const TWAP_ADDRESS = '0x910d00a310f7Dc5B29FE73458F47f519be547D3d'
/**
 * The address of the `CurrentBlockTimestampFactory` contract
 *
 * **NOTE**: This is used in the event that TWAP's have a `t0` of `0`.
 */
const CURRENT_BLOCK_TIMESTAMP_FACTORY_ADDRESS = '0x0899c7DC280363d263Cc954506134F249CceC4a5'

// Define the ABI tuple for the TWAPData struct
const TWAP_DATA_ABI = [
  'tuple(address sellToken, address buyToken, address receiver, uint256 partSellAmount, uint256 minPartLimit, uint256 t0, uint256 n, uint256 t, uint256 span, bytes32 appData)',
]

/**
 * Parameters for a TWAP order, made a little more user-friendly for SDK users.
 * @see {@link TWAPData} for the native struct.
 */
export type TWAPDataParams = Omit<TWAPData, 'partSellAmount' | 'minPartLimit'> & {
  // total amount of sellToken to sell across the entire TWAP
  readonly sellAmount: BigNumber
  // minimum amount of buyToken that must be bought across the entire TWAP
  readonly buyAmount: BigNumber
}

/**
 * Parameters for a TWAP order, as expected by the contract's `staticInput`.
 */
type TWAPData = {
  // which token to sell
  readonly sellToken: string
  // which token to buy
  readonly buyToken: string
  // who to send the tokens to
  readonly receiver: string
  // amount of sellToken to sell in each part
  readonly partSellAmount: BigNumber
  // minimum amount of buyToken that must be bought in each part
  readonly minPartLimit: BigNumber
  // start time of the TWAP
  readonly t0: BigNumber
  // number of parts
  readonly n: BigNumber
  // duration of the TWAP interval
  readonly t: BigNumber
  // whether the TWAP is valid for the entire interval or not
  readonly span: BigNumber
  // appData
  readonly appData: string
}

/**
 * `ComposableCoW` implementation of a TWAP order.
 * @author mfw78 <mfw78@rndlabs.xyz>
 */
export class TWAP extends BaseConditionalOrder<TWAPData> {
  /**
   * @param params The TWAP order parameters.
   * @see {@link TWAPDataParams} for the native struct.
   * @throws If the TWAP order is invalid.
   */
  constructor(params: TWAPDataParams, salt?: string) {
    // First verify that the order params are logically valid
    TWAP.isValid(params)

    // Second, construct the base class using transformed parameters
    super(TWAP_ORDER_TYPE, TWAP_ADDRESS, salt, TWAP.transformParamsToData(params))

    // Finally, verify that the transformed data is ABI-encodable
    if (!TWAP.isValidAbi(TWAP_DATA_ABI, [this.staticInput])) throw new Error('InvalidData')
  }

  /**
   * Enforces that TWAPs will commence at the beginning of a block by use of the
   * `CurrentBlockTimestampFactory` contract to provide the current block timestamp
   * as the start time of the TWAP.
   */
  get context(): Context | undefined {
    if (this.staticInput.t0.gt(0)) {
      return super.context
    } else {
      return {
        address: CURRENT_BLOCK_TIMESTAMP_FACTORY_ADDRESS,
        args: undefined,
      }
    }
  }

  /**
   * Validate the TWAP order.
   * @param data The TWAP order to validate.
   * @returns Whether the TWAP order is valid.
   * @throws If the TWAP order is invalid.
   * @see {@link TWAPData} for the native struct.
   */
  static isValid(data: TWAPDataParams): boolean {
    if (!(data.sellToken != data.buyToken)) throw new Error('InvalidSameToken')
    if (!(data.sellToken != constants.AddressZero && data.buyToken != constants.AddressZero))
      throw new Error('InvalidToken')
    if (!data.sellAmount.gt(0)) throw new Error('InvalidSellAmount')
    if (!data.buyAmount.gt(0)) throw new Error('InvalidMinBuyAmount')
    if (!(data.t0.gte(0) && data.t0.lt(2 ** 32))) throw new Error('InvalidStartTime')
    if (!(data.n.gt(1) && data.n.lte(2 ** 32))) throw new Error('InvalidNumParts')
    if (!(data.t.gt(0) && data.t.lte(365 * 24 * 60 * 60))) throw new Error('InvalidFrequency')
    if (!data.span.lte(data.t)) throw new Error('InvalidSpan')
    return true
  }

  /**
   * Serialize the TWAP order into it's ABI-encoded form.
   * @returns {string} The ABI-encoded TWAP order.
   */
  serialize(): string {
    return BaseConditionalOrder.encodeParams(this.leaf)
  }

  /**
   * Get the encoded static input for the TWAP order.
   * @returns {string} The ABI-encoded TWAP order.
   */
  encodeStaticInput(): string {
    return super.encodeStaticInputHelper(TWAP_DATA_ABI, this.staticInput)
  }

  /**
   * Deserialize a TWAP order from it's ABI-encoded form.
   * @param {string} s ABI-encoded TWAP order to deserialize.
   * @returns A deserialized TWAP order.
   */
  static deserialize(s: string): TWAP {
    return super.deserializeHelper(
      s,
      TWAP_ADDRESS,
      TWAP_DATA_ABI,
      (o: TWAPData, salt: string) => new TWAP({ ...o, ...TWAP.partsToTotal(o) }, salt)
    )
  }

  /**
   * Create a human-readable string representation of the TWAP order.
   * @param {((address: string, amount: BigNumber) => string) | undefined} tokenFormatter An optional
   *        function that takes an address and an amount and returns a human-readable string.
   * @returns {string} A human-readable string representation of the TWAP order.
   */
  toString(tokenFormatter?: (address: string, amount: BigNumber) => string): string {
    const defaultFormatter = (address: string, amount: BigNumber) => `${address}@${amount}`
    tokenFormatter = tokenFormatter || defaultFormatter

    const { sellAmount, buyAmount } = TWAP.partsToTotal(this.staticInput)

    return `${this.orderType}: Sell total ${tokenFormatter(
      this.staticInput.sellToken,
      sellAmount
    )} for a minimum of ${tokenFormatter(this.staticInput.buyToken, buyAmount)} over ${
      this.staticInput.n
    } parts with a spacing of ${this.staticInput.t}s beginning at ${
      this.staticInput.t0.eq(0) ? 'time of mining' : new Date(Number(this.staticInput.t0) * 1000)
    }`
  }

  /**
   * Transform parameters into a native struct.
   * @param {TWAPDataParams} params As passed by the consumer of the API.
   * @returns {TWAPData} A formatted struct as expected by the smart contract.
   */
  private static transformParamsToData(params: TWAPDataParams): TWAPData {
    return {
      ...params,
      ...TWAP.totalToPart(params),
    }
  }

  /**
   * Convert TWAP parts to total amounts.
   * @param {TWAPData} o The TWAP order.
   * @returns {object} The total sell amount and total minimum buy amount.
   */
  private static partsToTotal(o: TWAPData): {
    sellAmount: BigNumber
    buyAmount: BigNumber
  } {
    return {
      sellAmount: o.partSellAmount.mul(o.n),
      buyAmount: o.minPartLimit.mul(o.n),
    }
  }

  /**
   * Convert total amounts to TWAP parts.
   * @param {TWAPDataParams} o The TWAP order parameters.
   * @returns {object} The part sell amount and minimum part limit.
   * @throws If the number of parts is less than 1.
   */
  private static totalToPart(o: TWAPDataParams): {
    partSellAmount: BigNumber
    minPartLimit: BigNumber
  } {
    return {
      partSellAmount: o.sellAmount.div(o.n),
      minPartLimit: o.buyAmount.div(o.n),
    }
  }
}
