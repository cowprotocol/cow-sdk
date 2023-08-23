import { BigNumber, constants, providers } from 'ethers'

import { ConditionalOrder } from '../ConditionalOrder'
import { ConditionalOrderArguments, ContextFactory, IsNotValid, IsValid, PollResultErrors } from '../types'
import { encodeParams, isValidAbi } from '../utils'
import { SupportedChainId } from 'src/common'

// The type of Conditional Order
const TWAP_ORDER_TYPE = 'twap'
// The address of the TWAP handler contract
export const TWAP_ADDRESS = '0x6cF1e9cA41f7611dEf408122793c358a3d11E5a5'
/**
 * The address of the `CurrentBlockTimestampFactory` contract
 *
 * **NOTE**: This is used in the event that TWAP's have a `t0` of `0`.
 */
export const CURRENT_BLOCK_TIMESTAMP_FACTORY_ADDRESS = '0x52eD56Da04309Aca4c3FECC595298d80C2f16BAc'

export const MAX_UINT32 = BigNumber.from(2).pow(32).sub(1) // 2^32 - 1
export const MAX_FREQUENCY = BigNumber.from(365 * 24 * 60 * 60) // 1 year

// Define the ABI tuple for the TWAPData struct
const TWAP_DATA_ABI = [
  'tuple(address sellToken, address buyToken, address receiver, uint256 partSellAmount, uint256 minPartLimit, uint256 t0, uint256 n, uint256 t, uint256 span, bytes32 appData)',
]

// const DEFAULT_TOKEN_FORMATTER =  (address: string, amount: BigNumber) => string
const DEFAULT_TOKEN_FORMATTER = (address: string, amount: BigNumber) => `${address}@${amount}`

/**
 * Parameters for a TWAP order, made a little more user-friendly for SDK users.
 *
 * @see {@link TwapData} for the native struct.
 */
export type TwapDataParams = Omit<TwapData, 'partSellAmount' | 'minPartLimit'> & {
  // total amount of sellToken to sell across the entire TWAP
  readonly sellAmount: BigNumber
  // minimum amount of buyToken that must be bought across the entire TWAP
  readonly buyAmount: BigNumber
}

/**
 * Parameters for a discrete part of a TWAP order
 */
export type TwapPart = {
  /**
   * Amount of sellToken to sell in each part
   */
  partSellAmount: BigNumber

  /**
   * Minimum amount of buyToken that must be bought across the entire TWAP
   */
  minPartLimit: BigNumber
}

/**
 * Parameters for a TWAP order, as expected by the contract's `staticInput`.
 */
export type TwapData = {
  /**
   * which token to sell
   */
  readonly sellToken: string

  /**
   * which token to buy
   */
  readonly buyToken: string

  /**
   * who to send the tokens to
   */
  readonly receiver: string

  /**
   * amount of sellToken to sell in each part
   */
  readonly partSellAmount: BigNumber

  /**
   * minimum amount of buyToken that must be bought in each part
   */
  readonly minPartLimit: BigNumber

  /**
   * start time of the TWAP
   */
  readonly t0: BigNumber

  /**
   * number of parts
   */
  readonly n: BigNumber

  /**
   * duration of the TWAP interval
   */
  readonly t: BigNumber

  /**
   * whether the TWAP is valid for the entire interval or not
   */
  readonly span: BigNumber

  /**
   * Meta-data associated with the order. Normally would be the keccak256 hash of the document generated in http://github.com/cowprotocol/app-data
   *
   * This hash should have been uploaded to the API https://api.cow.fi/docs/#/default/put_api_v1_app_data__app_data_hash_ and potentially to other data availability protocols like IPFS.
   *
   */
  readonly appData: string
}

/**
 * `ComposableCoW` implementation of a TWAP order.
 * @author mfw78 <mfw78@rndlabs.xyz>
 */
export class Twap extends ConditionalOrder<TwapData, TwapDataParams> {
  /**
   * @see {@link ConditionalOrder.constructor}
   * @throws If the TWAP order is invalid.
   * @throws If the TWAP order is not ABI-encodable.
   * @throws If the handler is not the TWAP address.
   */
  constructor(params: ConditionalOrderArguments<TwapDataParams>) {
    const { handler, salt, staticInput, hasOffChainInput } = params
    // First, verify that the handler is the TWAP address
    if (handler !== TWAP_ADDRESS) throw new Error(`InvalidHandler: Expected: ${TWAP_ADDRESS}, provided: ${handler}`)

    // Third, construct the base class using transformed parameters
    super({ handler: TWAP_ADDRESS, salt, staticInput, hasOffChainInput })
  }

  /**
   * Create a TWAP order with sound defaults.
   * @param staticInput The TWAP order parameters in a more user-friendly format.
   * @returns An instance of the TWAP order.
   */
  static default(staticInput: TwapDataParams): ConditionalOrder<TwapData, TwapDataParams> {
    return new Twap({ handler: TWAP_ADDRESS, staticInput })
  }

  /**
   * Enforces that TWAPs will commence at the beginning of a block by use of the
   * `CurrentBlockTimestampFactory` contract to provide the current block timestamp
   * as the start time of the TWAP.
   */
  get context(): ContextFactory | undefined {
    if (this.staticInput.t0.gt(0)) {
      return super.context
    } else {
      return {
        address: CURRENT_BLOCK_TIMESTAMP_FACTORY_ADDRESS,
        factoryArgs: undefined,
      }
    }
  }

  /**
   * @inheritdoc {@link ConditionalOrder.orderType}
   */
  get orderType(): string {
    return TWAP_ORDER_TYPE
  }

  /**
   * Validate the TWAP order.
   * @param data The TWAP order to validate.
   * @returns Whether the TWAP order is valid.
   * @throws If the TWAP order is invalid.
   * @see {@link TwapData} for the native struct.
   */
  isValid(): IsValid | IsNotValid {
    const error = (() => {
      const { sellToken, sellAmount, buyToken, buyAmount, t0, n, t, span } = this.staticInput

      // Verify that the order params are logically valid
      if (!(sellToken != buyToken)) return 'InvalidSameToken'
      if (!(sellToken != constants.AddressZero && buyToken != constants.AddressZero)) return 'InvalidToken'
      if (!sellAmount.gt(constants.Zero)) return 'InvalidSellAmount'
      if (!buyAmount.gt(constants.Zero)) return 'InvalidMinBuyAmount'
      if (!(t0.gte(constants.Zero) && t0.lt(MAX_UINT32))) return 'InvalidStartTime'
      if (!(n.gt(constants.One) && n.lte(MAX_UINT32))) return 'InvalidNumParts'
      if (!(t.gt(constants.Zero) && t.lte(MAX_FREQUENCY))) return 'InvalidFrequency'
      if (!span.lte(t)) return 'InvalidSpan'

      // Verify that the transformed data is ABI-encodable
      if (!isValidAbi(TWAP_DATA_ABI, [this.data])) return 'InvalidData'

      // No errors
      return undefined
    })()

    return error ? { isValid: false, reason: error } : { isValid: true }
  }

  /**
   * Checks if the owner authorized the conditional order.
   *
   * @param owner The owner of the conditional order.
   * @param chain Which chain to use for the ComposableCoW contract.
   * @param provider An RPC provider for the chain.
   * @returns true if the owner authorized the order, false otherwise.
   */
  protected async pollValidate(
    _owner: string,
    _chain: SupportedChainId,
    _provider: providers.Provider
  ): Promise<PollResultErrors | undefined> {
    // TODO: Do not check again expired order
    // TODO: Calculate the next part start time, signal to not check again until then
    return undefined
  }

  /**
   * Serialize the TWAP order into it's ABI-encoded form.
   * @returns {string} The ABI-encoded TWAP order.
   */
  serialize(): string {
    return encodeParams(this.leaf)
  }

  /**
   * Get the encoded static input for the TWAP order.
   * @returns {string} The ABI-encoded TWAP order.
   */
  encodeStaticInput(): string {
    return super.encodeDataHelper(TWAP_DATA_ABI, this.data)
  }

  /**
   * Deserialize a TWAP order from it's ABI-encoded form.
   * @param {string} s ABI-encoded TWAP order to deserialize.
   * @returns A deserialized TWAP order.
   */
  static deserialize(s: string): Twap {
    return super.deserializeHelper(
      s,
      TWAP_ADDRESS,
      TWAP_DATA_ABI,
      (o: TwapData, salt: string) =>
        new Twap({
          handler: TWAP_ADDRESS,
          salt,
          staticInput: {
            ...o,
            ...Twap.partsToTotal(o),
          },
        })
    )
  }

  /**
   * Create a human-readable string representation of the TWAP order.
   * @param {((address: string, amount: BigNumber) => string) | undefined} tokenFormatter An optional
   *        function that takes an address and an amount and returns a human-readable string.
   * @returns {string} A human-readable string representation of the TWAP order.
   */
  toString(tokenFormatter = DEFAULT_TOKEN_FORMATTER): string {
    const { sellToken, buyToken, n, t, t0 } = this.data
    const { sellAmount, buyAmount } = Twap.partsToTotal(this.data)

    const sellAmountFormatted = tokenFormatter(sellToken, sellAmount)
    const buyAmountFormatted = tokenFormatter(buyToken, buyAmount)
    const t0Formatted = t0.eq(0) ? 'time of mining' : new Date(Number(this.staticInput.t0) * 1000)
    return `${this.orderType}: Sell total ${sellAmountFormatted} for a minimum of ${buyAmountFormatted} over ${n} parts with a spacing of ${t}s beginning at ${t0Formatted}`
  }

  /**
   * Transform parameters into a native struct.
   *
   * @param {TwapDataParams} params As passed by the consumer of the API.
   * @returns {TwapData} A formatted struct as expected by the smart contract.
   */
  transformParamsToData(params: TwapDataParams): TwapData {
    return {
      ...params,
      ...Twap.totalToPart(params),
    }
  }

  /**
   * Convert TWAP parts to total amounts.
   * @param {TwapData} o The TWAP order.
   * @returns {object} The total sell amount and total minimum buy amount.
   */
  private static partsToTotal(o: TwapData): {
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
   * @param {TwapDataParams} o The TWAP order parameters.
   * @returns {object} The part sell amount and minimum part limit.
   * @throws If the number of parts is less than 1.
   */
  private static totalToPart(o: TwapDataParams): {
    partSellAmount: BigNumber
    minPartLimit: BigNumber
  } {
    return !o.n.isZero()
      ? {
          partSellAmount: o.sellAmount.div(o.n),
          minPartLimit: o.buyAmount.div(o.n),
        }
      : {
          partSellAmount: BigNumber.from(0),
          minPartLimit: BigNumber.from(0),
        }
  }
}
