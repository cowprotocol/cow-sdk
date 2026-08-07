import { setGlobalAdapter } from '@cowprotocol/sdk-common'

import { ComposableCowPollerSdk, type ComposableCowPollerSchedule } from '../src'
import { createAdapters } from './setup'

const SCHEDULE: ComposableCowPollerSchedule = {
  handler: '0x1111111111111111111111111111111111111111',
  funder: '0x2222222222222222222222222222222222222222',
  owner: '0x3333333333333333333333333333333333333333',
  salt: '0x0000000000000000000000000000000000000000000000000000000000000001',
  staticInput: '0x1234',
}

const SCHEDULE_ID = '0x7b1516d117fa5dd96fddfb9489b52af1c3cca64e1bc88c32324bdd6a92c6057c'
const POLLER_ADDRESS = '0x4444444444444444444444444444444444444444'
const CHAIN_ID = 1
const NONCE = 7n
const DEADLINE = 2_000_000_000n
const SIGNATURE = '0x123456'

describe('ComposableCowPollerSdk', () => {
  const adapters = createAdapters()
  const adapter = adapters.viemAdapter
  const sdk = new ComposableCowPollerSdk({ chainId: CHAIN_ID, pollerAddress: POLLER_ADDRESS })

  beforeEach(() => {
    setGlobalAdapter(adapter)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('signs registration and returns ready-to-submit calldata', async () => {
    jest.spyOn(sdk.poller, 'getNonce').mockResolvedValue(NONCE)
    const getRegisterTypedData = jest.spyOn(sdk.poller, 'getRegisterTypedData')
    const signTypedData = jest.spyOn(adapter.signer, 'signTypedData').mockResolvedValue(SIGNATURE)

    const result = await sdk.signRegister({ schedule: SCHEDULE, deadline: DEADLINE })

    expect(sdk.poller.getNonce).toHaveBeenCalledWith(SCHEDULE.funder)
    expect(getRegisterTypedData.mock.calls[0]?.[0]).toEqual({
      chainId: CHAIN_ID,
      schedule: SCHEDULE,
      nonce: NONCE,
      deadline: DEADLINE,
    })
    expect(signTypedData).toHaveBeenCalledWith(
      result.typedData.domain,
      result.typedData.types,
      result.typedData.message,
    )
    expect(result.signature).toEqual(SIGNATURE)
    expect(result.calldata).toEqual(sdk.poller.encodeRegisterWithSignature(SCHEDULE, DEADLINE, SIGNATURE))
  })

  test('signs revocation and returns ready-to-submit calldata', async () => {
    jest.spyOn(sdk.poller, 'getNonce').mockResolvedValue(NONCE)
    const getRevokeTypedData = jest.spyOn(sdk.poller, 'getRevokeTypedData')
    const signTypedData = jest.spyOn(adapter.signer, 'signTypedData').mockResolvedValue(SIGNATURE)

    const result = await sdk.signRevoke({ id: SCHEDULE_ID, funder: SCHEDULE.funder, deadline: DEADLINE })

    expect(sdk.poller.getNonce).toHaveBeenCalledWith(SCHEDULE.funder)
    expect(getRevokeTypedData.mock.calls[0]?.[0]).toEqual({
      chainId: CHAIN_ID,
      id: SCHEDULE_ID,
      funder: SCHEDULE.funder,
      nonce: NONCE,
      deadline: DEADLINE,
    })
    expect(signTypedData).toHaveBeenCalledWith(
      result.typedData.domain,
      result.typedData.types,
      result.typedData.message,
    )
    expect(result.signature).toEqual(SIGNATURE)
    expect(result.calldata).toEqual(sdk.poller.encodeRevokeWithSignature(SCHEDULE_ID, DEADLINE, SIGNATURE))
  })

  test('submits direct and signature-authorized Poller transactions', async () => {
    const transactionResponse = {
      hash: '0xtransaction',
      wait: jest.fn(),
    }
    const sendTransaction = jest
      .spyOn(adapter.signer, 'sendTransaction')
      .mockResolvedValue(transactionResponse as never)

    await expect(sdk.register({ schedule: SCHEDULE })).resolves.toBe(transactionResponse)
    await expect(
      sdk.registerWithSignature({ schedule: SCHEDULE, deadline: DEADLINE, signature: SIGNATURE }),
    ).resolves.toBe(transactionResponse)
    await expect(sdk.pollFunds({ id: SCHEDULE_ID })).resolves.toBe(transactionResponse)
    await expect(sdk.revoke({ id: SCHEDULE_ID })).resolves.toBe(transactionResponse)
    await expect(sdk.revokeWithSignature({ id: SCHEDULE_ID, deadline: DEADLINE, signature: SIGNATURE })).resolves.toBe(
      transactionResponse,
    )

    expect(sendTransaction.mock.calls).toEqual([
      [{ to: POLLER_ADDRESS, data: sdk.poller.encodeRegister(SCHEDULE) }],
      [{ to: POLLER_ADDRESS, data: sdk.poller.encodeRegisterWithSignature(SCHEDULE, DEADLINE, SIGNATURE) }],
      [{ to: POLLER_ADDRESS, data: sdk.poller.encodePollFunds(SCHEDULE_ID) }],
      [{ to: POLLER_ADDRESS, data: sdk.poller.encodeRevoke(SCHEDULE_ID) }],
      [{ to: POLLER_ADDRESS, data: sdk.poller.encodeRevokeWithSignature(SCHEDULE_ID, DEADLINE, SIGNATURE) }],
    ])
  })

  test('uses the configured signer and accepts a per-call override', async () => {
    const configuredSignerLike = '0x5555555555555555555555555555555555555555'
    const overrideSignerLike = '0x6666666666666666666666666666666666666666'
    const configuredSigner = { signTypedData: jest.fn().mockResolvedValue(SIGNATURE) }
    const overrideSigner = { signTypedData: jest.fn().mockResolvedValue(SIGNATURE) }
    const createSigner = jest.spyOn(adapter, 'createSigner').mockImplementation((signerLike) => {
      return (signerLike === overrideSignerLike ? overrideSigner : configuredSigner) as never
    })
    const configuredSdk = new ComposableCowPollerSdk({
      chainId: CHAIN_ID,
      pollerAddress: POLLER_ADDRESS,
      signer: configuredSignerLike,
    })
    jest.spyOn(configuredSdk.poller, 'getNonce').mockResolvedValue(NONCE)

    await configuredSdk.signRegister({ schedule: SCHEDULE, deadline: DEADLINE })
    await configuredSdk.signRevoke({
      id: SCHEDULE_ID,
      funder: SCHEDULE.funder,
      deadline: DEADLINE,
      signer: overrideSignerLike,
    })

    expect(createSigner.mock.calls).toEqual([[configuredSignerLike], [overrideSignerLike]])
    expect(configuredSigner.signTypedData).toHaveBeenCalledTimes(1)
    expect(overrideSigner.signTypedData).toHaveBeenCalledTimes(1)
  })

  test('configures an explicitly supplied adapter', async () => {
    setGlobalAdapter(adapters.ethersV6Adapter)
    const sendTransaction = jest.spyOn(adapter.signer, 'sendTransaction').mockResolvedValue({
      hash: '0xconfigured-adapter',
      wait: jest.fn(),
    } as never)

    const configuredSdk = new ComposableCowPollerSdk({ chainId: CHAIN_ID, pollerAddress: POLLER_ADDRESS }, adapter)
    await configuredSdk.register({ schedule: SCHEDULE })

    expect(sendTransaction).toHaveBeenCalledWith({
      to: POLLER_ADDRESS,
      data: configuredSdk.poller.encodeRegister(SCHEDULE),
    })
  })
})
