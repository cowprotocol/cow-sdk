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
import {
  BARN_ETH_FLOW_ADDRESSES,
  ETH_FLOW_ADDRESSES,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/sdk-config'
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

  describe('when a collision is detected by checkEthFlowOrderExists', () => {
    it('builds the on-chain transaction from the adjusted order, not the original — and returns a consistent orderToSign', async () => {
      setGlobalAdapter(adapters.ethersV5Adapter)

      // Baseline: what buyAmount getOrderToSign computes with no collision at all
      // (it applies its own slippage adjustment, so this is NOT literally params.buyAmount).
      const baseline = await getEthFlowTransaction(
        appDataKeccak256,
        params,
        chainId,
        { checkEthFlowOrderExists: jest.fn().mockResolvedValue(false) },
        adapters.ethersV5Adapter.signer,
      )

      let alreadyCalled = false
      const checkEthFlowOrderExists = jest.fn().mockImplementation(() => {
        return Promise.resolve(
          (() => {
            if (alreadyCalled) return false
            alreadyCalled = true
            return true
          })(),
        )
      })

      const result = await getEthFlowTransaction(
        appDataKeccak256,
        params,
        chainId,
        { checkEthFlowOrderExists },
        adapters.ethersV5Adapter.signer,
      )

      // Regression: this used to build the transaction from the ORIGINAL (pre-collision)
      // order even after a collision was detected, silently recreating the exact order
      // that would revert on-chain with OrderIsAlreadyOwned. The returned order must be
      // nudged by exactly 1 wei relative to the no-collision baseline.
      expect(result.orderToSign.buyAmount).toBe((BigInt(baseline.orderToSign.buyAmount) - BigInt(1)).toString())

      // The encoded calldata (what actually gets sent on-chain) must reflect the same
      // adjusted amount as what's returned to the caller — not the original input.
      expect(mockContract.interface.encodeFunctionData).toHaveBeenCalledWith(
        'createOrder',
        expect.arrayContaining([expect.objectContaining({ buyAmount: result.orderToSign.buyAmount })]),
      )
    })

    it('does not adjust anything when no collision is ever detected', async () => {
      setGlobalAdapter(adapters.ethersV5Adapter)

      const noCollision = jest.fn().mockResolvedValue(false)

      const resultA = await getEthFlowTransaction(
        appDataKeccak256,
        params,
        chainId,
        { checkEthFlowOrderExists: noCollision },
        adapters.ethersV5Adapter.signer,
      )
      const resultB = await getEthFlowTransaction(
        appDataKeccak256,
        params,
        chainId,
        { checkEthFlowOrderExists: noCollision },
        adapters.ethersV5Adapter.signer,
      )

      expect(resultA.orderToSign.buyAmount).toBe(resultB.orderToSign.buyAmount)
    })
  })

  describe('ethFlowContractOverride', () => {
    it('should use default ETH flow contract address when no override provided', async () => {
      setGlobalAdapter(adapters.ethersV5Adapter)

      await getEthFlowTransaction(appDataKeccak256, params, chainId, {}, adapters.ethersV5Adapter.signer)

      expect(ContractFactory.createEthFlowContract).toHaveBeenCalledWith(
        ETH_FLOW_ADDRESSES[chainId],
        expect.any(Object),
      )
    })

    it('should use BARN ETH flow contract address when env is "staging"', async () => {
      setGlobalAdapter(adapters.ethersV5Adapter)

      await getEthFlowTransaction(
        appDataKeccak256,
        { ...params, env: 'staging' },
        chainId,
        {},
        adapters.ethersV5Adapter.signer,
      )

      expect(ContractFactory.createEthFlowContract).toHaveBeenCalledWith(
        BARN_ETH_FLOW_ADDRESSES[chainId],
        expect.any(Object),
      )
    })

    it('should use custom ETH flow contract address when ethFlowContractOverride is provided', async () => {
      const customAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      setGlobalAdapter(adapters.ethersV5Adapter)

      await getEthFlowTransaction(
        appDataKeccak256,
        { ...params, ethFlowContractOverride: { [chainId]: customAddress } },
        chainId,
        {},
        adapters.ethersV5Adapter.signer,
      )

      expect(ContractFactory.createEthFlowContract).toHaveBeenCalledWith(customAddress, expect.any(Object))
    })

    it('should prioritize ethFlowContractOverride over staging env', async () => {
      const customAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      setGlobalAdapter(adapters.ethersV5Adapter)

      await getEthFlowTransaction(
        appDataKeccak256,
        { ...params, env: 'staging', ethFlowContractOverride: { [chainId]: customAddress } },
        chainId,
        {},
        adapters.ethersV5Adapter.signer,
      )

      expect(ContractFactory.createEthFlowContract).toHaveBeenCalledWith(customAddress, expect.any(Object))
    })
  })
})
