import { Planner as WeirollPlanner, Contract as WeirollContract } from '@weiroll/weiroll.js'
import { Interface } from '@ethersproject/abi'
import { EvmCall } from '../common'
export { Contract as WeirollContract, Planner as WeirollPlanner } from '@weiroll/weiroll.js'
import { Contract as EthersContract } from '@ethersproject/contracts'

export enum WeirollCommandFlags {
  DELEGATECALL = 0,
  CALL = 1,
  STATICCALL = 2,
  CALL_WITH_VALUE = 3,
  CALLTYPE_MASK = 3,
  EXTENDED_COMMAND = 64,
  TUPLE_RETURN = 128,
}

const WEIROLL_ADDRESS = '0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963'

const WEIROLL_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'command_index', type: 'uint256' },
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'string', name: 'message', type: 'string' },
    ],
    name: 'ExecutionFailed',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'bytes32[]', name: 'commands', type: 'bytes32[]' },
      { internalType: 'bytes[]', name: 'state', type: 'bytes[]' },
    ],
    name: 'execute',
    outputs: [{ internalType: 'bytes[]', name: '', type: 'bytes[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
]

function getWeirollCalldata(planner: WeirollPlanner) {
  const planResult = planner.plan()
  const { commands, state } = planResult

  const weirollInterface = new Interface(WEIROLL_ABI)

  return weirollInterface.encodeFunctionData('execute', [commands, state])
}

/**
 * Create a weiroll transaction
 *
 * @param addToPlanner - A function that adds the commands to the planner
 *
 * @returns An EVM call
 */
export function createWeirollDelegateCall(addToPlanner: (planner: WeirollPlanner) => void): EvmCall {
  // Create a new planner
  const planner = new WeirollPlanner()

  // Add the commands to the planner
  addToPlanner(planner)

  // Get the EVM call
  return {
    to: WEIROLL_ADDRESS,
    value: BigInt(0),
    data: getWeirollCalldata(planner),
  }
}

export function createWeirollContract(contract: EthersContract, commandflags?: WeirollCommandFlags): WeirollContract {
  return WeirollContract.createContract(
    contract,
    commandflags as unknown as Parameters<typeof WeirollContract.createContract>[1]
  )
}

export function createWeirollLibrary(contract: EthersContract): WeirollContract {
  return WeirollContract.createLibrary(contract)
}
