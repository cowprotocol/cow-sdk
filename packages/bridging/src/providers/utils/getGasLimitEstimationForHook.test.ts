import { getGasLimitEstimationForHook } from './getGasLimitEstimationForHook'
import { QuoteBridgeRequest } from '../../types'
import { COW_SHED_PROXY_CREATION_GAS, DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION } from '../../const'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../../tests/setup'

function makeRequest(overrides: Partial<QuoteBridgeRequest> = {}): QuoteBridgeRequest {
  return {
    kind: OrderKind.SELL,
    sellTokenChainId: SupportedChainId.MAINNET,
    sellTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    sellTokenDecimals: 6,
    buyTokenChainId: SupportedChainId.POLYGON,
    buyTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    buyTokenDecimals: 6,
    amount: 1000000n,
    account: '0x1234567890123456789012345678901234567890',
    appCode: 'test',
    signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
    ...overrides,
  }
}

describe('getGasLimitEstimationForHook', () => {
  const adapters = createAdapters()

  it('uses owner || account when resolving the proxy address', async () => {
    const adapter = adapters.ethersV5Adapter
    adapter.getCode = jest.fn().mockResolvedValue('0x')
    setGlobalAdapter(adapter)

    const getCowShedAccount = jest.fn().mockReturnValue('0xProxy')

    const owner = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    const account = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

    await getGasLimitEstimationForHook({
      cowShedSdk: { getCowShedAccount } as any,
      request: makeRequest({ owner, account }),
    })

    expect(getCowShedAccount).toHaveBeenCalledWith(SupportedChainId.MAINNET, owner)
  })

  it('falls back to account when owner is empty string', async () => {
    const adapter = adapters.ethersV5Adapter
    adapter.getCode = jest.fn().mockResolvedValue('0x')
    setGlobalAdapter(adapter)

    const getCowShedAccount = jest.fn().mockReturnValue('0xProxy')
    const account = '0xcccccccccccccccccccccccccccccccccccccccc'

    await getGasLimitEstimationForHook({
      cowShedSdk: { getCowShedAccount } as any,
      request: makeRequest({ owner: '' as QuoteBridgeRequest['owner'], account }),
    })

    expect(getCowShedAccount).toHaveBeenCalledWith(SupportedChainId.MAINNET, account)
  })

  it('returns base hook gas plus proxy creation when proxy bytecode is empty', async () => {
    const adapter = adapters.ethersV5Adapter
    adapter.getCode = jest.fn().mockResolvedValue('0x')
    setGlobalAdapter(adapter)

    const gas = await getGasLimitEstimationForHook({
      cowShedSdk: { getCowShedAccount: () => '0xProxy' } as any,
      request: makeRequest(),
      extraGasProxyCreation: 50_000,
    })

    expect(gas).toBe(DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + COW_SHED_PROXY_CREATION_GAS + 50_000)
  })

  it('returns default hook gas plus extraGas when proxy is deployed', async () => {
    const adapter = adapters.ethersV5Adapter
    adapter.getCode = jest.fn().mockResolvedValue('0x6000')
    setGlobalAdapter(adapter)

    const gas = await getGasLimitEstimationForHook({
      cowShedSdk: { getCowShedAccount: () => '0xProxy' } as any,
      request: makeRequest(),
      extraGas: 25_000,
    })

    expect(gas).toBe(DEFAULT_GAS_COST_FOR_HOOK_ESTIMATION + 25_000)
  })
})
