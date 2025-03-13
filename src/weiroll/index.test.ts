import { CommandFlags, createWeirollDelegateCall } from './index'
import { Planner, Contract as WeirollContract } from '@weiroll/weiroll.js'
import { ethers } from 'ethers'
import { EvmCall } from '../common'

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
] as const

// Create DAI contract
const contract = new ethers.Contract('0x6b175474e89094c44da98b954eedeac495271d0f', ERC20_ABI)
const daiContract = WeirollContract.createContract(contract, CommandFlags.CALL)

describe('createWeirollTx', () => {
  it('should handle an empty plan', () => {
    // GIVEN: a function that doesn't add anything to the planner
    const addToPlanner = jest.fn()

    const tx = createWeirollDelegateCall(addToPlanner)

    // THEN: the planner was called oince
    expect(addToPlanner).toHaveBeenCalledTimes(1)

    // THEN: the transaction should be encoded correctly
    assertDelegateCall(tx, {
      to: '0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963',
      data: '0xde792d5f0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      value: 0n,
    })
  })

  it('should encode the transaction correctly', () => {
    // GIVEN: A sender that holds DAI
    const sender = '0xf6e72Db5454dd049d0788e411b06CfAF16853042'

    // GIVEN: A function that adds to weiroll planner getting the balance and transferring it to vitalik
    const addToPlanner = (planner: Planner) => {
      const daiBalance = planner.add(daiContract.balanceOf(sender))

      // Add to plan: Transfer all balance to Vitalik
      planner.add(daiContract.transfer('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', daiBalance))
    }

    // WHEN: we create the weiroll transaction
    const tx = createWeirollDelegateCall(addToPlanner)

    // THEN: The delegate call should have the expected data
    assertDelegateCall(tx, {
      to: '0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963',
      data: '0xde792d5f000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000270a082310100ffffffffff006b175474e89094c44da98b954eedeac495271d0fa9059cbb010100ffffffffff6b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f6e72db5454dd049d0788e411b06cfaf168530420000000000000000000000000000000000000000000000000000000000000020000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
      value: 0n,
    })
  })
})

function assertDelegateCall(tx: EvmCall, expected: EvmCall) {
  expect(toPrintable(tx)).toEqual(toPrintable(expected))
}

function toPrintable(tx: EvmCall) {
  return {
    ...tx,
    value: tx.value.toString(),
  }
}
