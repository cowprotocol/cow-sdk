import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { AdaptersTestSetup, createAdapters } from '../tests/setup'
import {
  createWeirollContract,
  createWeirollDelegateCall,
  WeirollCommandFlags,
  WeirollContract,
  WeirollPlanner,
} from './index'
import { EvmCall } from '@cowprotocol/sdk-config'

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
] as const
export type DaiContractsType = {
  ethersV5Adapter: WeirollContract | null
  ethersV6Adapter: WeirollContract | null
  viemAdapter: WeirollContract | null
}

describe('createWeirollTx', () => {
  let adapters: AdaptersTestSetup
  const daiContracts: DaiContractsType = {
    ethersV5Adapter: null,
    ethersV6Adapter: null,
    viemAdapter: null,
  }

  beforeAll(() => {
    adapters = createAdapters()
    for (const adapterName of Object.keys(adapters) as Array<keyof typeof adapters>) {
      const contract = adapters[adapterName].getContract('0x6b175474e89094c44da98b954eedeac495271d0f', ERC20_ABI)
      const daiContract = createWeirollContract(contract, WeirollCommandFlags.CALL)
      daiContracts[adapterName] = daiContract
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle an empty plan', () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    for (const adapterName of adapterNames) {
      // GIVEN: a function that doesn't add anything to the planner
      const addToPlanner = jest.fn()

      console.log(`Testing adapter: ${adapterName}`)
      setGlobalAdapter(adapters[adapterName])
      const tx = createWeirollDelegateCall(addToPlanner)

      console.log(`Mock calls for ${adapterName}:`, addToPlanner.mock.calls.length)
      // THEN: the planner was called once
      expect(addToPlanner).toHaveBeenCalledTimes(1)

      // THEN: the transaction should be encoded correctly
      assertDelegateCall(tx, {
        to: '0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963',
        data: '0xde792d5f0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        value: 0n,
      })
    }
  })

  it('should encode the transaction correctly', () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

    // GIVEN: A sender that holds DAI
    const sender = '0xf6e72Db5454dd049d0788e411b06CfAF16853042'
    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])

      // GIVEN: A function that adds to weiroll planner getting the balance and transferring it to vitalik
      const addToPlanner = (planner: WeirollPlanner) => {
        const daiBalance = planner.add(daiContracts[adapterName]?.balanceOf(sender))

        // Add to plan: Transfer all balance to Vitalik
        planner.add(daiContracts[adapterName]?.transfer('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', daiBalance))
      }

      // WHEN: we create the weiroll transaction
      const tx = createWeirollDelegateCall(addToPlanner)

      // THEN: The delegate call should have the expected data
      assertDelegateCall(tx, {
        to: '0x9585c3062Df1C247d5E373Cfca9167F7dC2b5963',
        data: '0xde792d5f000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000270a082310100ffffffffff006b175474e89094c44da98b954eedeac495271d0fa9059cbb010100ffffffffff6b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f6e72db5454dd049d0788e411b06cfaf168530420000000000000000000000000000000000000000000000000000000000000020000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
        value: 0n,
      })
    }
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
