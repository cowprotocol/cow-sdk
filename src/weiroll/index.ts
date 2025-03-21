import { Planner as WeirollPlanner } from '@weiroll/weiroll.js'
import { Interface } from '@ethersproject/abi'
import { EvmCall } from '../common'
export { Contract as WeirollContract, Planner as WeirollPlanner } from '@weiroll/weiroll.js'
export { CommandFlags as WeirollCommandFlags } from '@weiroll/weiroll.js/dist/planner'

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
