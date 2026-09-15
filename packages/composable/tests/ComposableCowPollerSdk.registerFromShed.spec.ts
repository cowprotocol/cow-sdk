import { setGlobalAdapter, type AbstractProviderAdapter } from '@cowprotocol/sdk-common'
import { COW_SHED_2_1_0_VERSION, CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { decodeFunctionData, parseAbi } from 'viem'

import { ComposableCowPollerSdk, type ComposableCowPollerSchedule } from '../src'
import { createAdapters, TEST_ADDRESS, TEST_PRIVATE_KEY } from './setup'

const POLLER = '0x4444444444444444444444444444444444444444'
const FACTORY = '0x5E284e80F3bd6A7D80A8500D9c49878028110848'
const NONCE = `0x${'12'.repeat(32)}`
const DEADLINE = 2_000_000_000n
const GAS_LIMIT = 400_000n
const FACTORY_ABI = parseAbi([
  'function executeHooks((address target,uint256 value,bytes callData,bool allowFailure,bool isDelegateCall)[] calls,bytes32 nonce,uint256 deadline,address user,bytes signature)',
])

describe('ComposableCowPollerSdk registration from CowShed', () => {
  const adapters = createAdapters()

  afterEach(() => jest.restoreAllMocks())

  function setup(adapter: AbstractProviderAdapter = adapters.viemAdapter) {
    setGlobalAdapter(adapter)
    jest.spyOn(adapter, 'getCode').mockResolvedValue('0x')
    const cowShedSdk = new CowShedSdk(
      undefined,
      {
        factoryAddress: FACTORY,
        implementationAddress: '0xF0D400089d5b9fACA64E3422AD6614546587cfFB',
      },
      COW_SHED_2_1_0_VERSION,
    )
    const sdk = new ComposableCowPollerSdk({ chainId: 1, pollerAddress: POLLER })
    const schedule: ComposableCowPollerSchedule = {
      handler: '0x1111111111111111111111111111111111111111',
      authEpoch: 7n,
      funder: TEST_ADDRESS,
      owner: cowShedSdk.getCowShedAccount(1, TEST_ADDRESS),
      salt: `0x${'00'.repeat(31)}01`,
      staticInput: '0x1234',
    }
    return { sdk, schedule, cowShedSdk, nonce: NONCE, deadline: DEADLINE, gasLimit: GAS_LIMIT }
  }

  test('signs a CowShed factory bundle without submitting across adapters', async () => {
    const results = []
    for (const adapter of Object.values(adapters)) {
      const params = setup(adapter)
      const sign = jest.spyOn(adapter.signer, 'signTypedData')
      const send = jest.spyOn(adapter.signer, 'sendTransaction')
      const bundle = await params.sdk.signRegisterFromShed(params)
      const decoded = decodeFunctionData({ abi: FACTORY_ABI, data: bundle.signedMulticall.data as `0x${string}` })

      expect(bundle.cowShedAccount).toBe(params.schedule.owner)
      expect(bundle.signedMulticall.to).toBe(FACTORY)
      expect(bundle.signedMulticall.value).toBe(0n)
      expect(bundle.gasLimit).toBe(GAS_LIMIT)
      expect(decoded.functionName).toBe('executeHooks')
      expect(decoded.args).toEqual([
        [
          {
            target: POLLER,
            value: 0n,
            callData: params.sdk.poller.encodeRegisterFromShed(params.schedule),
            allowFailure: false,
            isDelegateCall: false,
          },
        ],
        NONCE,
        DEADLINE,
        TEST_ADDRESS,
        expect.stringMatching(/^0x[0-9a-f]+$/i),
      ])
      expect(sign).toHaveBeenCalledWith(
        expect.objectContaining({ chainId: 1, verifyingContract: params.schedule.owner, version: '2.1.0' }),
        expect.any(Object),
        expect.objectContaining({ nonce: NONCE, deadline: DEADLINE.toString() }),
      )
      expect(send).not.toHaveBeenCalled()
      results.push(bundle)
    }
    expect(results[1]).toEqual(results[0])
    expect(results[2]).toEqual(results[0])
  })

  test('submits the signed factory bundle with its gas limit', async () => {
    const params = setup()
    const transaction = { hash: '0xtransaction', wait: jest.fn() }
    const send = jest.spyOn(adapters.viemAdapter.signer, 'sendTransaction').mockResolvedValue(transaction as never)
    await expect(params.sdk.registerFromShed(params)).resolves.toBe(transaction)
    expect(send).toHaveBeenCalledTimes(1)
    const request = send.mock.calls[0]?.[0]
    expect(request).toEqual({ to: FACTORY, data: expect.any(String), value: 0n, gasLimit: GAS_LIMIT })
    const { args } = decodeFunctionData({ abi: FACTORY_ABI, data: request?.data as `0x${string}` })
    expect(args[0][0]?.callData).toBe(params.sdk.poller.encodeRegisterFromShed(params.schedule))
  })

  test('uses the configured signer and a per-call override for signing and submission', async () => {
    const params = setup()
    const sdk = new ComposableCowPollerSdk({ chainId: 1, pollerAddress: POLLER, signer: TEST_PRIVATE_KEY })
    const configured = adapters.viemAdapter.createSigner(TEST_PRIVATE_KEY)
    const override = adapters.viemAdapter.createSigner(`0x${'ab'.repeat(32)}`)
    const configuredSign = jest.spyOn(configured, 'signTypedData')
    const overrideSign = jest.spyOn(override, 'signTypedData')
    const configuredSend = jest.spyOn(configured, 'sendTransaction').mockResolvedValue({} as never)
    const overrideSend = jest.spyOn(override, 'sendTransaction').mockResolvedValue({} as never)
    const originalCreate = adapters.viemAdapter.createSigner.bind(adapters.viemAdapter)
    jest
      .spyOn(adapters.viemAdapter, 'createSigner')
      .mockImplementation((value) => (value === TEST_PRIVATE_KEY ? configured : originalCreate(value)))

    await sdk.registerFromShed(params)
    const overrideAddress = await override.getAddress()
    await sdk.registerFromShed({
      ...params,
      signer: override,
      schedule: {
        ...params.schedule,
        funder: overrideAddress,
        owner: params.cowShedSdk.getCowShedAccount(1, overrideAddress),
      },
    })

    expect(configuredSign).toHaveBeenCalledTimes(1)
    expect(overrideSign).toHaveBeenCalledTimes(1)
    expect(configuredSend).toHaveBeenCalledTimes(1)
    expect(overrideSend).toHaveBeenCalledTimes(1)
  })

  test('encodes the supplied epoch and schedule before awaiting a wallet', async () => {
    const params = setup()
    const schedule = { ...params.schedule }
    const original = { ...schedule }
    const pending = params.sdk.signRegisterFromShed({ ...params, schedule })
    schedule.authEpoch = 8n
    schedule.staticInput = '0xdeadbeef'
    const result = await pending
    const { args } = decodeFunctionData({ abi: FACTORY_ABI, data: result.signedMulticall.data as `0x${string}` })
    expect(args[0][0]?.callData).toBe(params.sdk.poller.encodeRegisterFromShed(original))
  })

  test('does not submit when signing or gas estimation fails', async () => {
    const params = setup()
    const send = jest.spyOn(adapters.viemAdapter.signer, 'sendTransaction')
    const sign = jest.spyOn(adapters.viemAdapter.signer, 'signTypedData').mockRejectedValue(new Error('Rejected'))
    await expect(params.sdk.registerFromShed(params)).rejects.toThrow('Rejected')
    expect(send).not.toHaveBeenCalled()
    sign.mockRestore()

    jest.spyOn(adapters.viemAdapter.signer, 'estimateGas').mockRejectedValue(new Error('Reverted'))
    await expect(params.sdk.registerFromShed({ ...params, gasLimit: undefined })).rejects.toThrow(
      'Error estimating gas',
    )
    expect(send).not.toHaveBeenCalled()
  })

  test('uses the CowShed gas estimate or the caller-provided fallback', async () => {
    const params = setup()
    const estimate = jest.spyOn(adapters.viemAdapter.signer, 'estimateGas').mockResolvedValue(300_000n)
    const estimated = await params.sdk.signRegisterFromShed({ ...params, gasLimit: undefined })
    expect(estimated.gasLimit).toBe(300_000n)

    estimate.mockRejectedValue(new Error('Reverted'))
    const fallback = await params.sdk.signRegisterFromShed({
      ...params,
      gasLimit: undefined,
      defaultGasLimit: GAS_LIMIT,
    })
    expect(fallback.gasLimit).toBe(GAS_LIMIT)
  })
})
