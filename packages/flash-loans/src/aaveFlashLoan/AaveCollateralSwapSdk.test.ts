import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'
import { TradingSdk, TradeParameters } from '@cowprotocol/sdk-trading'

import { createAdapters, TEST_ADDRESS } from '../../tests/setup'

import { AaveCollateralSwapSdk } from './AaveCollateralSwapSdk'
import { AAVE_ADAPTER_FACTORY } from './const'

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

const mockTradeParameters: TradeParameters = {
  sellToken: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
  sellTokenDecimals: 18,
  buyToken: '0x7B878668Cd1a3adF89764D3a331E0A7BB832192D',
  buyTokenDecimals: 6,
  amount: '1000000000000000000',
  kind: OrderKind.SELL,
  validFor: 600,
  slippageBps: 50,
}

const mockOrderToSign = {
  sellToken: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
  buyToken: '0x7B878668Cd1a3adF89764D3a331E0A7BB832192D',
  receiver: '0xa6ddbd0de6b310819b49f680f65871bee85f517e',
  sellAmount: '950000000000000000',
  buyAmount: '23000020000',
  validTo: 5000222,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  feeAmount: '2300000',
  kind: OrderKind.SELL,
  partiallyFillable: false,
}

const amountsAndCostsMock = {
  afterSlippage: {
    buyAmount: '23000020000',
    sellAmount: '950000000000000000',
  },
  beforeSlippage: {
    buyAmount: '24000020000',
    sellAmount: '950000000000000000',
  },
  costs: {
    networkFee: {
      amountInSellCurrency: '0',
      amountInBuyCurrency: '0',
    },
    partnerFee: {
      amountInSellCurrency: '0',
      amountInBuyCurrency: '0',
    },
  },
}

adapterNames.forEach((adapterName) => {
  const adapter = adapters[adapterName]

  describe(`AaveCollateralSwapSdk with ${adapterName}`, () => {
    let mockTradingSdk: jest.Mocked<TradingSdk>
    let flashLoanSdk: AaveCollateralSwapSdk
    let mockPostSwapOrderFromQuote: jest.Mock

    beforeEach(() => {
      // Mock readContract to avoid real blockchain calls
      jest.spyOn(adapter, 'readContract').mockResolvedValue('0x1234567890123456789012345678901234567890' as any)

      setGlobalAdapter(adapter)

      // Create reusable mock for postSwapOrderFromQuote
      mockPostSwapOrderFromQuote = jest.fn().mockResolvedValue({ orderId: 'mock-order-id' })

      mockTradingSdk = {
        getQuote: jest.fn().mockResolvedValue({
          quoteResults: {
            orderToSign: mockOrderToSign,
            amountsAndCosts: amountsAndCostsMock,
          },
          postSwapOrderFromQuote: mockPostSwapOrderFromQuote,
        }),
      } as unknown as jest.Mocked<TradingSdk>

      flashLoanSdk = new AaveCollateralSwapSdk()
    })

    describe('collateralSwap', () => {
      test(`should successfully execute collateral swap with default fee`, async () => {
        const result = await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
          },
          mockTradingSdk,
        )

        expect(result).toEqual({ orderId: 'mock-order-id' })

        expect(mockTradingSdk.getQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            chainId: SupportedChainId.SEPOLIA,
            sellToken: mockTradeParameters.sellToken,
            buyToken: mockTradeParameters.buyToken,
            kind: OrderKind.SELL,
            amount: mockTradeParameters.amount,
            owner: TEST_ADDRESS,
          }),
        )
      })

      test(`should calculate flash loan fee correctly`, async () => {
        const flashLoanFeePercent = 0.05 // 0.05%
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            flashLoanFeePercent,
          },
          mockTradingSdk,
        )

        expect(mockTradingSdk.getQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: expect.stringMatching(/^\d+$/),
          }),
        )

        const callArgs = (mockTradingSdk.getQuote as jest.Mock).mock.calls[0][0]
        const adjustedAmount = BigInt(callArgs.amount)
        const originalAmount = BigInt(mockTradeParameters.amount)

        expect(adjustedAmount).toBeLessThan(originalAmount)
      })

      test(`should use provided owner address`, async () => {
        const customOwner = '0x1234567890123456789012345678901234567890'
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: {
              ...mockTradeParameters,
              owner: customOwner,
            },
          },
          mockTradingSdk,
        )

        expect(mockTradingSdk.getQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            owner: customOwner,
          }),
        )
      })

      test(`should use default validity when not provided`, async () => {
        const { validFor: _validFor, ...paramsWithoutValidFor } = mockTradeParameters

        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: paramsWithoutValidFor as TradeParameters,
          },
          mockTradingSdk,
        )

        expect(mockTradingSdk.getQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            validFor: 600,
          }),
        )
      })

      test(`should handle different chain IDs`, async () => {
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.GNOSIS_CHAIN,
            tradeParameters: mockTradeParameters,
          },
          mockTradingSdk,
        )

        expect(mockTradingSdk.getQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            chainId: SupportedChainId.GNOSIS_CHAIN,
          }),
        )
      })

      test(`should post order with EIP1271 signing scheme`, async () => {
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
          },
          mockTradingSdk,
        )

        expect(mockPostSwapOrderFromQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            additionalParams: {
              signingScheme: SigningScheme.EIP1271,
            },
          }),
        )
      })

      test(`should include flash loan hint in app data`, async () => {
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
          },
          mockTradingSdk,
        )

        expect(mockPostSwapOrderFromQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            appData: {
              metadata: expect.objectContaining({
                flashloan: expect.objectContaining({
                  amount: expect.any(String),
                  receiver: AAVE_ADAPTER_FACTORY,
                  token: mockTradeParameters.sellToken,
                }),
              }),
            },
          }),
        )
      })

      test(`should include hooks in app data`, async () => {
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
          },
          mockTradingSdk,
        )

        expect(mockPostSwapOrderFromQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            appData: {
              metadata: expect.objectContaining({
                hooks: expect.objectContaining({
                  pre: expect.arrayContaining([
                    expect.objectContaining({
                      target: AAVE_ADAPTER_FACTORY,
                      callData: expect.any(String),
                      gasLimit: expect.any(String),
                    }),
                  ]),
                  post: expect.arrayContaining([
                    expect.objectContaining({
                      target: expect.any(String),
                      callData: expect.any(String),
                      gasLimit: expect.any(String),
                    }),
                  ]),
                }),
              }),
            },
          }),
        )
      })

      test(`should handle zero flash loan fee`, async () => {
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            flashLoanFeePercent: 0,
          },
          mockTradingSdk,
        )

        const callArgs = (mockTradingSdk.getQuote as jest.Mock).mock.calls[0][0]
        expect(callArgs.amount).toBe(mockTradeParameters.amount)
      })
    })
  })
})
