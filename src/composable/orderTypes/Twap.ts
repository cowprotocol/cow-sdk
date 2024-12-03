import { BigNumber, constants, utils } from 'ethers'

import { ConditionalOrder } from '../ConditionalOrder'
import {
  ConditionalOrderArguments,
  ConditionalOrderParams,
  ContextFactory,
  OwnerContext,
  IsValidResult,
  PollParams,
  PollResultCode,
  PollResultErrors,
} from '../types'
import { encodeParams, formatEpoch, getBlockInfo, isValidAbi } from '../utils'
import { GPv2Order } from '../../common/generated/ComposableCoW'

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
const TWAP_STRUCT_ABI = [
  'tuple(address sellToken, address buyToken, address receiver, uint256 partSellAmount, uint256 minPartLimit, uint256 t0, uint256 n, uint256 t, uint256 span, bytes32 appData)',
]

/**
 * Base parameters for a TWAP order. Shared by:
 *   - TwapStruct (modelling the contract's struct used for `staticInput`).
 *   - TwapData (modelling the friendly SDK interface).
 */
export type TwapDataBase = {
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
   * Meta-data associated with the order. Normally would be the keccak256 hash of the document generated in http://github.com/cowprotocol/app-data
   *
   * This hash should have been uploaded to the API https://api.cow.fi/docs/#/default/put_api_v1_app_data__app_data_hash_ and potentially to other data availability protocols like IPFS.
   *
   */
  readonly appData: string
}

/**
 * Parameters for a TWAP order, as expected by the contract's `staticInput`.
 */
export interface TwapStruct extends TwapDataBase {
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
}

/**
 * Parameters for a TWAP order, made a little more user-friendly for SDK users.
 *
 * @see {@link TwapStruct} for the native struct.
 */
export interface TwapData extends TwapDataBase {
  /**
   * total amount of sellToken to sell across the entire TWAP
   */
  readonly sellAmount: BigNumber

  /**
   * minimum amount of buyToken that must be bought across the entire TWAP
   */
  readonly buyAmount: BigNumber

  /**
   * start time of the TWAP
   */
  readonly startTime?: StartTime

  /**
   * number of parts
   */
  readonly numberOfParts: BigNumber

  /**
   * duration of the TWAP interval
   */
  readonly timeBetweenParts: BigNumber

  /**
   * whether the TWAP is valid for the entire interval or not
   */
  readonly durationOfPart?: DurationOfPart
}

export type DurationOfPart =
  | { durationType: DurationType.AUTO }
  | { durationType: DurationType.LIMIT_DURATION; duration: BigNumber }

export enum DurationType {
  AUTO = 'AUTO',
  LIMIT_DURATION = 'LIMIT_DURATION',
}

export type StartTime =
  | { startType: StartTimeValue.AT_MINING_TIME }
  | { startType: StartTimeValue.AT_EPOCH; epoch: BigNumber }

export enum StartTimeValue {
  AT_MINING_TIME = 'AT_MINING_TIME',
  AT_EPOCH = 'AT_EPOCH',
}

const DEFAULT_START_TIME: StartTime = { startType: StartTimeValue.AT_MINING_TIME }
const DEFAULT_DURATION_OF_PART: DurationOfPart = { durationType: DurationType.AUTO }

/**
 * `ComposableCoW` implementation of a TWAP order.
 * @author mfw78 <mfw78@rndlabs.xyz>
 */
export class Twap extends ConditionalOrder<TwapData, TwapStruct> {
  isSingleOrder = true

  /**
   * @see {@link ConditionalOrder.constructor}
   * @throws If the TWAP order is invalid.
   * @throws If the TWAP order is not ABI-encodable.
   * @throws If the handler is not the TWAP address.
   */
  constructor(params: ConditionalOrderArguments<TwapData>) {
    const { handler, salt, data: staticInput, hasOffChainInput } = params

    // First, verify that the handler is the TWAP address
    if (handler !== TWAP_ADDRESS) throw new Error(`InvalidHandler: Expected: ${TWAP_ADDRESS}, provided: ${handler}`)

    // Third, construct the base class using transformed parameters
    super({ handler: TWAP_ADDRESS, salt, data: staticInput, hasOffChainInput })
  }

  /**
   * Create a TWAP order with sound defaults.
   * @param data The TWAP order parameters in a more user-friendly format.
   * @returns An instance of the TWAP order.
   */
  static fromData(data: TwapData, salt?: string): Twap {
    return new Twap({ handler: TWAP_ADDRESS, data, salt })
  }

  /**
   * Create a TWAP order with sound defaults.
   * @param data The TWAP order parameters in a more user-friendly format.
   * @returns An instance of the TWAP order.
   */
  static fromParams(params: ConditionalOrderParams): Twap {
    return Twap.deserialize(encodeParams(params))
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
   * @see {@link TwapStruct} for the native struct.
   */
  isValid(): IsValidResult {
    const error = (() => {
      const {
        sellToken,
        sellAmount,
        buyToken,
        buyAmount,
        startTime = DEFAULT_START_TIME,
        numberOfParts,
        timeBetweenParts,
        durationOfPart = DEFAULT_DURATION_OF_PART,
      } = this.data

      // Verify that the order params are logically valid
      if (!(sellToken != buyToken)) return 'InvalidSameToken'
      if (!(sellToken != constants.AddressZero && buyToken != constants.AddressZero)) return 'InvalidToken'
      if (!sellAmount.gt(constants.Zero)) return 'InvalidSellAmount'
      if (!buyAmount.gt(constants.Zero)) return 'InvalidMinBuyAmount'
      if (startTime.startType === StartTimeValue.AT_EPOCH) {
        const t0 = startTime.epoch
        if (!(t0.gte(constants.Zero) && t0.lt(MAX_UINT32))) return 'InvalidStartTime'
      }
      if (!(numberOfParts.gt(constants.One) && numberOfParts.lte(MAX_UINT32))) return 'InvalidNumParts'
      if (!(timeBetweenParts.gt(constants.Zero) && timeBetweenParts.lte(MAX_FREQUENCY))) return 'InvalidFrequency'
      if (durationOfPart.durationType === DurationType.LIMIT_DURATION) {
        if (!durationOfPart.duration.lte(timeBetweenParts)) return 'InvalidSpan'
      }

      // Verify that the staticInput derived from the data is ABI-encodable
      if (!isValidAbi(TWAP_STRUCT_ABI, [this.staticInput])) return 'InvalidData'

      // No errors
      return undefined
    })()

    return error ? { isValid: false, reason: error } : { isValid: true }
  }

  protected async startTimestamp(params: OwnerContext): Promise<number> {
    const { startTime } = this.data

    if (startTime?.startType === StartTimeValue.AT_EPOCH) {
      return startTime.epoch.toNumber()
    }

    const cabinet = await this.cabinet(params)
    const rawCabinetEpoch = utils.defaultAbiCoder.decode(['uint256'], cabinet)[0] as BigNumber

    // Guard against out-of-range cabinet epoch
    if (rawCabinetEpoch.gt(MAX_UINT32)) {
      throw new Error(`Cabinet epoch out of range: ${rawCabinetEpoch.toString()}`)
    }

    // Convert the cabinet epoch (bignumber) to a number.
    const cabinetEpoch = rawCabinetEpoch.toNumber()

    if (cabinetEpoch === 0) {
      throw new Error('Cabinet is not set. Required for TWAP orders that start at mining time.')
    }

    return cabinetEpoch
  }

  /**
   * Given the start timestamp of the TWAP, calculate the end timestamp.
   * @dev As usually the `endTimestamp` is used when determining a TWAP's validity, we don't
   *      do any lookup to the blockchain to determine the start timestamp, as this has likely
   *      already been done during the verification flow.
   * @dev Beware to handle the case of `span != 0` ie. `durationOfPart.durationType !== DurationType.AUTO`.
   * @param startTimestamp The start timestamp of the TWAP.
   * @returns The timestamp at which the TWAP will end.
   */
  protected endTimestamp(startTimestamp: number): number {
    const { numberOfParts, timeBetweenParts, durationOfPart } = this.data

    if (durationOfPart && durationOfPart.durationType === DurationType.LIMIT_DURATION) {
      return startTimestamp + numberOfParts.sub(1).mul(timeBetweenParts).add(durationOfPart.duration).toNumber()
    }

    return startTimestamp + numberOfParts.mul(timeBetweenParts).toNumber()
  }

  /**
   * Checks if the owner authorized the conditional order.
   *
   * @param owner The owner of the conditional order.
   * @param chain Which chain to use for the ComposableCoW contract.
   * @param provider An RPC provider for the chain.
   * @returns true if the owner authorized the order, false otherwise.
   */
  protected async pollValidate(params: PollParams): Promise<PollResultErrors | undefined> {
    const { blockInfo = await getBlockInfo(params.provider) } = params
    const { blockTimestamp } = blockInfo

    try {
      const startTimestamp = await this.startTimestamp(params)

      if (startTimestamp > blockTimestamp) {
        // The start time hasn't started
        return {
          result: PollResultCode.TRY_AT_EPOCH,
          epoch: startTimestamp,
          reason: `TWAP hasn't started yet. Starts at ${startTimestamp} (${formatEpoch(startTimestamp)})`,
        }
      }

      const expirationTimestamp = this.endTimestamp(startTimestamp)
      if (blockTimestamp >= expirationTimestamp) {
        // The order has expired
        return {
          result: PollResultCode.DONT_TRY_AGAIN,
          reason: `TWAP has expired. Expired at ${expirationTimestamp} (${formatEpoch(expirationTimestamp)})`,
        }
      }

      return undefined
    } catch (err: any) {
      if (err?.message?.includes('Cabinet is not set')) {
        // in this case we have a firm reason to not monitor this order as the cabinet is not set
        return {
          result: PollResultCode.DONT_TRY_AGAIN,
          reason: `${err?.message}. User likely removed the order.`,
        }
      } else if (err?.message?.includes('Cabinet epoch out of range')) {
        // in this case we have a firm reason to not monitor this order as the cabinet is not set correctly
        return {
          result: PollResultCode.DONT_TRY_AGAIN,
          reason: `${err?.message}`,
        }
      }

      return {
        result: PollResultCode.UNEXPECTED_ERROR,
        reason: `Unexpected error: ${err.message}`,
        error: err,
      }
    }
  }

  /**
   * Handles the error when the order is already present in the orderbook.
   *
   * Given the current part is in the book, it will signal to Watch Tower what to do:
   *   - Wait until the next part starts
   *   - Don't try again if current part is the last one
   *
   * NOTE: The error messages will refer to the parts 1-indexed, so first part is 1, second part is 2, etc.
   */
  protected async handlePollFailedAlreadyPresent(
    _orderUid: string,
    _order: GPv2Order.DataStruct,
    params: PollParams
  ): Promise<PollResultErrors | undefined> {
    const { blockInfo = await getBlockInfo(params.provider) } = params
    const { blockTimestamp } = blockInfo

    const timeBetweenParts = this.data.timeBetweenParts.toNumber()
    const { numberOfParts } = this.data
    const startTimestamp = await this.startTimestamp(params)

    if (blockTimestamp < startTimestamp) {
      return {
        result: PollResultCode.UNEXPECTED_ERROR,
        reason: `TWAP part hash't started. First TWAP part start at ${startTimestamp} (${formatEpoch(startTimestamp)})`,
        error: undefined,
      }
    }
    const expireTime = numberOfParts.mul(timeBetweenParts).add(startTimestamp).toNumber()
    if (blockTimestamp >= expireTime) {
      return {
        result: PollResultCode.UNEXPECTED_ERROR,
        reason: `TWAP is expired. Expired at ${expireTime} (${formatEpoch(expireTime)})`,
        error: undefined,
      }
    }

    // Get current part number
    const currentPartNumber = Math.floor((blockTimestamp - startTimestamp) / timeBetweenParts)

    // If current part is the last one
    if (currentPartNumber === numberOfParts.toNumber() - 1) {
      return {
        result: PollResultCode.DONT_TRY_AGAIN,
        reason: `Current active TWAP part (${
          currentPartNumber + 1
        }/${numberOfParts}) is already in the Order Book. This was the last TWAP part, no more orders need to be placed`,
      }
    }

    // Next part start time
    const nextPartStartTime = startTimestamp + (currentPartNumber + 1) * timeBetweenParts

    /**
     * Given we know, that TWAP part that is due in the current block is already in the Orderbook,
     * Then, we can safely instruct that we should wait until the next TWAP part starts
     */
    return {
      result: PollResultCode.TRY_AT_EPOCH,
      epoch: nextPartStartTime,
      reason: `Current active TWAP part (${
        currentPartNumber + 1
      }/${numberOfParts}) is already in the Order Book. TWAP part ${
        currentPartNumber + 2
      } doesn't start until ${nextPartStartTime} (${formatEpoch(nextPartStartTime)})`,
    }
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
    return super.encodeStaticInputHelper(TWAP_STRUCT_ABI, this.staticInput)
  }

  /**
   * Deserialize a TWAP order from it's ABI-encoded form.
   * @param {string} twapSerialized ABI-encoded TWAP order to deserialize.
   * @returns A deserialized TWAP order.
   */
  static deserialize(twapSerialized: string): Twap {
    return super.deserializeHelper(
      twapSerialized,
      TWAP_ADDRESS,
      TWAP_STRUCT_ABI,
      (struct: TwapStruct, salt: string) =>
        new Twap({
          handler: TWAP_ADDRESS,
          salt,
          data: transformStructToData(struct),
        })
    )
  }

  /**
   * Create a human-readable string representation of the TWAP order.
   * @returns {string} A human-readable string representation of the TWAP order.
   */
  toString(): string {
    const {
      sellAmount,
      sellToken,
      buyAmount,
      buyToken,
      numberOfParts,
      startTime = DEFAULT_START_TIME,
      timeBetweenParts,
      durationOfPart = DEFAULT_DURATION_OF_PART,
      receiver,
      appData,
    } = this.data

    const startTimeFormatted =
      startTime.startType === StartTimeValue.AT_MINING_TIME ? 'AT_MINING_TIME' : startTime.epoch.toNumber()
    const durationOfPartFormatted =
      durationOfPart.durationType === DurationType.AUTO ? 'AUTO' : durationOfPart.duration.toNumber()

    const details = {
      sellAmount: sellAmount.toString(),
      sellToken,
      buyAmount: buyAmount.toString(),
      buyToken,
      numberOfParts: numberOfParts.toString(),
      startTime: startTimeFormatted,
      timeBetweenParts: timeBetweenParts.toNumber(),
      durationOfPart: durationOfPartFormatted,
      receiver,
      appData,
    }

    return `${this.orderType} (${this.id}): ${JSON.stringify(details)}`
  }

  /**
   * Transform parameters into a native struct.
   *
   * @param {TwapData} data As passed by the consumer of the API.
   * @returns {TwapStruct} A formatted struct as expected by the smart contract.
   */
  transformDataToStruct(data: TwapData): TwapStruct {
    return transformDataToStruct(data)
  }

  /**
   * Transform parameters into a TWAP order struct.
   *
   * @param {TwapData} params As passed by the consumer of the API.
   * @returns {TwapStruct} A formatted struct as expected by the smart contract.
   */
  transformStructToData(struct: TwapStruct): TwapData {
    return transformStructToData(struct)
  }
}

/**
 * Transform parameters into a native struct.
 *
 * @param {TwapData} data As passed by the consumer of the API.
 * @returns {TwapStruct} A formatted struct as expected by the smart contract.
 */
export function transformDataToStruct(data: TwapData): TwapStruct {
  const {
    sellAmount,
    buyAmount,
    numberOfParts,
    startTime: startTime = DEFAULT_START_TIME,
    timeBetweenParts,
    durationOfPart = DEFAULT_DURATION_OF_PART,
    ...rest
  } = data

  const { partSellAmount, minPartLimit } =
    numberOfParts && !numberOfParts.isZero()
      ? {
          partSellAmount: sellAmount.div(numberOfParts),
          minPartLimit: buyAmount.div(numberOfParts),
        }
      : {
          partSellAmount: constants.Zero,
          minPartLimit: constants.Zero,
        }

  const span = durationOfPart.durationType === DurationType.AUTO ? constants.Zero : durationOfPart.duration
  const t0 = startTime.startType === StartTimeValue.AT_MINING_TIME ? constants.Zero : startTime.epoch

  return {
    partSellAmount,
    minPartLimit,
    t0,
    n: numberOfParts,
    t: timeBetweenParts,
    span,
    ...rest,
  }
}

/**
 * Transform parameters into a TWAP order struct.
 *
 * @param {TwapData} params As passed by the consumer of the API.
 * @returns {TwapStruct} A formatted struct as expected by the smart contract.
 */
export function transformStructToData(struct: TwapStruct): TwapData {
  const {
    n: numberOfParts,
    partSellAmount,
    minPartLimit,
    t: timeBetweenParts,
    t0: startEpoch,
    span,
    sellToken,
    buyToken,
    receiver,
    appData,
  } = struct

  const durationOfPart: DurationOfPart = span.isZero()
    ? { durationType: DurationType.AUTO }
    : { durationType: DurationType.LIMIT_DURATION, duration: span }

  const startTime: StartTime = span.isZero()
    ? { startType: StartTimeValue.AT_MINING_TIME }
    : { startType: StartTimeValue.AT_EPOCH, epoch: startEpoch }

  return {
    sellAmount: partSellAmount.mul(numberOfParts),
    buyAmount: minPartLimit.mul(numberOfParts),
    startTime,
    numberOfParts,
    timeBetweenParts,
    durationOfPart,
    sellToken,
    buyToken,
    receiver,
    appData,
  }
}
