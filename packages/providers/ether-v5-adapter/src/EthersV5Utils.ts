import { AdapterUtils, Address } from '@cowprotocol/sdk-common'
import { BigNumberish, BytesLike, ethers, TypedDataDomain, TypedDataField } from 'ethers'

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
    return ethers.utils.defaultAbiCoder.decode(types, data) as unknown[]
  }

  id(text: string): BytesLike {
    return ethers.utils.id(text)
  }

  toBigIntish(value: BytesLike | string | number): BigNumberish {
    return ethers.BigNumber.from(value)
  }

  newBigintish(value: number | string): BigNumberish {
    return ethers.BigNumber.from(value)
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
  ): BytesLike {
    const iface = new ethers.utils.Interface(abi)
    return iface.encodeFunctionData(functionName, args)
  }

  toNumber(value: BigNumberish): number {
    return ethers.BigNumber.from(value).toNumber()
  }

  solidityKeccak256(types: string[], values: unknown[]): unknown {
    return ethers.utils.solidityKeccak256(types, values)
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
}
