import { CowShedSdk } from './CowShedSdk'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { ICoWShedCall, ICoWShedOptions } from './types'
import { AdaptersTestSetup, createAdapters } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { ContractsSigningScheme as SigningScheme } from '@cowprotocol/sdk-contracts-ts'
import { COW_SHED_2_1_0_VERSION, COW_SHED_FACTORY, COW_SHED_LATEST_VERSION, COW_SHED_PROXY_INIT_CODE } from './const'
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

  describe('getCowShedAccount()', () => {
    test('forwards custom factory options to subclass hooks', () => {
      const factoryOptions: ICoWShedOptions = {
        factoryAddress: '0x1111111111111111111111111111111111111111',
        implementationAddress: '0x2222222222222222222222222222222222222222',
        proxyCreationCode: COW_SHED_PROXY_INIT_CODE['1.0.1'],
        domainVersion: '2.1.0',
      }
      let receivedOptions: ICoWShedOptions | undefined

      class CustomCowShedSdk extends CowShedSdk {
        protected override getCowShedHooks(chainId: SupportedChainId, customOptions?: ICoWShedOptions) {
          receivedOptions = customOptions
          return super.getCowShedHooks(chainId, customOptions)
        }
      }

      const sdk = new CustomCowShedSdk(adapters.viemAdapter, factoryOptions)
      sdk.getCowShedAccount(SupportedChainId.MAINNET, '0x3333333333333333333333333333333333333333')

      expect(receivedOptions).toBe(factoryOptions)
    })
  })

  describe('signCalls()', () => {
    test('uses CowShed 2.1.0 by default', async () => {
      const adapter = adapters.viemAdapter
      const signTypedData = jest.spyOn(adapter.signer, 'signTypedData')
      jest.spyOn(adapter, 'getCode').mockResolvedValue('0x')
      setGlobalAdapter(adapter)

      const sdk = new CowShedSdk(adapter)
      const call = await sdk.signCalls({
        calls: CALLS_MOCK,
        chainId: SupportedChainId.MAINNET,
        defaultGasLimit: 1000000n,
      })

      expect(COW_SHED_LATEST_VERSION).toBe(COW_SHED_2_1_0_VERSION)
      expect(sdk.version).toBe(COW_SHED_2_1_0_VERSION)
      expect(call.signedMulticall.to).toBe(COW_SHED_FACTORY[COW_SHED_2_1_0_VERSION])
      expect(call.cowShedAccount).toBe('0x7F8B59a3dE47512780bbE03999602194cE056e60')
      expect(signTypedData).toHaveBeenLastCalledWith(
        expect.objectContaining({ version: COW_SHED_2_1_0_VERSION, verifyingContract: call.cowShedAccount }),
        expect.any(Object),
        expect.any(Object),
      )
    })

    test('uses a custom deployment and signing-domain version without subclassing', async () => {
      const adapter = adapters.viemAdapter
      const factoryAddress = '0x1111111111111111111111111111111111111111'
      const implementationAddress = '0x2222222222222222222222222222222222222222'
      const signTypedData = jest.spyOn(adapter.signer, 'signTypedData')
      jest.spyOn(adapter, 'getCode').mockResolvedValue('0x')
      setGlobalAdapter(adapter)

      const sdk = new CowShedSdk(adapter, {
        factoryAddress,
        implementationAddress,
        proxyCreationCode: COW_SHED_PROXY_INIT_CODE['1.0.1'],
        domainVersion: '2.1.0',
      })
      const call = await sdk.signCalls({
        calls: CALLS_MOCK,
        chainId: SupportedChainId.MAINNET,
        defaultGasLimit: 1000000n,
      })

      expect(call.signedMulticall.to).toBe(factoryAddress)
      expect(sdk.getCowShedAccount(SupportedChainId.MAINNET, await adapter.signer.getAddress())).toBe(
        call.cowShedAccount,
      )
      expect(signTypedData).toHaveBeenCalledWith(
        expect.objectContaining({ version: '2.1.0', verifyingContract: call.cowShedAccount }),
        expect.any(Object),
        expect.any(Object),
      )
    })

    test.each([
      ['1.0.0', '0x1fA9EaD712674DA223F584dB207756B538cE96F9'],
      ['1.0.1', '0x3860831Bf9FBAc3fd0bD021Eb8ba0dF2fC150713'],
    ] as const)('forwards explicit SDK version %s to the CowShed hooks', async (version, expectedAccount) => {
      const adapter = adapters.viemAdapter
      const signTypedData = jest.spyOn(adapter.signer, 'signTypedData')
      jest.spyOn(adapter, 'getCode').mockResolvedValue('0x')
      setGlobalAdapter(adapter)

      const sdk = new CowShedSdk(adapter, undefined, version)
      const call = await sdk.signCalls({
        calls: CALLS_MOCK,
        chainId: SupportedChainId.MAINNET,
        defaultGasLimit: 1000000n,
      })

      expect(call.signedMulticall.to).toBe(COW_SHED_FACTORY[version])
      expect(call.cowShedAccount).toBe(expectedAccount)
      expect(signTypedData).toHaveBeenLastCalledWith(
        expect.objectContaining({ version, verifyingContract: call.cowShedAccount }),
        expect.any(Object),
        expect.any(Object),
      )
    })

    test('Should use specified signer', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const signedCalls: any[] = []

      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]
        jest.spyOn(adapter, 'getCode').mockResolvedValue('0x')
        setGlobalAdapter(adapter)
        const sdk = new CowShedSdk()

        const call = await sdk.signCalls({
          calls: CALLS_MOCK,
          signer: adapter.signer,
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
