import { BigNumber, ethers, utils } from 'ethers'
import { ContextFactory } from './multiplexer'
import { keccak256 } from 'ethers/lib/utils'
import { ComposableCoW__factory } from './generated'
import { IConditionalOrder } from './generated/ComposableCoW'

// Define the ABI tuple for the TWAPData struct
export const CONDITIONAL_ORDER_PARAMS_ABI = ['tuple(address handler, bytes32 salt, bytes staticInput)']

export type ConditionalOrderParams = {
  readonly handler: string
  readonly salt: string
  readonly staticInput: string
}

/**
 * An abstract base class from which all conditional orders should inherit.
 *
 * This class provides some basic functionality to help with handling conditional orders,
 * such as:
 * - Validating the conditional order
 * - Creating a human-readable string representation of the conditional order
 * - Serializing the conditional order for use with the `IConditionalOrder` struct
 * - Getting any dependencies for the conditional order
 * - Getting the off-chain input for the conditional order
 *
 * **NOTE**: Instances of conditional orders have an `id` property that is a `keccak256` hash of
 *           the serialized conditional order.
 */
export abstract class BaseConditionalOrder<T, P> {
  public readonly handler: string
  public readonly salt: string
  public readonly staticInput: T
  public readonly hasOffChainInput: boolean

  /**
   * A constructor that provides some basic validation for the conditional order.
   *
   * This constructor **MUST** be called by any class that inherits from `BaseConditionalOrder`.
   *
   * **NOTE**: The salt is optional and will be randomly generated if not provided.
   * @param handler The address of the handler for the conditional order.
   * @param salt A 32-byte string used to salt the conditional order.
   * @param staticInput The static input for the conditional order.
   * @param hasOffChainInput Whether the conditional order has off-chain input.
   * @throws If the handler is not a valid ethereum address.
   * @throws If the salt is not a valid 32-byte string.
   */
  constructor(
    handler: string,
    salt: string = keccak256(ethers.utils.randomBytes(32)),
    staticInput: P,
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

    this.handler = handler
    this.salt = salt
    this.staticInput = this.transformParamsToData(staticInput)
    this.hasOffChainInput = hasOffChainInput
  }

  /**
   * Get the concrete type of the conditional order.
   * @returns {string} The concrete type of the conditional order.
   */
  abstract get orderType(): string

  /**
   * Get the context dependency for the conditional order.
   *
   * This is used when calling `createWithContext` or `setRootWithContext` on a ComposableCoW-enabled Safe.
   * @returns The context dependency.
   */
  get context(): ContextFactory | undefined {
    return undefined
  }

  /**
   * Get the calldata for creating the conditional order.
   *
   * This will automatically determine whether or not to use `create` or `createWithContext` based on the
   * order type's context dependency.
   *
   * **NOTE**: By default, this will cause the create to emit the `ConditionalOrderCreated` event.
   * @returns The calldata for creating the conditional order.
   */
  get createCalldata(): string {
    const context = this.context
    const composableCow = ComposableCoW__factory.createInterface()
    const paramsStruct: IConditionalOrder.ConditionalOrderParamsStruct = {
      handler: this.handler,
      salt: this.salt,
      staticInput: this.encodeStaticInput(),
    }

    if (context) {
      const contextArgsAbi = context.factoryArgs
        ? utils.defaultAbiCoder.encode(context.factoryArgs.argsType, context.factoryArgs.args)
        : '0x'
      return composableCow.encodeFunctionData('createWithContext', [
        paramsStruct,
        context.address,
        contextArgsAbi,
        true,
      ])
    } else {
      return composableCow.encodeFunctionData('create', [paramsStruct, true])
    }
  }

  /**
   * Get the calldata for removing a conditional order that was created as a single order.
   * @returns The calldata for removing the conditional order.
   */
  get removeCalldata(): string {
    const composableCow = ComposableCoW__factory.createInterface()
    return composableCow.encodeFunctionData('remove', [this.id])
  }

  /**
   * Calculate the id of the conditional order.
   *
   * This is a `keccak256` hash of the serialized conditional order.
   * @returns The id of the conditional order.
   */
  get id(): string {
    return utils.keccak256(this.serialize())
  }

  /**
   * Get the `leaf` of the conditional order. This is the data that is used to create the merkle tree.
   *
   * For the purposes of this library, the `leaf` is the `ConditionalOrderParams` struct.
   * @returns The `leaf` of the conditional order.
   * @see ConditionalOrderParams
   */
  get leaf(): ConditionalOrderParams {
    return {
      handler: this.handler,
      salt: this.salt,
      staticInput: this.encodeStaticInput(),
    }
  }

  /**
   * Calculate the id of the conditional order.
   * @param leaf The `leaf` representing the conditional order.
   * @returns The id of the conditional order.
   * @see ConditionalOrderParams
   */
  static leafToId(leaf: ConditionalOrderParams): string {
    return utils.keccak256(BaseConditionalOrder.encodeParams(leaf))
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
  abstract toString(tokenFormatter?: (address: string, amount: BigNumber) => string): string

  /**
   * Serializes the conditional order into it's ABI-encoded form.
   *
   * @returns The equivalent of `IConditionalOrder.Params` for the conditional order.
   */
  abstract serialize(): string

  /**
   * Encode the `staticInput` for the conditional order.
   * @returns The ABI-encoded `staticInput` for the conditional order.
   * @see ConditionalOrderParams
   */
  abstract encodeStaticInput(): string

  /**
   * A helper function for generically serializing a conditional order's static input.
   * @param orderDataTypes ABI types for the order's data struct.
   * @param staticInput The order's data struct.
   * @returns An ABI-encoded representation of the order's data struct.
   */
  protected encodeStaticInputHelper(orderDataTypes: string[], staticInput: T): string {
    try {
      return utils.defaultAbiCoder.encode(orderDataTypes, [staticInput])
    } catch (e) {
      throw new Error('SerializationFailed')
    }
  }

  /**
   * Apply any transformations to the parameters that are passed in to the constructor.
   *
   * **NOTE**: This should be overridden by any conditional order that requires transformations.
   * This implementation is a no-op.
   * @param params {P} Parameters that are passed in to the constructor.
   * @returns {T} The static input for the conditional order.
   */
  protected transformParamsToData(params: P): T {
    return params as unknown as T
  }

  /**
   * Encode the `ConditionalOrderParams` for the conditional order.
   * @param leaf The `ConditionalOrderParams` struct representing the conditional order as taken from a merkle tree.
   * @returns The ABI-encoded conditional order.
   * @see ConditionalOrderParams
   */
  static encodeParams(leaf: ConditionalOrderParams): string {
    try {
      return utils.defaultAbiCoder.encode(CONDITIONAL_ORDER_PARAMS_ABI, [leaf])
    } catch (e) {
      throw new Error('SerializationFailed')
    }
  }

  /**
   * Decode the `ConditionalOrderParams` for the conditional order.
   * @param encoded The encoded conditional order.
   * @returns The decoded conditional order.
   */
  static decodeParams(encoded: string): ConditionalOrderParams {
    try {
      return utils.defaultAbiCoder.decode(CONDITIONAL_ORDER_PARAMS_ABI, encoded)[0]
    } catch (e) {
      throw new Error('DeserializationFailed')
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
      const { handler: recoveredHandler, salt, staticInput } = BaseConditionalOrder.decodeParams(s)

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
