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

import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { ETH_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi, OrderKind } from '@cowprotocol/sdk-order-book'

import { AdaptersTestSetup, createAdapters } from '../tests/setup'
import { TradingSdk } from './tradingSdk'
import { TradeBaseParameters } from './types'

const COW_ADDRESS = '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59'

/**
 * Sell quote for 0.1 ETH.
 *
 * For SELL orders the API returns `sellAmount` AFTER network costs, so the amount the user
 * actually asked to sell is `sellAmount + feeAmount`:
 * 98646335338956442 + 1353664661043558 = 100000000000000000 (0.1 ETH)
 */
const SELL_QUOTE_MOCK = {
  quote: {
    sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    buyToken: COW_ADDRESS.toLowerCase(),
    receiver: '0xc8c753ee51e8fc80e199ab297fb575634a1ac1d3',
    sellAmount: '98646335338956442',
    buyAmount: '30000000000000000000',
    validTo: 1737464594,
    appData:
      '{"appCode":"test","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":50}},"version":"1.3.0"}',
    appDataHash: '0xe269b09f45b1d3c98d8e4e841b99a0779fbd3b77943d069b91ddc4fd9789e27e',
    feeAmount: '1353664661043558',
    kind: 'sell',
    partiallyFillable: false,
    sellTokenBalance: 'erc20',
    buyTokenBalance: 'erc20',
    signingScheme: 'eip712',
  },
  from: '0xc8c753ee51e8fc80e199ab297fb575634a1ac1d3',
  expiration: '2025-01-21T12:55:14.799709609Z',
  id: 575401,
  verified: true,
}

const SELL_AMOUNT_BEFORE_NETWORK_COSTS = '100000000000000000'

const orderParams: TradeBaseParameters & { slippageBps: number } = {
  kind: OrderKind.SELL,
  sellToken: ETH_ADDRESS,
  sellTokenDecimals: 18,
  buyToken: COW_ADDRESS,
  buyTokenDecimals: 18,
  amount: SELL_AMOUNT_BEFORE_NETWORK_COSTS,
  slippageBps: 50,
}

describe('TradingSdk.postSellNativeCurrencyOrder', () => {
  let adapters: AdaptersTestSetup
  let adapterNames: Array<keyof AdaptersTestSetup>
  let orderBookApi: OrderBookApi

  beforeAll(() => {
    adapters = createAdapters()
    adapterNames = Object.keys(adapters) as Array<keyof AdaptersTestSetup>
  })

  beforeEach(() => {
    orderBookApi = {
      context: { chainId: SupportedChainId.SEPOLIA, env: 'prod' },
      getQuote: jest.fn().mockResolvedValue(SELL_QUOTE_MOCK),
      uploadAppData: jest.fn().mockResolvedValue(undefined),
      sendOrder: jest.fn().mockResolvedValue('0x01'),
    } as unknown as OrderBookApi
  })

  it('Should sell the full native amount, taking the quote network costs into account', async () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]
      setGlobalAdapter(adapter)

      const originalSendTransaction = adapter.signer.sendTransaction.bind(adapter.signer)
      const sendTransaction = jest.fn().mockResolvedValue({ hash: '0xccdd11' })
      adapter.signer.sendTransaction = sendTransaction

      try {
        const sdk = new TradingSdk(
          { chainId: SupportedChainId.SEPOLIA, appCode: 'test' },
          { enableLogging: false, orderBookApi },
        )

        const { orderToSign } = await sdk.postSellNativeCurrencyOrder(orderParams)

        // The EthFlow order must sell the amount the user asked for (quote sellAmount + feeAmount),
        // exactly like the ERC-20 flow does. See getQuoteAmountsAndCosts: for SELL orders the
        // settlement contract deducts the network costs from the signed sellAmount.
        expect(orderToSign.sellAmount).toBe(SELL_AMOUNT_BEFORE_NETWORK_COSTS)

        // ...and the same amount of native currency must be sent on-chain
        expect(sendTransaction).toHaveBeenCalledTimes(1)
        expect(sendTransaction.mock.calls[0][0].value).toBe(
          '0x' + BigInt(SELL_AMOUNT_BEFORE_NETWORK_COSTS).toString(16),
        )
      } finally {
        adapter.signer.sendTransaction = originalSendTransaction
      }
    }
  })

  it('Should build the same order as postSwapOrder() does for a native sell token', async () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]
      setGlobalAdapter(adapter)

      const originalSendTransaction = adapter.signer.sendTransaction.bind(adapter.signer)
      adapter.signer.sendTransaction = jest.fn().mockResolvedValue({ hash: '0xccdd11' })

      try {
        const sdk = new TradingSdk(
          { chainId: SupportedChainId.SEPOLIA, appCode: 'test' },
          { enableLogging: false, orderBookApi },
        )

        // postSwapOrder() detects the native sell token and delegates to the EthFlow flow,
        // so both entry points must produce the same order.
        const viaSwapOrder = await sdk.postSwapOrder(orderParams)
        const viaNativeOrder = await sdk.postSellNativeCurrencyOrder(orderParams)

        expect(viaNativeOrder.orderToSign.sellAmount).toBe(viaSwapOrder.orderToSign?.sellAmount)
        expect(viaNativeOrder.orderToSign.buyAmount).toBe(viaSwapOrder.orderToSign?.buyAmount)
      } finally {
        adapter.signer.sendTransaction = originalSendTransaction
      }
    }
  })

  it('Should let advancedSettings.additionalParams override the quote network costs', async () => {
    for (const adapterName of adapterNames) {
      const adapter = adapters[adapterName]
      setGlobalAdapter(adapter)

      const originalSendTransaction = adapter.signer.sendTransaction.bind(adapter.signer)
      adapter.signer.sendTransaction = jest.fn().mockResolvedValue({ hash: '0xccdd11' })

      try {
        const sdk = new TradingSdk(
          { chainId: SupportedChainId.SEPOLIA, appCode: 'test' },
          { enableLogging: false, orderBookApi },
        )

        const { orderToSign } = await sdk.postSellNativeCurrencyOrder(orderParams, {
          additionalParams: { networkCostsAmount: '0' },
        })

        expect(orderToSign.sellAmount).toBe(SELL_QUOTE_MOCK.quote.sellAmount)
      } finally {
        adapter.signer.sendTransaction = originalSendTransaction
      }
    }
  })
})
