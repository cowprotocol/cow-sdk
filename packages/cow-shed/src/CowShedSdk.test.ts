import { CowShedSdk } from './CowShedSdk'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { ICoWShedCall } from './types'
import { AdaptersTestSetup, createAdapters } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { ContractsSigningScheme as SigningScheme } from '@cowprotocol/sdk-contracts-ts'
const MOCK_CALL_DATA = '0xabcdef'

const DEFAULT_QUOTE_VALIDITY = 60 * 30 // 30 min

function getOrderDeadlineFromNow(validFor: number): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + validFor)
}

const CALLS_MOCK: ICoWShedCall[] = [
  {
    target: '0x0000000000000000000000000000000000000000',
    value: BigInt(0),
    callData: MOCK_CALL_DATA,
    allowFailure: false,
    isDelegateCall: false,
  },
]

describe('CowShedSdk', () => {
  let adapters: AdaptersTestSetup

  beforeAll(() => {
    adapters = createAdapters()
  })

  describe('signCalls()', () => {
    test('Should use specified signer', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const signedCalls: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const sdk = new CowShedSdk()

        const call = await sdk.signCalls({
          calls: CALLS_MOCK,
          signer: adapters[adapterName].signer,
          chainId: SupportedChainId.SEPOLIA,
          defaultGasLimit: 1000000n,
          deadline: getOrderDeadlineFromNow(DEFAULT_QUOTE_VALIDITY),
        })

        signedCalls.push(call)
      }

      expect(Array.isArray(signedCalls)).toBe(true)
      expect(signedCalls.length).toBe(3)

      signedCalls.forEach((call) => {
        expect(call.cowShedAccount).toBeDefined()
        expect(typeof call.cowShedAccount).toBe('string')
        expect(call.cowShedAccount).toMatch(/^0x[a-fA-F0-9]{40}$/)

        expect(call.signedMulticall).toBeDefined()
        expect(call.signedMulticall.to).toBeDefined()
        expect(call.signedMulticall.data).toBeDefined()
        expect(call.signedMulticall.value).toBeDefined()
        expect(call.signedMulticall.to).toMatch(/^0x[a-fA-F0-9]{40}$/)
        expect(call.signedMulticall.data).toMatch(/^0x[a-fA-F0-9]+$/)
        expect(typeof call.signedMulticall.value).toBe('bigint')

        expect(call.gasLimit).toBeDefined()
        expect(typeof call.gasLimit).toBe('bigint')
      })
    })

    // TODO: CoW Shed 1.0.1 is not deployed to Sepolia
    test.skip('When signer has provider, then should estimate gas', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const signedCalls: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const sdk = new CowShedSdk()

        const call = await sdk.signCalls({
          calls: CALLS_MOCK,
          signer: adapters[adapterName].signer,
          chainId: SupportedChainId.SEPOLIA,
          deadline: getOrderDeadlineFromNow(DEFAULT_QUOTE_VALIDITY),
        })

        signedCalls.push(call)
      }

      signedCalls.forEach((call) => {
        expect(call.gasLimit).toBeGreaterThan(1)
      })
    })

    test('Value of signedMulticall should be zero', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const signedCalls: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const sdk = new CowShedSdk()

        const call = await sdk.signCalls({
          calls: CALLS_MOCK,
          signer: adapters[adapterName].signer,
          chainId: SupportedChainId.MAINNET,
          defaultGasLimit: 1000000n,
          deadline: getOrderDeadlineFromNow(DEFAULT_QUOTE_VALIDITY),
        })

        signedCalls.push(call)
      }

      signedCalls.forEach((call) => {
        expect(call.signedMulticall.value).toBe(BigInt(0))
      })
    })

    test('executeHooks call should contain all specified parameters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const signedCalls: any[] = []

      const nonce = '0x1111343138353436303338323100000000000000000000000000000000000000'
      const deadline = BigInt(30000)
      const signingScheme = SigningScheme.ETHSIGN

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const sdk = new CowShedSdk()

        const call = await sdk.signCalls({
          calls: CALLS_MOCK,
          signer: adapters[adapterName].signer,
          chainId: SupportedChainId.MAINNET,
          defaultGasLimit: 1000000n,
          nonce,
          deadline,
          signingScheme,
        })

        signedCalls.push(call)
      }

      expect(signedCalls.length).toBe(adapterNames.length)
      signedCalls.forEach((call) => {
        expect(call.cowShedAccount).toBeDefined()
        expect(call.signedMulticall).toBeDefined()
      })
    })
  })
})
