import { CowError, GenericContractInterface, Log } from '@cowprotocol/sdk-common'
import { Interface, InterfaceAbi } from 'ethers'

/**
 * Interface wrapper that makes ethers v6 interfaces behave exactly like ethers v5 interfaces
 * for weiroll compatibility. This ensures that all adapters produce identical fragment formats.
 */

function normalizeParam(param: any): any {
  // ethers v5 param fields: name, type, internalType, indexed, components, arrayLength, arrayChildren, baseType, _isParamType
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
  // ethers v5 fragment fields: type, name, constant, inputs, outputs, payable, stateMutability, gas, _isFragment
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

export class EthersV6InterfaceWrapper implements GenericContractInterface {
  private ethersInterface: Interface
  private _functions: Record<string, any>
  private _fragments: Record<string, unknown>[]

  constructor(abi: InterfaceAbi) {
    this.ethersInterface = new Interface(abi)
    this._functions = {}
    this._fragments = []

    // Get all function fragments robustly
    let functionFragments: any[] = []
    if (Array.isArray(this.ethersInterface.fragments)) {
      functionFragments = this.ethersInterface.fragments.filter((f) => f.type === 'function')
    } else if (this.ethersInterface.fragments && typeof this.ethersInterface.fragments === 'object') {
      functionFragments = Object.values(this.ethersInterface.fragments).filter((f) => f.type === 'function')
    } else if ((this.ethersInterface as any).functions && typeof (this.ethersInterface as any).functions === 'object') {
      functionFragments = Object.values((this.ethersInterface as any).functions)
    }

    functionFragments.forEach((fragment) => {
      const functionFragment = fragment as any
      const inputs = functionFragment.inputs?.map((input: any) => input.type).join(',') || ''
      const signature = `${functionFragment.name}(${inputs})`
      const normalized = normalizeFragment(functionFragment)
      this._functions[signature] = normalized
      this._fragments.push(normalized)
    })
  }

  private _getFunctionNormalized(name: string): any {
    try {
      const fragment = this.ethersInterface.getFunction(name)
      if (fragment) {
        return normalizeFragment(fragment)
      }
      throw new CowError(`Function ${name} not found`)
    } catch {
      const functionSignatures = Object.keys(this._functions)
      for (const signature of functionSignatures) {
        const fragment = this._functions[signature]
        if (fragment.name === name) {
          return fragment
        }
      }
      throw new CowError(`Function ${name} not found`)
    }
  }

  /**
   * Get a function by name, returning a clean fragment format
   */
  getFunction(name: string): any {
    return this._getFunctionNormalized(name)
  }

  /**
   * Get function selector (sighash) - ethers v6 uses .selector
   */
  getSighash(fragmentName: string): string {
    try {
      const fragment = this.ethersInterface.getFunction(fragmentName)
      if (fragment) {
        return fragment.selector
      }
    } catch {
      // Try to find by name in our normalized functions
      const functionSignatures = Object.keys(this._functions)
      for (const signature of functionSignatures) {
        const fragment = this._functions[signature]
        if (fragment.name === fragmentName) {
          // For ethers v6, we need to get the selector from the original interface
          try {
            const originalFragment = this.ethersInterface.getFunction(fragment.name)
            if (originalFragment) {
              return originalFragment.selector
            }
          } catch {
            // If we can't get it from the interface, try to construct it
            const inputs = fragment.inputs?.map((input: any) => input.type).join(',') || ''
            const signature = `${fragment.name}(${inputs})`
            const sigFragment = this.ethersInterface.getFunction(signature)
            if (sigFragment) {
              return sigFragment.selector
            }
          }
        }
      }
    }
    throw new CowError(`Function ${fragmentName} not found`)
  }

  /**
   * Encode function data
   */
  encodeFunctionData(name: string, args: (string | number | boolean | bigint)[]): string {
    return this.ethersInterface.encodeFunctionData(name, args)
  }

  /**
   * Decode function data
   * Fixed to return data in the same format as ethers v5 for compatibility
   */
  decodeFunctionData(functionName: string, data: string): (string | number | boolean | bigint)[] {
    try {
      const functionAbi = this.ethersInterface.getFunction(functionName)
      if (!functionAbi) {
        throw new CowError(`Function ${functionName} not found`)
      }

      // Use the ethers v6 decodeFunctionData method
      const decoded = this.ethersInterface.decodeFunctionData(functionName, data)

      // Ethers v6 returns a Result object, but we need a plain array for compatibility
      // Convert the Result object to a plain array
      if (decoded && typeof decoded === 'object') {
        // Result objects in ethers v6 are array-like but have additional properties
        // Convert to plain array while preserving the structure
        const result: (string | number | boolean | bigint)[] = []

        // Copy indexed values
        for (let i = 0; i < decoded.length; i++) {
          result[i] = decoded[i]
        }

        // Also copy named properties to maintain compatibility
        Object.keys(decoded).forEach((key) => {
          if (isNaN(Number(key))) {
            // Skip numeric indices
            ;(result as any)[key] = decoded[key]
          }
        })

        return result
      }

      // Fallback to array conversion
      return Array.from(decoded || [])
    } catch (error: any) {
      throw new CowError(`EthersV6Wrapper error: Failed to decode ${functionName}: ${error.message}`)
    }
  }

  parseLog(event: Log): { args: Record<string, unknown> } | null {
    return this.ethersInterface.parseLog(event)
  }

  getEventTopic(name: string): string | null {
    const event = this.ethersInterface.getEvent(name)

    return event?.topicHash ?? null
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
}
