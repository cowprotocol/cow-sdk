import {
  Bytes,
  Abi,
  TypedDataDomain,
  BigIntish,
  SignatureLike,
  ContractInterface,
  TypedDataTypes,
  Address,
  Provider,
} from '.'

/**
 * Abstract class defining the interface for adapter utilities
 * Based on the EthersV6Utils implementation
 */
export abstract class AdapterUtils {
  /**
   * Converts a string to UTF-8 bytes
   */
  abstract toUtf8Bytes(text: string): Uint8Array

  /**
   * Encodes deployment arguments for a contract
   */
  abstract encodeDeploy<C>(encodeDeployArgs: unknown, abi: Abi): string

  /**
   * Computes a CREATE2 address
   */
  abstract getCreate2Address(from: string, salt: Bytes, initCodeHash: Bytes): string

  /**
   * Concatenates multiple Bytes values
   */
  abstract hexConcat(items: ReadonlyArray<Bytes>): string

  /**
   * Formats a string as a bytes32 string
   */
  abstract formatBytes32String(text: string): string

  /**
   * Computes the keccak256 hash of data
   */
  abstract keccak256(data: Bytes): string

  /**
   * Pads a value with zeros to the specified length
   */
  abstract hexZeroPad(value: Bytes, length: number): string

  /**
   * Converts a hex string to a Uint8Array
   */
  abstract arrayify(hexString: string): Uint8Array

  /**
   * Converts a Uint8Array to a hex string
   */
  abstract hexlify(value: Bytes): string

  /**
   * Packs values according to Solidity's packed encoding rules
   */
  abstract solidityPack(types: string[], values: any[]): string

  /**
   * Hashes EIP-712 typed data
   */
  abstract hashTypedData(domain: TypedDataDomain, types: TypedDataTypes, data: Record<string, unknown>): string

  /**
   * Returns the checksum address of an Ethereum address
   */
  abstract getChecksumAddress(address: string): string

  /**
   * Encodes values using ABI encoding
   */
  abstract encodeAbi(types: unknown[], values: unknown[]): Bytes

  /**
   * Decodes ABI encoded data
   */
  abstract decodeAbi(types: string[], data: Bytes): unknown[]

  /**
   * Computes the id (keccak256 hash) of a string
   */
  abstract id(text: string): Bytes

  /**
   * Converts a value to a BigIntish
   */
  abstract toBigIntish(value: string | number | BigIntish): BigIntish

  /**
   * Creates a new BigIntish from a number or string
   */
  abstract newBigintish(value: number | string): BigIntish

  /**
   * Slices a portion of hex data
   */
  abstract hexDataSlice(data: Bytes, offset: number, endOffset?: number): Bytes

  /**
   * Joins the components of a signature into a single string
   */
  abstract joinSignature(signature: { r: string; s: string; v: number }): string

  /**
   * Splits a signature into its components
   */
  abstract splitSignature(signature: Bytes): { r: string; s: string; v: number }

  /**
   * Verifies a signed message
   */
  abstract verifyMessage(message: string | Uint8Array, signature: SignatureLike): string | Promise<string>

  /**
   * Verifies a signed typed data structure
   */
  abstract verifyTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<{ name: string; type: string }>>,
    value: Record<string, unknown>,
    signature: SignatureLike,
  ): string | Promise<string>

  /**
   * Encodes a function call
   */
  abstract encodeFunction(
    abi: Array<{ name: string; inputs: Array<{ type: string }> }>,
    functionName: string,
    args: unknown[],
  ): Bytes

  /**
   * Converts a BigIntish to a number
   */
  abstract toNumber(value: BigIntish): number

  /**
   * Computes the keccak256 hash of values according to Solidity's packed encoding rules
   */
  abstract solidityKeccak256(types: string[], values: unknown[]): unknown

  /**
   * Creates an Interface instance from an ABI
   */
  abstract createInterface(abi: unknown): ContractInterface

  /**
   * Grants the required roles to the specified Vault relayer.
   * Framework-agnostic method that delegates contract instantiation and calling to the adapter.
   *
   * @param authorizerAddress The address of the Vault authorizer contract that manages access.
   * @param authorizerAbi The ABI of the authorizer contract.
   * @param vaultAddress The address to the Vault.
   * @param vaultRelayerAddress The address to the GPv2 Vault relayer contract.
   * @param contractCall Function to execute the contract call (provided by the adapter).
   */
  abstract grantRequiredRoles(
    authorizerAddress: string,
    authorizerAbi: Abi,
    vaultAddress: string,
    vaultRelayerAddress: string,
    contractCall: (address: string, abi: Abi, functionName: string, args: unknown[]) => Promise<void>,
  ): Promise<void>

  /**
   * A generic method used to obfuscate the complexity of reading storage
   * of any StorageAccessible contract. That is, this method does the work of
   * 1. Encoding the function call on the reader
   * 2. Simulates delegatecall of storage read with encoded calldata
   * 3. Decodes the returned bytes from the storage read into expected return value.
   */
  abstract readStorage(
    baseAddress: Address,
    baseAbi: Abi,
    readerAddress: Address,
    readerAbi: Abi,
    provider: Provider,
    method: string,
    parameters: unknown[],
  ): Promise<any>
}
