import { AdapterUtils, Address } from '@cowprotocol/sdk-common'
import { BigNumberish, BytesLike, ethers, TypedDataDomain, TypedDataField } from 'ethers'
import { ParamType } from 'ethers/lib/utils'

type Abi = ConstructorParameters<typeof ethers.utils.Interface>[0]

export class EthersV5Utils implements AdapterUtils {
  toUtf8Bytes(text: string): Uint8Array {
    return ethers.utils.toUtf8Bytes(text)
  }

  createInterface(abi: Abi): ethers.utils.Interface {
    return new ethers.utils.Interface(abi)
  }

  getCreate2Address(from: string, salt: BytesLike, initCodeHash: BytesLike): string {
    return ethers.utils.getCreate2Address(from, salt, initCodeHash)
  }

  hexConcat(items: ReadonlyArray<BytesLike>): string {
    return ethers.utils.hexConcat(items)
  }

  formatBytes32String(text: string): string {
    return ethers.utils.formatBytes32String(text)
  }

  encodeDeploy(encodeDeployArgs: unknown[], abi: Abi) {
    const contractInterface = new ethers.utils.Interface(abi)
    return contractInterface.encodeDeploy(encodeDeployArgs)
  }

  keccak256(data: BytesLike) {
    return ethers.utils.keccak256(data)
  }

  hexZeroPad(value: BytesLike, length: number): string {
    return ethers.utils.hexZeroPad(value, length)
  }

  arrayify(hexString: string): Uint8Array {
    return ethers.utils.arrayify(hexString)
  }

  hexlify(value: BytesLike): string {
    return ethers.utils.hexlify(value)
  }

  solidityPack(types: string[], values: unknown[]): string {
    return ethers.utils.solidityPack(types, values)
  }

  hashTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    data: Record<string, unknown>,
  ): string {
    return ethers.utils._TypedDataEncoder.hash(domain, types, data)
  }

  getChecksumAddress(address: string): string {
    return ethers.utils.getAddress(address)
  }

  encodeAbi(types: string[], values: unknown[]): BytesLike {
    return ethers.utils.defaultAbiCoder.encode(types, values)
  }

  decodeAbi(types: string[], data: BytesLike): unknown[] {
    const decoded = ethers.utils.defaultAbiCoder.decode(types, data)
    return decoded.map((x) => this.convertBigNumbersToBigInt(x))
  }

  private convertBigNumbersToBigInt(value: any): any {
    if (ethers.BigNumber.isBigNumber(value)) {
      return value.toBigInt()
    }

    // Check if it's the special ethers Result object (has numeric indices + named props)
    if (value && typeof value === 'object' && typeof value.length === 'number') {
      // Create array-like object preserving both access patterns
      const result: any = []

      // Copy numeric indices
      for (let i = 0; i < value.length; i++) {
        result[i] = this.convertBigNumbersToBigInt(value[i])
      }

      // Copy named properties
      for (const [key, val] of Object.entries(value)) {
        if (isNaN(Number(key)) && key !== 'length') {
          result[key] = this.convertBigNumbersToBigInt(val)
        }
      }

      return result
    }

    if (value && typeof value === 'object') {
      const result: any = {}
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.convertBigNumbersToBigInt(val)
      }
      return result
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.convertBigNumbersToBigInt(item))
    }

    return value
  }

  id(text: string): BytesLike {
    return ethers.utils.id(text)
  }

  toBigIntish(value: BytesLike | string | number): BigNumberish {
    return ethers.BigNumber.from(value).toBigInt()
  }

  newBigintish(value: number | string): BigNumberish {
    return ethers.BigNumber.from(value).toBigInt()
  }

  hexDataSlice(data: BytesLike, offset: number, endOffset?: number): BytesLike {
    return ethers.utils.hexDataSlice(data, offset, endOffset)
  }

  joinSignature(signature: { r: string; s: string; v: number }): string {
    return ethers.utils.joinSignature(signature)
  }

  splitSignature(signature: BytesLike): { r: string; s: string; v: number } {
    const split = ethers.utils.splitSignature(signature)
    return {
      r: split.r,
      s: split.s,
      v: split.v,
    }
  }

  verifyMessage(message: string | Uint8Array, signature: BytesLike): string {
    return ethers.utils.verifyMessage(message, signature)
  }

  verifyTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<{ name: string; type: string }>>,
    value: Record<string, unknown>,
    signature: BytesLike,
  ): string {
    return ethers.utils.verifyTypedData(domain, types, value, signature)
  }

  encodeFunction(
    abi: Array<{ name: string; inputs: Array<{ type: string }> }>,
    functionName: string,
    args: unknown[],
  ): string {
    const iface = new ethers.utils.Interface(abi)
    return iface.encodeFunctionData(functionName, args)
  }

  decodeFunctionData(
    abi: Array<{ name: string; inputs: Array<{ type: string }> }>,
    functionName: string,
    data: string,
  ): any {
    const iface = new ethers.utils.Interface(abi)
    const result = iface.decodeFunctionData(functionName, data)

    // Convert to array with named properties for consistency across adapters
    const args = Array.from(result)

    // Add named properties based on the function ABI inputs
    const functionAbi = iface.getFunction(functionName)
    if (functionAbi && functionAbi.inputs) {
      functionAbi.inputs.forEach((input: any, index) => {
        if (input.name && args[index] !== undefined) {
          ;(args as any)[input.name] = args[index]
        }
      })
    }

    return args
  }

  toNumber(value: BigNumberish): number {
    return ethers.BigNumber.from(value).toNumber()
  }

  solidityKeccak256(types: string[], values: unknown[]): unknown {
    return ethers.utils.solidityKeccak256(types, values)
  }

  hashDomain(domain: TypedDataDomain): string {
    return ethers.utils._TypedDataEncoder.hashDomain(domain)
  }

  async grantRequiredRoles(
    authorizerAddress: string,
    authorizerAbi: Abi,
    vaultAddress: string,
    vaultRelayerAddress: string,
    contractCall: (address: string, abi: Abi, functionName: string, args: unknown[]) => Promise<void>,
  ): Promise<void> {
    /**
     * Balancer Vault partial ABI interface.
     *
     * This definition only contains the Vault methods that are used by GPv2 Vault
     * relayer. It is copied here to avoid relying on build artifacts.
     */
    const vaultAbi = [
      'function manageUserBalance((uint8, address, uint256, address, address)[])',
      'function batchSwap(uint8, (bytes32, uint256, uint256, uint256, bytes)[], address[], (address, bool, address, bool), int256[], uint256)',
    ]

    // Create interface using ethers utils
    const vaultInterface = new ethers.utils.Interface(vaultAbi)

    // Iterate through all functions in the interface
    for (const name in vaultInterface.functions) {
      // Get function selector (first 4 bytes of function signature hash)
      const functionSelector = vaultInterface.getSighash(name)

      // Compute role hash using solidityKeccak256
      const roleHash = ethers.utils.solidityKeccak256(['uint256', 'bytes4'], [vaultAddress, functionSelector])

      // Call grantRole on the authorizer contract
      await contractCall(authorizerAddress, authorizerAbi, 'grantRole', [roleHash, vaultRelayerAddress])
    }
  }

  async readStorage(
    baseAddress: Address,
    baseAbi: Abi,
    readerAddress: Address,
    readerAbi: Abi,
    provider: ethers.providers.JsonRpcProvider,
    method: string,
    parameters: unknown[],
  ) {
    const base = new ethers.Contract(baseAddress, baseAbi, provider)
    const reader = new ethers.Contract(readerAddress, readerAbi, provider)

    const encodedCall = reader.interface.encodeFunctionData(method, parameters)
    if (!base.callStatic.simulateDelegatecall) {
      throw new Error('simulateDelegatecall method not found on base contract')
    }
    const resultBytes = await base.callStatic.simulateDelegatecall(reader.address, encodedCall)
    return reader.interface.decodeFunctionResult(method, resultBytes)[0]
  }

  randomBytes(length: number): string {
    return ethers.utils.hexlify(ethers.utils.randomBytes(length))
  }

  isAddress(address: string): boolean {
    return ethers.utils.isAddress(address)
  }

  isHexString(value: string): boolean {
    return ethers.utils.isHexString(value)
  }

  hexDataLength(data: string): number {
    return ethers.utils.hexDataLength(data)
  }

  parseUnits(value: string, decimals: number): bigint {
    return ethers.utils.parseUnits(value, decimals).toBigInt()
  }

  getParamType(type: string): ParamType {
    return ethers.utils.ParamType.from(type)
  }

  getParamTypeFromString(type: string): ParamType {
    return ethers.utils.ParamType.fromString(type)
  }

  isInterface(value: any): boolean {
    return ethers.utils.Interface.isInterface(value)
  }
}
