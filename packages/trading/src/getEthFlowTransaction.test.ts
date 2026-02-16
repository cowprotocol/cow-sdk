const GAS_BIGINT = BigInt(125000)

jest.mock('@cowprotocol/sdk-common', () => {
  const original = jest.requireActual('@cowprotocol/sdk-common')

  return {
    ...original,
    ContractFactory: {
      createEthFlowContract: jest.fn().mockReturnValue({
        address: '0xaa1',
        estimateGas: {
          createOrder: jest.fn().mockResolvedValue(GAS_BIGINT),
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue('0x0ac'),
        },
      }),
    },
  }
})

import { getEthFlowTransaction } from './getEthFlowTransaction'
import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/sdk-config'
import { LimitTradeParametersFromQuote } from './types'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { AdaptersTestSetup, createAdapters } from '../tests/setup'
import { setGlobalAdapter, ContractFactory } from '@cowprotocol/sdk-common'

const appDataKeccak256 = '0x578c975b1cfd3e24c21fb599076c4f7879c4268efd33eed3eb9efa5e30efac21'

const params: LimitTradeParametersFromQuote = {
  kind: OrderKind.SELL,
  sellToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  buyToken: '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab',
  sellAmount: '12000000000000000',
  buyAmount: '36520032402342342322',
  quoteId: 3,
  sellTokenDecimals: 18,
  buyTokenDecimals: 18,
}

describe('getEthFlowTransaction', () => {
  const chainId = SupportedChainId.GNOSIS_CHAIN
  let adapters: AdaptersTestSetup
  let mockContract: any

  beforeAll(() => {
    adapters = createAdapters()
  })

  beforeEach(() => {
    mockContract = {
      address: '0xaa1',
      estimateGas: {
        createOrder: jest.fn().mockResolvedValue(GAS_BIGINT),
      },
      interface: {
        encodeFunctionData: jest.fn().mockReturnValue('0x0ac'),
      },
    }
    ;(ContractFactory.createEthFlowContract as jest.Mock).mockReturnValue(mockContract)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should always override sell token with wrapped native token', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const result = await getEthFlowTransaction(appDataKeccak256, params, chainId, {}, adapters[adapterName].signer)
      results.push(result)
    }

    const wrappedToken = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN].address

    results.forEach((result) => {
      expect(result.transaction.data.includes(params.sellToken.slice(2))).toBe(false)
      expect(result.transaction.data.includes(wrappedToken.slice(2))).toBe(false)
    })
  })

  it('Should always override sell token with wrapped native token whitout signer', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const result = await getEthFlowTransaction(appDataKeccak256, params, chainId)
      results.push(result)
    }

    const wrappedToken = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN].address

    results.forEach((result) => {
      expect(result.transaction.data.includes(params.sellToken.slice(2))).toBe(false)
      expect(result.transaction.data.includes(wrappedToken.slice(2))).toBe(false)
    })
  })

  it('Should call gas estimation and return estimated value + 20%', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const result = await getEthFlowTransaction(appDataKeccak256, params, chainId, {}, adapters[adapterName].signer)
      results.push(result)
    }

    const gasNum = Number(GAS_BIGINT)

    results.forEach((result) => {
      expect(+result.transaction.gasLimit).toBe(gasNum + gasNum * 0.2)
    })
  })

  it('Transaction value should be equal to sell amount', async () => {
    const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
    const results: any[] = []

    for (const adapterName of adapterNames) {
      setGlobalAdapter(adapters[adapterName])
      const result = await getEthFlowTransaction(appDataKeccak256, params, chainId, {}, adapters[adapterName].signer)
      results.push(result)
    }

    results.forEach((result) => {
      expect(result.transaction.value).toBe('0x' + BigInt(params.sellAmount).toString(16))
    })
  })

  it('Should verify ContractFactory is called with correct parameters', async () => {
    setGlobalAdapter(adapters.ethersV5Adapter)

    await getEthFlowTransaction(appDataKeccak256, params, chainId, {}, adapters.ethersV5Adapter.signer)

    expect(ContractFactory.createEthFlowContract).toHaveBeenCalledWith(
      expect.stringContaining('0x'),
      expect.any(Object),
    )
  })
})
