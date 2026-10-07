import { OrderKind } from '@cowprotocol/sdk-order-book'

import { BridgeStatus } from '../../types'
import { RelayBridgeProvider } from './RelayBridgeProvider'
import { RELAY_SUPPORTED_NETWORKS } from './const'

import type { RelayQuoteResponse, RelayStatusResponse } from './types'

// Subclass to expose protected api for mocking
class TestRelayBridgeProvider extends RelayBridgeProvider {
  get testApi() {
    return this.api
  }
}

function mockQuoteResponse(): RelayQuoteResponse {
  return {
    steps: [
      {
        id: 'deposit',
        action: 'Confirm transaction',
        description: 'Depositing funds',
        kind: 'transaction',
        requestId: '0xrequest123',
        depositAddress: '0xdeposit456',
        items: [],
      },
    ],
    fees: {
      gas: {
        currency: { chainId: 8453, address: '0x0', symbol: 'ETH', name: 'Ether', decimals: 18 },
        amount: '100000',
        amountFormatted: '0.0001',
        amountUsd: '0.20',
      },
      relayer: {
        currency: { chainId: 8453, address: '0xusdc', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        amount: '5000',
        amountFormatted: '0.005',
        amountUsd: '0.005',
      },
      relayerGas: {
        currency: { chainId: 1, address: '0x0', symbol: 'ETH', name: 'Ether', decimals: 18 },
        amount: '80000',
        amountFormatted: '0.00008',
        amountUsd: '0.16',
      },
      relayerService: {
        currency: { chainId: 8453, address: '0xusdc', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        amount: '2000',
        amountFormatted: '0.002',
        amountUsd: '0.002',
      },
    },
    details: {
      operation: 'bridge',
      sender: '0xsender',
      recipient: '0xrecipient',
      currencyIn: {
        currency: { chainId: 8453, address: '0xusdc', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        amount: '1000000',
        amountFormatted: '1.0',
        amountUsd: '1.00',
        minimumAmount: '990000',
      },
      currencyOut: {
        currency: { chainId: 1, address: '0xusdc-eth', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        amount: '995000',
        amountFormatted: '0.995',
        amountUsd: '0.995',
        minimumAmount: '985000',
      },
      rate: '0.995',
      timeEstimate: 15,
    },
  }
}

describe('RelayBridgeProvider', () => {
  let provider: TestRelayBridgeProvider

  beforeEach(() => {
    provider = new TestRelayBridgeProvider({ baseUrl: 'https://test.relay.link' })
  })

  it('passes apiKey to RelayApi which adds x-api-key header', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    })
    const originalFetch = global.fetch
    global.fetch = mockFetch

    try {
      const providerWithKey = new TestRelayBridgeProvider({ baseUrl: 'https://test.relay.link', apiKey: 'test-api-key' })
      await providerWithKey.testApi.getCurrencies({ chainIds: [1] })

      const [, options] = mockFetch.mock.calls[0] as [RequestInfo, RequestInit]
      const headers = new Headers(options.headers)
      expect(headers.get('x-api-key')).toBe('test-api-key')
    } finally {
      global.fetch = originalFetch
    }
  })

  describe('info', () => {
    it('has correct provider info', () => {
      expect(provider.info.name).toBe('Relay')
      expect(provider.type).toBe('ReceiverAccountBridgeProvider')
      expect(provider.info.website).toBe('https://relay.link')
    })
  })

  describe('getNetworks', () => {
    it('returns all 11 supported networks', async () => {
      const networks = await provider.getNetworks()
      expect(networks).toBe(RELAY_SUPPORTED_NETWORKS)
      expect(networks).toHaveLength(11)
    })
  })

  describe('getBuyTokens', () => {
    it('returns tokens for supported chain', async () => {
      const currencies = [
        { chainId: 8453, address: '0xusdc', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      ]
      jest.spyOn(provider.testApi, 'getCurrencies').mockResolvedValue(currencies)

      const result = await provider.getBuyTokens({ buyChainId: 8453 })
      expect(result.isRouteAvailable).toBe(true)
      expect(result.tokens).toHaveLength(1)
      expect(result.tokens[0]?.symbol).toBe('USDC')
    })

    it('returns empty for unsupported chain', async () => {
      const result = await provider.getBuyTokens({ buyChainId: 999999 as any })
      expect(result.isRouteAvailable).toBe(false)
      expect(result.tokens).toHaveLength(0)
    })
  })

  describe('getIntermediateTokens', () => {
    it('throws on non-sell orders', async () => {
      await expect(
        provider.getIntermediateTokens({ kind: OrderKind.BUY } as any),
      ).rejects.toThrow('ONLY_SELL_ORDER_SUPPORTED')
    })

    it('returns source tokens when buy token is available on dest', async () => {
      const sourceCurrencies = [
        { chainId: 8453, address: '0xusdc', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      ]
      const destCurrencies = [
        { chainId: 1, address: '0xusdc-eth', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      ]
      jest.spyOn(provider.testApi, 'getCurrencies')
        .mockResolvedValueOnce(sourceCurrencies)
        .mockResolvedValueOnce(destCurrencies)

      const result = await provider.getIntermediateTokens({
        kind: OrderKind.SELL,
        sellTokenChainId: 8453,
        buyTokenChainId: 1,
        buyTokenAddress: '0xusdc-eth',
      } as any)

      expect(result).toHaveLength(1)
    })
  })

  describe('getQuote', () => {
    it('returns correct RelayQuoteResult', async () => {
      jest.spyOn(provider.testApi, 'getQuote').mockResolvedValue(mockQuoteResponse())

      const result = await provider.getQuote({
        kind: OrderKind.SELL,
        sellTokenAddress: '0xusdc',
        sellTokenChainId: 8453,
        buyTokenAddress: '0xusdc-eth',
        buyTokenChainId: 1,
        amount: BigInt(1000000),
        account: '0xuser',
      } as any)

      expect(result.requestId).toBe('0xrequest123')
      expect(result.depositAddress).toBe('0xdeposit456')
      expect(result.timeEstimate).toBe(15)
      expect(result.isSell).toBe(true)
      expect(result.fees.bridgeFee).toBe(BigInt(5000))
      expect(result.fees.destinationGasFee).toBe(BigInt(80000))
      expect(result.limits.minDeposit).toBe(BigInt(990000))
      expect(result.limits.maxDeposit).toBe(BigInt(1000000))
      expect(result.quoteBody).toBeDefined()
    })

    it('throws NO_ROUTES when no deposit address', async () => {
      const response = mockQuoteResponse()
      response.steps[0].depositAddress = undefined
      jest.spyOn(provider.testApi, 'getQuote').mockResolvedValue(response)

      await expect(
        provider.getQuote({
          kind: OrderKind.SELL,
          sellTokenAddress: '0xusdc',
          sellTokenChainId: 8453,
          buyTokenAddress: '0xusdc-eth',
          buyTokenChainId: 1,
          amount: BigInt(1000000),
          account: '0xuser',
        } as any),
      ).rejects.toThrow('NO_ROUTES')
    })
  })

  describe('getBridgeReceiverOverride', () => {
    it('returns deposit address from quote', async () => {
      const result = await provider.getBridgeReceiverOverride({} as any, {
        depositAddress: '0xdeposit',
      } as any)
      expect(result).toBe('0xdeposit')
    })
  })

  describe('getBridgingParams', () => {
    function makeOrderWithQuoteBody(quoteBody: object, overrides: Record<string, unknown> = {}) {
      return {
        receiver: '0xdeposit',
        owner: '0xowner',
        fullAppData: JSON.stringify({
          metadata: { bridging: { quoteBody: JSON.stringify(quoteBody) } },
        }),
        ...overrides,
      } as any
    }

    it('returns null when order has no receiver', async () => {
      const result = await provider.getBridgingParams(8453 as any, { receiver: undefined, owner: '0xowner' } as any, '0xtx')
      expect(result).toBeNull()
    })

    it('returns null when no quoteBody in fullAppData', async () => {
      const result = await provider.getBridgingParams(8453 as any, { receiver: '0xdeposit', owner: '0xowner', fullAppData: '{}' } as any, '0xtx')
      expect(result).toBeNull()
    })

    it('extracts params from quoteBody', async () => {
      jest.spyOn(provider.testApi, 'getStatus').mockResolvedValue({ status: 'success', inTxHashes: ['0xin'], txHashes: ['0xout'] })

      const order = makeOrderWithQuoteBody({
        steps: [{ requestId: '0xreq1', depositAddress: '0xdeposit' }],
        details: {
          currencyIn: { currency: { chainId: 8453, address: '0xusdc-base', symbol: 'USDC', name: 'USDC', decimals: 6 }, amount: '1000000', amountFormatted: '1', amountUsd: '1' },
          currencyOut: { currency: { chainId: 1, address: '0xusdc-eth', symbol: 'USDC', name: 'USDC', decimals: 6 }, amount: '990000', amountFormatted: '0.99', amountUsd: '0.99' },
          timeEstimate: 15,
        },
      })

      const result = await provider.getBridgingParams(8453 as any, order, '0xtx')

      expect(result).not.toBeNull()
      if (!result) return
      expect(result.params.bridgingId).toBe('0xreq1')
      expect(result.params.inputTokenAddress).toBe('0xusdc-base')
      expect(result.params.outputTokenAddress).toBe('0xusdc-eth')
      expect(result.params.inputAmount).toBe(BigInt(1000000))
      expect(result.params.outputAmount).toBe(BigInt(990000))
      expect(result.params.sourceChainId).toBe(8453)
      expect(result.params.destinationChainId).toBe(1)
      expect(result.status.status).toBe(BridgeStatus.EXECUTED)
    })

    it('maps native address in getBridgingParams', async () => {
      jest.spyOn(provider.testApi, 'getStatus').mockResolvedValue({ status: 'pending' })

      const order = makeOrderWithQuoteBody({
        steps: [{ requestId: '0xreq2', depositAddress: '0xdeposit' }],
        details: {
          currencyIn: { currency: { chainId: 8453, address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ether', decimals: 18 }, amount: '1000000000000000000', amountFormatted: '1', amountUsd: '2000' },
          currencyOut: { currency: { chainId: 1, address: '0xusdc', symbol: 'USDC', name: 'USDC', decimals: 6 }, amount: '2000000000', amountFormatted: '2000', amountUsd: '2000' },
          timeEstimate: 30,
        },
      })

      const result = await provider.getBridgingParams(8453 as any, order, '0xtx')

      expect(result).not.toBeNull()
      if (!result) return
      expect(result.params.inputTokenAddress).toBe('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    })
  })

  describe('getExplorerUrl', () => {
    it('returns correct URL', () => {
      expect(provider.getExplorerUrl('0xbridge123')).toBe('https://relay.link/transaction/0xbridge123')
    })
  })

  describe('getStatus', () => {
    it('maps success status correctly', async () => {
      jest.spyOn(provider.testApi, 'getStatus').mockResolvedValue({
        status: 'success',
        inTxHashes: ['0xin'],
        txHashes: ['0xout'],
      } as RelayStatusResponse)

      const result = await provider.getStatus('0xid', 8453 as any)
      expect(result.status).toBe(BridgeStatus.EXECUTED)
      expect(result.depositTxHash).toBe('0xin')
      expect(result.fillTxHash).toBe('0xout')
    })

    it('maps refund status correctly', async () => {
      jest.spyOn(provider.testApi, 'getStatus').mockResolvedValue({ status: 'refund' } as RelayStatusResponse)

      const result = await provider.getStatus('0xid', 8453 as any)
      expect(result.status).toBe(BridgeStatus.REFUND)
    })

    it('maps failure status to EXPIRED', async () => {
      jest.spyOn(provider.testApi, 'getStatus').mockResolvedValue({ status: 'failure' } as RelayStatusResponse)

      const result = await provider.getStatus('0xid', 8453 as any)
      expect(result.status).toBe(BridgeStatus.EXPIRED)
    })

    it('maps in-progress statuses correctly', async () => {
      for (const status of ['waiting', 'depositing', 'pending', 'submitted']) {
        jest.spyOn(provider.testApi, 'getStatus').mockResolvedValue({ status } as RelayStatusResponse)
        const result = await provider.getStatus('0xid', 8453 as any)
        expect(result.status).toBe(BridgeStatus.IN_PROGRESS)
      }
    })

    it('returns UNKNOWN on error', async () => {
      jest.spyOn(provider.testApi, 'getStatus').mockRejectedValue(new Error('fail'))

      const result = await provider.getStatus('0xid', 8453 as any)
      expect(result.status).toBe(BridgeStatus.UNKNOWN)
    })
  })

  describe('getCancelBridgingTx', () => {
    it('throws not implemented', () => {
      expect(() => provider.getCancelBridgingTx('0x')).toThrow('Not implemented')
    })
  })

  describe('getRefundBridgingTx', () => {
    it('throws not implemented', () => {
      expect(() => provider.getRefundBridgingTx('0x')).toThrow('Not implemented')
    })
  })
})
