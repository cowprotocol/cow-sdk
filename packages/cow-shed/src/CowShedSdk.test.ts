import { CowShedSdk } from './CowShedSdk'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { ICoWShedCall } from './types'
import { createAdapters, TEST_PRIVATE_KEY, TEST_RPC_URL } from '../tests/setup'
import { ethers as ethersV5 } from 'ethers-v5'
import * as ethersV6 from 'ethers-v6'
import { privateKeyToAccount } from 'viem/accounts'
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { ContractsSigningScheme as SigningScheme } from '@cowprotocol/sdk-contracts-ts'
const MOCK_CALL_DATA = '0xabcdef'

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
  let adapters: ReturnType<typeof createAdapters>
  let wallets: {
    ethersV5Adapter: ethersV5.Wallet
    ethersV6Adapter: ethersV6.Wallet
    viemAdapter: ReturnType<typeof createWalletClient>
  }

  beforeAll(() => {
    adapters = createAdapters()

    // Setup wallets for each adapter
    const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
    const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
    const viemAccount = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`)

    wallets = {
      ethersV5Adapter: new ethersV5.Wallet(TEST_PRIVATE_KEY, ethersV5Provider),
      ethersV6Adapter: new ethersV6.Wallet(TEST_PRIVATE_KEY, ethersV6Provider),
      viemAdapter: createWalletClient({
        chain: sepolia,
        transport: http(),
        account: viemAccount,
      }),
    }
  })

  describe('signCalls()', () => {
    test('Should use specified signer', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const signedCalls: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const sdk = new CowShedSdk(adapters[adapterName])

        const call = await sdk.signCalls({
          calls: CALLS_MOCK,
          signer: wallets[adapterName],
          chainId: SupportedChainId.SEPOLIA,
          defaultGasLimit: 1000000n,
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

    test('When signer has provider, then should estimate gas', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const signedCalls: any[] = []

      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const sdk = new CowShedSdk(adapters[adapterName])

        const call = await sdk.signCalls({
          calls: CALLS_MOCK,
          signer: wallets[adapterName],
          chainId: SupportedChainId.SEPOLIA,
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
        const sdk = new CowShedSdk(adapters[adapterName])

        const call = await sdk.signCalls({
          calls: CALLS_MOCK,
          signer: wallets[adapterName],
          chainId: SupportedChainId.MAINNET,
          defaultGasLimit: 1000000n,
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
        const sdk = new CowShedSdk(adapters[adapterName])

        const call = await sdk.signCalls({
          calls: CALLS_MOCK,
          signer: wallets[adapterName],
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
