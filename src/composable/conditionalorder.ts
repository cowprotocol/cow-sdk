// Requires an  order types to implement (add / update to modify initial state), serialize for the IConditionalOrder.Params struct.
// Some method for poll that can be used to determine the input data for offchainInput.

import { BigNumber, ethers, utils } from 'ethers'
import { Context } from './multiplexer'
import { keccak256 } from 'ethers/lib/utils'

// Define the ABI tuple for the TWAPData struct
export const CONDITIONAL_ORDER_PARAMS_ABI = ['tuple(address handler, bytes32 salt, bytes staticInput)']

export abstract class BaseConditionalOrder {
  public readonly orderType: string
  public readonly address: string
  public readonly salt: string
  public readonly hasOffChainInput: boolean

  protected constructor(orderType: string, address: string, salt: string = keccak256(ethers.utils.randomBytes(32))) {
    // Verify input to the constructor
    // 1. Verify that the address is a valid ethereum address
    if (!ethers.utils.isAddress(address)) {
      throw new Error(`Invalid address: ${address}`)
    }

    // 2. Verify that the salt is a valid 32-byte string usable with ethers
    if (!ethers.utils.isHexString(salt) || ethers.utils.hexDataLength(salt) !== 32) {
      throw new Error(`Invalid salt: ${salt}`)
    }

    this.orderType = orderType
    this.address = address
    this.salt = salt
    this.hasOffChainInput = false
  }

  /**
   * Get the context dependency for the conditional order.
   *
   * This is used when calling `createWithContext` or `setRootWithContext` on a ComposableCoW-enabled Safe.
   * @returns The context dependency.
   */
  abstract get context(): Context

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
   * Validate the conditional order.
   * @param o The conditional order to validate.
   * @returns Whether the conditional order is valid.
   */
  abstract isValid(o: any): boolean

  /**
   * Serializes the conditional order into it's ABI-encoded form.
   *
   * @returns The equivalent of `IConditionalOrder.Params` for the conditional order.
   */
  abstract serialize(): string

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

  protected serializeHelper<T>(orderDataTypes: string[], data: T): string {
    try {
      const payload = utils.defaultAbiCoder.encode(orderDataTypes, [data])
      return utils.defaultAbiCoder.encode(CONDITIONAL_ORDER_PARAMS_ABI, [[this.address, this.salt, payload]])
    } catch (e) {
      throw new Error('SerializationFailed')
    }
  }

  protected static deserializeHelper<T>(
    s: string,
    address: string,
    orderDataTypes: string[],
    callback: (d: any, salt: string) => T
  ): T {
    try {
      // First, decode the `IConditionalOrder.Params` struct
      const [[handler, salt, staticInput]] = utils.defaultAbiCoder.decode(CONDITIONAL_ORDER_PARAMS_ABI, s) as [string[]]

      // Second, verify that the address is the correct handler
      if (!(handler == address)) throw new Error('HandlerMismatch')

      // Third, decode the data struct
      const [d] = utils.defaultAbiCoder.decode(orderDataTypes, staticInput)

      // Create a new instance of the class
      return callback(d, salt)
    } catch (e) {
      throw new Error('InvalidSerializedConditionalOrder')
    }
  }
}
