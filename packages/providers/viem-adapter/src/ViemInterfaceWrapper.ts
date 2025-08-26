import { CowError, GenericContractInterface, Log } from '@cowprotocol/sdk-common'
import {
  Abi,
  parseAbi,
  toFunctionSelector,
  encodeFunctionData,
  AbiFunction,
  decodeAbiParameters,
  parseEventLogs,
  Log as ViemLog,
  toEventSelector,
  AbiEvent,
} from 'viem'

function normalizeParam(param: any): any {
  return {
    name: param.name ?? '',
    type: param.type ?? '',
    internalType: param.internalType ?? null,
    indexed: param.indexed ?? null,
    components: param.components ?? null,
    arrayLength: param.arrayLength ?? null,
    arrayChildren: param.arrayChildren ?? null,
    baseType: param.baseType ?? null,
    _isParamType: param._isParamType ?? true,
  }
}

function normalizeFragment(fragment: any): any {
  return {
    type: fragment.type ?? 'function',
    name: fragment.name ?? '',
    constant:
      fragment.constant !== undefined
        ? fragment.constant
        : fragment.stateMutability === 'view' || fragment.stateMutability === 'pure',
    inputs: (fragment.inputs || []).map(normalizeParam),
    outputs: (fragment.outputs || []).map(normalizeParam),
    payable: fragment.payable !== undefined ? fragment.payable : fragment.stateMutability === 'payable',
    stateMutability: fragment.stateMutability ?? 'nonpayable',
    gas: fragment.gas ?? null,
    _isFragment: fragment._isFragment ?? true,
  }
}

/**
 * Interface wrapper that makes viem interfaces behave exactly like ethers v5 interfaces
 * for weiroll compatibility. This ensures that all adapters produce identical fragment formats.
 */
export class ViemInterfaceWrapper implements GenericContractInterface {
  private parsedAbi: Abi
  private _functions: Record<string, any>
  private _fragments: any[]

  constructor(abi: string[] | any[]) {
    this.parsedAbi = Array.isArray(abi) && typeof abi[0] === 'string' ? parseAbi(abi as string[]) : (abi as any[])
    this._functions = {}
    this._fragments = []

    // Always iterate over parsedAbi for function fragments
    this.parsedAbi.forEach((item) => {
      if (item.type === 'function') {
        const functionItem = item as AbiFunction
        const inputs = functionItem.inputs?.map((input: any) => input.type).join(',') || ''
        const signature = `${functionItem.name}(${inputs})`
        const normalized = normalizeFragment(functionItem)
        this._functions[signature] = normalized
        this._fragments.push(normalized)
      }
    })
  }

  private _getFunctionNormalized(name: string): any {
    const fragment = this.parsedAbi.find(
      (item) => item.type === 'function' && (item as any).name === name,
    ) as AbiFunction
    if (fragment) {
      return normalizeFragment(fragment)
    }
    throw new CowError(`Function ${name} not found`)
  }

  getFunction(name: string): any {
    return this._getFunctionNormalized(name)
  }

  /**
   * Get function selector (sighash) using viem's toFunctionSelector
   */
  getSighash(nameOrSignature: string): string {
    let fragment = this.parsedAbi.find(
      (item) => item.type === 'function' && (item as any).name === nameOrSignature,
    ) as AbiFunction
    if (!fragment) {
      const functionFragment = this._functions[nameOrSignature]
      if (functionFragment) {
        fragment = this.parsedAbi.find(
          (item) => item.type === 'function' && (item as any).name === functionFragment.name,
        ) as AbiFunction
      }
    }
    if (!fragment) {
      throw new CowError(`Function ${nameOrSignature} not found`)
    }
    return toFunctionSelector(fragment)
  }

  /**
   * Encode function data using viem
   */
  encodeFunctionData(name: string, args: (string | number | boolean | bigint)[]): string {
    const fragment = this.parsedAbi.find(
      (item) => item.type === 'function' && (item as any).name === name,
    ) as AbiFunction
    if (!fragment) {
      throw new CowError(`Function ${name} not found`)
    }
    return encodeFunctionData({
      abi: this.parsedAbi,
      functionName: name,
      args,
    })
  }

  // TODO: need to be tested
  parseLog(event: Log): { args: unknown } | null {
    const parsedLogs = parseEventLogs({ abi: this.parsedAbi, logs: [event] as ViemLog[] })

    return parsedLogs[0] ?? null
  }

  // TODO: need to be tested
  getEventTopic(name: string): string | null {
    const event = this.parsedAbi.find((i) => i.type === 'event' && i.name === name)

    if (!event) return null

    return toEventSelector(event as AbiEvent)
  }

  /**
   * Get all fragments
   */
  get fragments() {
    return this._fragments
  }

  /**
   * Get functions object (ethers v5 compatibility)
   */
  get functions(): Record<string, any> {
    return this._functions
  }

  /**
   * Get ABI
   */
  get abi() {
    return this._fragments
  }

  decodeFunctionData(functionName: string, data: string): (string | number | boolean | bigint)[] {
    const functionAbi = this.abi.find((item: any) => item.type === 'function' && item.name === functionName)
    if (!functionAbi) throw new CowError(`Function ${functionName} not found in ABI`)
    const inputTypes = functionAbi.inputs.map((input: any) => ({ type: input.type, name: input.name }))
    const decoded = decodeAbiParameters(inputTypes, data as `0x${string}`)

    // Convert to array with named properties for consistency
    const result = Array.from(decoded)
    functionAbi.inputs.forEach((input: any, index: number) => {
      if (input.name && result[index] !== undefined) {
        ;(result as any)[input.name] = result[index]
      }
    })

    return result
  }
}
