import { AdapterUtils, ContractValue, CowError, ParamType as CommonParamType } from '@cowprotocol/sdk-common'
import {
  Interface,
  TypedDataField,
  AbiCoder,
  getCreate2Address,
  concat,
  BytesLike,
  encodeBytes32String,
  toUtf8Bytes,
  keccak256,
  BigNumberish,
  zeroPadValue,
  getBytes,
  hexlify as ethersHexlify,
  solidityPacked,
  TypedDataEncoder,
  id,
  toBigInt,
  dataSlice,
  Signature,
  SignatureLike,
  verifyTypedData,
  verifyMessage,
  InterfaceAbi,
  getAddress,
  solidityPackedKeccak256,
  Contract,
  JsonRpcProvider,
  parseUnits,
  ParamType,
  isAddress,
} from 'ethers'
import { TypedDataDomain } from 'ethers'
import { EthersV6InterfaceWrapper } from './EthersV6InterfaceWrapper'

type Abi = ConstructorParameters<typeof Interface>[0]

export class EthersV6Utils implements AdapterUtils {
  toUtf8Bytes(text: string): Uint8Array {
    return toUtf8Bytes(text)
  }

  encodeDeploy(encodeDeployArgs: ContractValue[], abi: Abi): string {
    const abiCoder = new AbiCoder()
    const contractInterface = new Interface(abi)

    const constructorFragment = contractInterface.getFunction('constructor')

    if (!constructorFragment) {
      // No constructor parameters, return empty string
      return '0x'
    }

    // Encode the constructor parameters
    return abiCoder.encode(constructorFragment.inputs, encodeDeployArgs as readonly unknown[])
  }

  getCreate2Address(from: string, salt: BytesLike, initCodeHash: BytesLike): string {
    // Convert BytesLike to ethers BytesLike if necessary
    const ethersSalt = this.toEthersBytesLike(salt)
    const ethersInitCodeHash = this.toEthersBytesLike(initCodeHash)

    // Use ethers getCreate2Address
    return getCreate2Address(from, ethersSalt, ethersInitCodeHash)
  }

  hexConcat(items: ReadonlyArray<BytesLike>): string {
    // Convert each BytesLike to ethers BytesLike
    const ethersItems = items.map((item) => this.toEthersBytesLike(item))

    // Use ethers concat
    return concat(ethersItems)
  }

  formatBytes32String(text: string): string {
    return encodeBytes32String(text)
  }

  keccak256(data: BytesLike): string {
    return keccak256(this.toEthersBytesLike(data))
  }

  // Helper method to convert our BytesLike to ethers BytesLike
  private toEthersBytesLike(data: BytesLike): BytesLike {
    if (typeof data === 'string') {
      if (data.startsWith('0x')) {
        return data
      }
      // Convert string to bytes
      return toUtf8Bytes(data)
    } else if (data instanceof Uint8Array) {
      return data
    } else if (Array.isArray(data)) {
      return new Uint8Array(data)
    } else {
      throw new CowError('Unsupported data type for conversion to BytesLike')
    }
  }

  hexZeroPad(value: BytesLike, length: number): string {
    return zeroPadValue(value, length)
  }

  arrayify(hexString: string): Uint8Array {
    return getBytes(hexString)
  }

  hexlify(value: Uint8Array): string {
    return ethersHexlify(value)
  }

  solidityPack(types: string[], values: ContractValue[]): string {
    return solidityPacked(types, values)
  }

  hashTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    data: Record<string, unknown>,
  ): string {
    return TypedDataEncoder.hash(domain, types, data)
  }

  getChecksumAddress(address: string): string {
    return getAddress(address)
  }

  encodeAbi(types: string[], values: ContractValue[]): BytesLike {
    return AbiCoder.defaultAbiCoder().encode(types, values)
  }

  decodeAbi(types: string[], data: BytesLike): ContractValue[] {
    return AbiCoder.defaultAbiCoder().decode(types, data)
  }

  id(text: string): BytesLike {
    return id(text)
  }

  toBigIntish(value: string | number | BigNumberish): BigNumberish {
    return toBigInt(value)
  }

  hexDataSlice(data: BytesLike, offset: number, endOffset?: number): BytesLike {
    return dataSlice(data, offset, endOffset)
  }

  joinSignature(signature: { r: string; s: string; v: number }): string {
    return Signature.from({
      r: signature.r,
      s: signature.s,
      v: signature.v,
    }).serialized
  }

  splitSignature(signature: BytesLike): { r: string; s: string; v: number } {
    const sig = Signature.from(signature as SignatureLike)
    return {
      r: sig.r,
      s: sig.s,
      v: sig.v,
    }
  }

  verifyMessage(message: string | Uint8Array, signature: SignatureLike): string {
    return verifyMessage(message, signature)
  }

  verifyTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<{ name: string; type: string }>>,
    value: Record<string, unknown>,
    signature: SignatureLike,
  ): string {
    return verifyTypedData(domain, types, value, signature)
  }

  encodeFunction(
    abi: Array<{ name: string; inputs: Array<{ type: string }> }>,
    functionName: string,
    args: ContractValue[],
  ): string {
    const iface = new Interface(abi)
    return iface.encodeFunctionData(functionName, args)
  }

  decodeFunctionData(
    abi: Array<{ name: string; inputs: Array<{ type: string }> }>,
    functionName: string,
    data: string,
  ): ContractValue[] {
    const iface = new Interface(abi)
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
    return Number(value.toString())
  }

  solidityKeccak256(types: string[], values: ContractValue[]): string {
    return solidityPackedKeccak256(types, values)
  }

  createInterface(abi: InterfaceAbi): EthersV6InterfaceWrapper {
    return new EthersV6InterfaceWrapper(abi)
  }

  hashDomain(domain: TypedDataDomain): string {
    return TypedDataEncoder.hashDomain(domain)
  }

  async grantRequiredRoles(
    authorizerAddress: string,
    authorizerAbi: Abi,
    vaultAddress: string,
    vaultRelayerAddress: string,
    contractCall: (address: string, abi: Abi, functionName: string, args: ContractValue[]) => Promise<void>,
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

    // Create interface using ethers v6
    const vaultInterface = new Interface(vaultAbi)

    // Get function names directly from the interface
    const functionNames = ['manageUserBalance', 'batchSwap']

    for (const functionName of functionNames) {
      // Get function selector (first 4 bytes of function signature hash)
      //eslint-disable-next-line
      const functionSelector = vaultInterface.getFunction(functionName)!.selector

      // Compute role hash using solidityPackedKeccak256
      const roleHash = solidityPackedKeccak256(['uint256', 'bytes4'], [vaultAddress, functionSelector])

      // Call grantRole on the authorizer contract
      await contractCall(authorizerAddress, authorizerAbi, 'grantRole', [roleHash, vaultRelayerAddress])
    }
  }

  async readStorage(
    baseAddress: string,
    baseAbi: any[],
    readerAddress: string,
    readerAbi: any[],
    provider: JsonRpcProvider,
    method: string,
    parameters: ContractValue[],
  ) {
    const base = new Contract(baseAddress, baseAbi, provider)

    const readerInterface = new Interface(readerAbi)
    const encodedCall = readerInterface.encodeFunctionData(method, parameters)

    if (!base.simulateDelegatecall?.staticCall) {
      throw new CowError('simulateDelegatecall method not found on base contract')
    }

    const resultBytes = await base.simulateDelegatecall.staticCall(readerAddress, encodedCall)

    return readerInterface.decodeFunctionResult(method, resultBytes)[0]
  }

  randomBytes(length: number): string {
    return ethersHexlify(crypto.getRandomValues(new Uint8Array(length)))
  }

  isAddress(address: string): boolean {
    return isAddress(address)
  }

  isHexString(value: string): boolean {
    return typeof value === 'string' && /^0x[0-9a-fA-F]*$/.test(value)
  }

  hexDataLength(data: string): number {
    if (!this.isHexString(data)) {
      throw new CowError('Invalid hex string')
    }
    return (data.length - 2) / 2
  }

  parseUnits(value: string, decimals: number): bigint {
    return parseUnits(value, decimals)
  }

  getParamType(type: string): CommonParamType {
    return ParamType.from(type) as unknown as CommonParamType
  }

  getParamTypeFromString(type: string): CommonParamType {
    return ParamType.from(type) as unknown as CommonParamType
  }

  isInterface(value: any): boolean {
    if (value instanceof Interface) {
      return true
    }
    if (
      value &&
      typeof value === 'object' &&
      typeof value.functions === 'object' &&
      typeof value.getSighash === 'function' &&
      Array.isArray(value.fragments)
    ) {
      return true
    }
    return false
  }
}
