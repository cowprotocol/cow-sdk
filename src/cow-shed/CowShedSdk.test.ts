import { Wallet } from '@ethersproject/wallet'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcProvider } from '@ethersproject/providers'

import { SigningScheme } from '@cowprotocol/contracts'
import { CowShedSdk } from './CowShedSdk'
import { SupportedChainId } from '../chains/types'
import { ICoWShedCall } from './types'

import { getCoWShedFactoryInterface } from './contracts/utils'
import { getOrderDeadlineFromNow } from '../common/utils/order'
import { BRIDGE_HOOK_VALIDITY } from '../bridging'

const MOCK_CALL_DATA = '0xabcdef'

const CALLS_MOCK: ICoWShedCall[] = [
  {
    target: AddressZero,
    value: BigInt(0),
    callData: MOCK_CALL_DATA,
    allowFailure: false,
    isDelegateCall: false,
  },
]

const ACCOUNT = '0xCFe4DA2084Db71E83b7833Fb267A6caE459e31dD'
const PRIVATE_KEY = '0xb62774c4d8dbcbe3641e7d78c80fe04899914d531d010f455788b94885f56446'
const SEPOLIA_SIGNER = new Wallet(PRIVATE_KEY, new JsonRpcProvider('https://sepolia.gateway.tenderly.co'))

describe('CowShedSdk', () => {
  it('Should calculate proxy address for a given account', () => {
    const sdk = new CowShedSdk()
    const account = sdk.getCowShedAccount(SupportedChainId.GNOSIS_CHAIN, '0xd5c15ccc0986e813d1fbc56907af557f69d8fa3e')

    expect(account).toBe('0x0e7a5e1977F9b64c67722831Ee3Fc73c11bf4bB3')
  })

  describe('signCalls()', () => {
    it('Should use specified signer', async () => {
      const sdk = new CowShedSdk()

      const result = await sdk.signCalls({
        calls: CALLS_MOCK,
        signer: PRIVATE_KEY,
        chainId: SupportedChainId.MAINNET,
        defaultGasLimit: 1000000n,
        deadline: getOrderDeadlineFromNow(BRIDGE_HOOK_VALIDITY),
      })

      expect(result.cowShedAccount).toBe('0xf35a93a2c62E2F1c7712a9ADFC607a5fD175a584')
    })

    it('When signer has provider, then should estimate gas', async () => {
      const sdk = new CowShedSdk()

      const result = await sdk.signCalls({
        calls: CALLS_MOCK,
        signer: SEPOLIA_SIGNER, // Signer with a provider
        chainId: SupportedChainId.SEPOLIA,
        deadline: getOrderDeadlineFromNow(BRIDGE_HOOK_VALIDITY),
        // defaultGasLimit is not specified
      })

      expect(+result.gasLimit.toString()).toBeGreaterThan(1)
    })

    it('When tx estimation failed, then should use default gas value', async () => {
      const sdk = new CowShedSdk()

      const result = await sdk.signCalls({
        calls: CALLS_MOCK,
        signer: PRIVATE_KEY, // Signer with no provider
        chainId: SupportedChainId.SEPOLIA,
        defaultGasLimit: 1000000n,
        deadline: getOrderDeadlineFromNow(BRIDGE_HOOK_VALIDITY),
      })

      expect(result.gasLimit.toString()).toBe('1000000')
    })

    it('When defaultGasLimit is not specified, then should throw an error', async () => {
      const sdk = new CowShedSdk()

      const result = sdk.signCalls({
        calls: CALLS_MOCK,
        signer: PRIVATE_KEY, // Signer with no provider
        chainId: SupportedChainId.SEPOLIA,
        deadline: getOrderDeadlineFromNow(BRIDGE_HOOK_VALIDITY),
      })

      await expect(result).rejects.toThrow()
    })

    it('Value of signedMulticall should be zero', async () => {
      const sdk = new CowShedSdk()

      const result = await sdk.signCalls({
        calls: CALLS_MOCK,
        signer: PRIVATE_KEY,
        chainId: SupportedChainId.MAINNET,
        defaultGasLimit: 1000000n,
        deadline: getOrderDeadlineFromNow(BRIDGE_HOOK_VALIDITY),
      })

      expect(result.signedMulticall.value).toBe(BigInt(0))
    })

    it('executeHooks call should contain all specified parameters', async () => {
      const sdk = new CowShedSdk()
      const nonce = '0x1111343138353436303338323100000000000000000000000000000000000000'
      const deadline = BigInt(30000)
      const signingScheme = SigningScheme.ETHSIGN

      const result = await sdk.signCalls({
        calls: CALLS_MOCK,
        signer: PRIVATE_KEY,
        chainId: SupportedChainId.MAINNET,
        defaultGasLimit: 1000000n,
        nonce,
        deadline,
        signingScheme,
      })

      const decoded = getCoWShedFactoryInterface().decodeFunctionData('executeHooks', result.signedMulticall.data)

      expect(decoded[0][0][2]).toBe(MOCK_CALL_DATA)
      expect(decoded[1]).toBe(nonce)
      expect(decoded[2].toString()).toBe(deadline.toString())
      expect(decoded[3]).toBe(ACCOUNT)
    })
  })
})
