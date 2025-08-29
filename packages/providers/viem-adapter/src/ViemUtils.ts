import {
  AdapterUtils,
  ContractValue,
  CowError,
  TypedDataDomain as TypedDataDomainCommon,
  ParamType as CommonParamType,
} from '@cowprotocol/sdk-common'
import {
  encodeDeployData,
  Abi,
  getCreate2Address,
  Hex,
  Address,
  concat,
  stringToBytes,
  keccak256,
  TypedDataDomain,
  padHex,
  hexToBytes,
  encodePacked,
  hashTypedData,
  getAddress,
  encodeAbiParameters,
  decodeAbiParameters,
  stringToHex,
  hexToBigInt,
  slice,
  parseAbi,
  encodeFunctionData,
  decodeFunctionData,
  recoverMessageAddress,
  recoverTypedDataAddress,
  toFunctionSelector,
  AbiFunction,
  PublicClient,
  decodeFunctionResult,
  toHex,
  isAddress,
  isHex,
  AbiParameter,
  parseUnits,
  sliceHex,
} from 'viem'
import { ViemInterfaceWrapper } from './ViemInterfaceWrapper'
import { ViemParamType } from './ViemParamtype'

export class ViemUtils implements AdapterUtils {
  toUtf8Bytes(text: string): Uint8Array {
    return stringToBytes(text)
  }

  encodeDeploy(bytecode: `0x${string}`, abi: Abi): string {
    return encodeDeployData({
      abi,
      bytecode,
    })
  }

  getCreate2Address(from: Address, salt: Hex, bytecodeHash: Hex): `0x${string}` {
    return getCreate2Address({
      from,
      salt,
      bytecodeHash,
    })
  }

  hexConcat(items: ReadonlyArray<Hex | number[]>): string {
    // Convert  every item to Uint8Array
    const normalized = items.map((item) => {
      if (item instanceof Uint8Array) return item
      if (Array.isArray(item)) return new Uint8Array(item)
      if (typeof item === 'string') {
        // Convert string to Uint8Array
        const hex = item.startsWith('0x') ? item.slice(2) : item
        const matches = hex.length ? hex.match(/.{1,2}/g) : null
        const bytes = matches ? matches.map((b) => parseInt(b, 16)) : []
        return new Uint8Array(bytes)
      }
      // For other types, convert to string first
      const str = String(item)
      const hex = str.startsWith('0x') ? str.slice(2) : str
      const matches = hex.length ? hex.match(/.{1,2}/g) : null
      const bytes = matches ? matches.map((b) => parseInt(b, 16)) : []
      return new Uint8Array(bytes)
    })
    normalized.forEach((x, i) => {
      if (!(x instanceof Uint8Array)) {
        throw new CowError(`hexConcat: position ${i} is not a Uint8Array: ${typeof x}`)
      }
    })
    const result = concat(normalized as Uint8Array[])
    return this.bytesToHex(result)
  }

  formatBytes32String(text: string): string {
    const bytes = stringToBytes(text)
    const paddedBytes = this.padBytes(bytes, 32)
    return paddedBytes
  }

  keccak256(data: Hex): string {
    return keccak256(data)
  }

  private bytesToHex(bytes: Uint8Array): Hex {
    return `0x${Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')}` as Hex
  }

  private padBytes(bytes: Uint8Array, length: number): Hex {
    const result = new Uint8Array(length)
    result.set(bytes.slice(0, length))
    return this.bytesToHex(result)
  }

  hexZeroPad(value: Hex, length: number): string {
    return padHex(value, { size: length })
  }

  arrayify(hexString: string): Uint8Array {
    return hexToBytes(hexString as Hex)
  }

  hexlify(value: `0x${string}` | Uint8Array): string {
    if (typeof value === 'string') return value
    return this.bytesToHex(value)
  }

  solidityPack(types: string[], values: ContractValue[]): string {
    return encodePacked(types, values)
  }

  hashTypedData(domain: TypedDataDomainCommon, types: Record<string, unknown>, data: Record<string, unknown>): string {
    const primaryType = Object.keys(types)[0]
    if (!primaryType) {
      throw new Error('No primary type found in types')
    }
    const domainTypedDataDomain = domain as TypedDataDomain
    return hashTypedData({
      domain: domainTypedDataDomain,
      types: types as Record<string, unknown>,
      primaryType,
      message: data,
    })
  }

  getChecksumAddress(address: Address): Address {
    return getAddress(address)
  }

  encodeAbi(types: { type: string; name: string }[] | string[], values: ContractValue[]): `0x${string}` {
    if (typeof types[0] === 'string') {
      return encodeAbiParameters(
        (types as string[]).map((type, i) => ({ type, name: `arg${i}` })) as AbiParameter[],
        values,
      )
    }
    return encodeAbiParameters(types as AbiParameter[], values)
  }

  decodeAbi(types: (string | { type: string; name: string })[], data: `0x${string}`): unknown[] {
    if (typeof types[0] === 'string')
      return decodeAbiParameters(types.map((type, i) => ({ type, name: `arg${i}` })) as AbiParameter[], data)
    return decodeAbiParameters(types as AbiParameter[], data)
  }

  id(text: string): `0x${string}` {
    return keccak256(stringToHex(text))
  }

  toBigIntish(value: `0x${string}` | string | number): bigint {
    if (typeof value === 'number') return BigInt(value)
    if (typeof value === 'string') {
      if (value.startsWith('0x')) return hexToBigInt(value as `0x${string}`)
      return BigInt(value)
    }
    return hexToBigInt(value)
  }

  hexDataSlice(data: `0x${string}`, offset: number, endOffset?: number): `0x${string}` {
    return sliceHex(data, offset, endOffset)
  }

  joinSignature(signature: { r: string; s: string; v: number }): string {
    // Convert r, s, v to Viem's signature format
    const r = signature.r as `0x${string}`
    const s = signature.s as `0x${string}`
    const v = signature.v

    // Join the signature components
    return concat([r, s, v === 27 ? '0x1b' : '0x1c']) as string
  }

  splitSignature(signature: `0x${string}`): { r: string; s: string; v: number } {
    // Ensure the signature is at least 65 bytes (r + s + v)
    if (signature.length < 132) {
      throw new Error('Invalid signature length')
    }

    // Split the signature into r, s, v components
    const r = slice(signature, 0, 32) as `0x${string}`
    const s = slice(signature, 32, 64) as `0x${string}`

    // The v value is the last byte
    const vByte = slice(signature, 64, 65) as `0x${string}`
    const vInt = Number(hexToBigInt(vByte))

    // Normalize v to 27 or 28
    const v = vInt < 27 ? vInt + 27 : vInt

    return { r, s, v }
  }
  async verifyMessage(message: string | Uint8Array, signature: `0x${string}`): Promise<string> {
    const messageString = typeof message === 'string' ? message : new TextDecoder().decode(message)

    return recoverMessageAddress({
      message: messageString,
      signature,
    })
  }

  async verifyTypedData(
    domain: TypedDataDomainCommon,
    types: Record<string, Array<{ name: string; type: string }>>,
    value: Record<string, unknown>,
    signature: `0x${string}`,
  ) {
    const primaryType = Object.keys(types)[0]
    if (!primaryType) {
      throw new Error('No primary type found in types')
    }
    const domainTypedDataDomain = domain as TypedDataDomain
    return recoverTypedDataAddress({
      domain: domainTypedDataDomain,
      types,
      primaryType,
      message: value,
      signature,
    })
  }

  encodeFunction(
    abi: Array<{ name: string; inputs: Array<{ type: string }>; type: string }>,
    functionName: string,
    args: ContractValue[],
  ): string {
    const functionAbi = abi.find((item) => item.type === 'function' && item.name === functionName)
    if (!functionAbi) {
      throw new Error(`Function ${functionName} not found in ABI`)
    }

    // Use encodeFunctionData directly with the function ABI
    return encodeFunctionData({
      abi: [functionAbi],
      functionName,
      args,
    })
  }

  decodeFunctionData(
    abi: Array<{ name: string; inputs: Array<{ type: string }>; type: string }>,
    functionName: string,
    data: string,
  ): any {
    const functionAbi = abi.find((item) => item.type === 'function' && item.name === functionName)
    if (!functionAbi) {
      throw new Error(`Function ${functionName} not found in ABI`)
    }

    // Use decodeFunctionData directly with the function ABI
    const result = decodeFunctionData({
      abi: [functionAbi],
      data: data as `0x${string}`,
    })

    // Convert Viem result to match Ethers V5/V6 format
    // Viem returns { args: [...] }, we need to make it array-like with named properties
    const args = Array.from(result.args || [])

    // Add named properties based on the function ABI inputs
    if (functionAbi.inputs && functionAbi.inputs.length > 0) {
      functionAbi.inputs.forEach((input: any, index) => {
        if (input.name) {
          ;(args as any)[input.name] = args[index]
        }
      })
    }

    return args
  }

  toNumber(value: bigint): number {
    return Number(value)
  }

  solidityKeccak256(types: (string | { type: string; name: string })[], values: ContractValue[]): string {
    const encoded = encodePacked(types, values)

    // Hash the encoded data
    return keccak256(encoded)
  }

  createInterface(abi: string[] | any): ViemInterfaceWrapper {
    return new ViemInterfaceWrapper(abi)
  }

  hashDomain(domain: TypedDataDomainCommon): string {
    const domainTypedDataDomain = domain as TypedDataDomain
    // 1. Define the EIP712Domain type hash
    const EIP712_DOMAIN_TYPEHASH = keccak256(
      toHex('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
    )

    // 2. Hash individual domain fields
    const nameHash = domainTypedDataDomain.name
      ? keccak256(toHex(domainTypedDataDomain.name))
      : '0x0000000000000000000000000000000000000000000000000000000000000000'
    const versionHash = domainTypedDataDomain.version
      ? keccak256(toHex(domainTypedDataDomain.version))
      : '0x0000000000000000000000000000000000000000000000000000000000000000'

    // 3. Encode the domain struct according to EIP-712
    const encodedDomain = encodeAbiParameters(
      [
        { type: 'bytes32' }, // typeHash
        { type: 'bytes32' }, // nameHash
        { type: 'bytes32' }, // versionHash
        { type: 'uint256' }, // chainId
        { type: 'address' }, // verifyingContract
      ],
      [
        EIP712_DOMAIN_TYPEHASH,
        nameHash,
        versionHash,
        BigInt(domainTypedDataDomain.chainId || 0),
        (domainTypedDataDomain.verifyingContract as `0x${string}`) || '0x0000000000000000000000000000000000000000',
      ],
    )

    // 4. Hash the encoded domain
    return keccak256(encodedDomain)
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
    const vaultAbiStrings = [
      'function manageUserBalance((uint8, address, uint256, address, address)[])',
      'function batchSwap(uint8, (bytes32, uint256, uint256, uint256, bytes)[], address[], (address, bool, address, bool), int256[], uint256)',
    ]

    // Parse the ABI using viem
    const vaultAbi = parseAbi(vaultAbiStrings)

    // Get function names
    const functionNames = ['manageUserBalance', 'batchSwap']

    for (const functionName of functionNames) {
      // Find the function in the parsed ABI
      const functionAbi = vaultAbi.find((item) => item.type === 'function' && item.name === functionName) as AbiFunction

      if (!functionAbi) {
        throw new Error(`Function ${functionName} not found in ABI`)
      }

      // Get function selector using viem's toFunctionSelector
      const functionSelector = toFunctionSelector(functionAbi)

      // Compute role hash using solidityKeccak256 (which uses encodePacked + keccak256)
      const roleHash = this.solidityKeccak256(['uint256', 'bytes4'], [vaultAddress, functionSelector])

      // Call grantRole on the authorizer contract
      await contractCall(authorizerAddress, authorizerAbi, 'grantRole', [roleHash, vaultRelayerAddress])
    }
  }

  async readStorage(
    baseAddress: Address,
    baseAbi: Abi,
    readerAddress: Address,
    readerAbi: Abi,
    client: PublicClient,
    method: string,
    parameters: ContractValue[],
  ) {
    // Encode the function call
    const encodedCall = encodeFunctionData({
      abi: readerAbi,
      functionName: method,
      args: parameters,
    })

    // Check if simulateDelegatecall exists in base ABI
    const hasSimulateDelegatecall = baseAbi.some(
      (item: any) => item.type === 'function' && item.name === 'simulateDelegatecall',
    )

    if (!hasSimulateDelegatecall) {
      throw new Error('simulateDelegatecall method not found on base contract')
    }

    // Call simulateDelegatecall on the base contract
    const resultBytes = (await client.readContract({
      address: baseAddress,
      abi: baseAbi,
      functionName: 'simulateDelegatecall',
      args: [readerAddress, encodedCall],
    })) as Hex

    // Decode the result
    const decoded = decodeFunctionResult({
      abi: readerAbi,
      functionName: method,
      data: resultBytes,
    })

    return decoded
  }

  randomBytes(length: number): string {
    const randomBytes = crypto.getRandomValues(new Uint8Array(length))
    return this.bytesToHex(randomBytes)
  }

  isAddress(address: string): boolean {
    return isAddress(address)
  }

  isHexString(value: string): boolean {
    return isHex(value)
  }

  hexDataLength(data: string): number {
    if (!this.isHexString(data)) {
      throw new Error('Invalid hex string')
    }
    return (data.length - 2) / 2
  }

  parseUnits(value: string, decimals: number): bigint {
    return parseUnits(value, decimals)
  }

  getParamType(type: string): CommonParamType {
    return new ViemParamType(type) as unknown as CommonParamType
  }
  getParamTypeFromString(type: string): CommonParamType {
    return new ViemParamType(type) as unknown as CommonParamType
  }

  isInterface(value: any): boolean {
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
