// Requires an  order types to implement (add / update to modify initial state), serialize for the IConditionalOrder.Params struct.
// Some method for poll that can be used to determine the input data for offchainInput.

import { BigNumber, ethers, utils } from 'ethers'
import { Context } from './multiplexer'
import { keccak256 } from 'ethers/lib/utils'

// Define the ABI tuple for the TWAPData struct
export const CONDITIONAL_ORDER_PARAMS_ABI = ['tuple(address handler, bytes32 salt, bytes staticInput)']

/**
 * An abstract base class from which all conditional orders should inherit.
 *
 * This class provids some basic functionality to help with handling conditional orders,
 * such as:
 * - Validating the conditional order
 * - Creating a human-readable string representation of the conditional order
 * - Serializing the conditional order for use with the `IConditionalOrder` struct
 * - Getting any dependencies for the conditional order
 * - Getting the off-chain input for the conditional order
 */
export abstract class BaseConditionalOrder<T> {
  public readonly orderType: string
  public readonly handler: string
  public readonly salt: string
  public readonly staticInput: T
  public readonly hasOffChainInput: boolean

  protected constructor(
    orderType: string,
    handler: string,
    salt: string = keccak256(ethers.utils.randomBytes(32)),
    staticInput: T,
    hasOffChainInput = false
  ) {
    // Verify input to the constructor
    // 1. Verify that the handler is a valid ethereum address
    if (!ethers.utils.isAddress(handler)) {
      throw new Error(`Invalid handler: ${handler}`)
    }

    // 2. Verify that the salt is a valid 32-byte string usable with ethers
    if (!ethers.utils.isHexString(salt) || ethers.utils.hexDataLength(salt) !== 32) {
      throw new Error(`Invalid salt: ${salt}`)
    }

    this.orderType = orderType
    this.handler = handler
    this.salt = salt
    this.staticInput = staticInput
    this.hasOffChainInput = hasOffChainInput
  }

  /**
   * Get the context dependency for the conditional order.
   *
   * This is used when calling `createWithContext` or `setRootWithContext` on a ComposableCoW-enabled Safe.
   * @returns The context dependency.
   */
  get context(): Context | undefined {
    return undefined
  }

  /**
   * If the conditional order has off-chain input, return it!
   *
   * **NOTE**: This should be overridden by any conditional order that has off-chain input.
   * @returns The off-chain input.
   */
  get offChainInput(): string {
    return '0x'
  }

  /**
   * Helper method for validating ABI types.
   * @param types ABI types to validate against.
   * @param values The values to validate.
   * @returns {boolean} Whether the values are valid ABI for the given types.
   */
  protected static isValidAbi(types: readonly (string | ethers.utils.ParamType)[], values: any[]): boolean {
    try {
      ethers.utils.defaultAbiCoder.encode(types, values)
    } catch (e) {
      return false
    }
    return true
  }

  /**
   * Create a human-readable string representation of the conditional order.
   * @param tokenFormatter An optional function that takes an address and an amount and returns a human-readable string.
   */
  abstract toString(tokenFormatter: ((address: string, amount: BigNumber) => string) | undefined): string

  /**
   * Serializes the conditional order into it's ABI-encoded form.
   *
   * @returns The equivalent of `IConditionalOrder.Params` for the conditional order.
   */
  abstract serialize(): string

  /**
   * A helper function for generically serializing a conditional order.
   * @param orderDataTypes ABI types for the order's data struct.
   * @param data The order's data struct.
   * @returns An ABI-encoded `IConditionalOrder.Params` struct.
   */
  protected serializeHelper(orderDataTypes: string[], data: T): string {
    try {
      const payload = utils.defaultAbiCoder.encode(orderDataTypes, [data])
      return utils.defaultAbiCoder.encode(CONDITIONAL_ORDER_PARAMS_ABI, [[this.handler, this.salt, payload]])
    } catch (e) {
      throw new Error('SerializationFailed')
    }
  }

  /**
   * A helper function for generically deserializing a conditional order.
   * @param s The ABI-encoded `IConditionalOrder.Params` struct to deserialize.
   * @param handler Address of the handler for the conditional order.
   * @param orderDataTypes ABI types for the order's data struct.
   * @param callback A callback function that takes the deserialized data struct and the salt and returns an instance of the class.
   * @returns An instance of the conditional order class.
   */
  protected static deserializeHelper<T>(
    s: string,
    handler: string,
    orderDataTypes: string[],
    callback: (d: any, salt: string) => T
  ): T {
    try {
      // First, decode the `IConditionalOrder.Params` struct
      const [[recoveredHandler, salt, staticInput]] = utils.defaultAbiCoder.decode(CONDITIONAL_ORDER_PARAMS_ABI, s) as [
        string[]
      ]

      // Second, verify that the recovered handler is the correct handler
      if (!(recoveredHandler == handler)) throw new Error('HandlerMismatch')

      // Third, decode the data struct
      const [d] = utils.defaultAbiCoder.decode(orderDataTypes, staticInput)

      // Create a new instance of the class
      return callback(d, salt)
    } catch (e: any) {
      if (e.message === 'HandlerMismatch') {
        throw e
      } else {
        throw new Error('InvalidSerializedConditionalOrder')
      }
    }
  }
}
