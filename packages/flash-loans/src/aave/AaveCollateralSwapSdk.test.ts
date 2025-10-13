import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'
import { TradingSdk, TradeParameters } from '@cowprotocol/sdk-trading'

import { createAdapters, TEST_ADDRESS } from '../../tests/setup'

import { AaveCollateralSwapSdk } from './AaveCollateralSwapSdk'
import { AAVE_ADAPTER_FACTORY, GAS_ESTIMATION_ADDITION_PERCENT, HASH_ZERO } from './const'

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

const collateralToken = '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533' // aGnoWXDAI

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
            collateralToken,
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
            collateralToken,
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
            collateralToken,
          },
          mockTradingSdk,
        )

        expect(mockTradingSdk.getQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            owner: customOwner,
          }),
        )
      })

      test(`should handle different chain IDs`, async () => {
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.GNOSIS_CHAIN,
            tradeParameters: mockTradeParameters,
            collateralToken,
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
            collateralToken,
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
            collateralToken,
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

      test(`should include collateralPermit in app data`, async () => {
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            collateralToken,
            settings: {
              collateralPermit: {
                amount: '0',
                deadline: 0,
                v: 0,
                r: HASH_ZERO, // bytes32(0) in Solidity
                s: HASH_ZERO, // bytes32(0) in Solidity
              },
            },
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
            collateralToken,
          },
          mockTradingSdk,
        )

        const callArgs = (mockTradingSdk.getQuote as jest.Mock).mock.calls[0][0]
        expect(callArgs.amount).toBe(mockTradeParameters.amount)
      })

      test(`should add ${GAS_ESTIMATION_ADDITION_PERCENT}% to pre-hook gas estimation`, async () => {
        const mockEstimatedGas = 500_000n
        const expectedGasLimit = (mockEstimatedGas * BigInt(GAS_ESTIMATION_ADDITION_PERCENT + 100)) / 100n

        jest.spyOn(adapter.signer, 'estimateGas').mockResolvedValue(mockEstimatedGas)

        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            collateralToken,
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
                      gasLimit: expectedGasLimit.toString(),
                    }),
                  ]),
                }),
              }),
            },
          }),
        )
      })

      test(`should add ${GAS_ESTIMATION_ADDITION_PERCENT}% to post-hook gas estimation when collateralPermit is provided`, async () => {
        const mockEstimatedGas = 300_000n
        const expectedGasLimit = (mockEstimatedGas * BigInt(GAS_ESTIMATION_ADDITION_PERCENT + 100)) / 100n

        jest.spyOn(adapter.signer, 'estimateGas').mockResolvedValue(mockEstimatedGas)

        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            collateralToken,
            settings: {
              collateralPermit: {
                amount: '0',
                deadline: 0,
                v: 0,
                r: HASH_ZERO,
                s: HASH_ZERO,
              },
            },
          },
          mockTradingSdk,
        )

        const callArgs = (mockPostSwapOrderFromQuote as jest.Mock).mock.calls[0][0]
        const postHooks = callArgs.appData.metadata.hooks.post

        expect(postHooks).toBeDefined()
        expect(postHooks[0].gasLimit).toBe(expectedGasLimit.toString())
      })
    })

    describe('getCollateralAllowance', () => {
      test('should return the current allowance', async () => {
        const mockAllowance = BigInt('5000000000000000000')
        jest.spyOn(adapter, 'readContract').mockResolvedValue(mockAllowance as any)

        const allowance = await flashLoanSdk.getCollateralAllowance({
          trader: TEST_ADDRESS,
          collateralToken,
          amount: BigInt('1000000000000000000'),
          instanceAddress: '0x1234567890123456789012345678901234567890',
        })

        expect(allowance).toBe(mockAllowance)
        expect(adapter.readContract).toHaveBeenCalledWith(
          expect.objectContaining({
            address: collateralToken,
            functionName: 'allowance',
            args: [TEST_ADDRESS, '0x1234567890123456789012345678901234567890'],
          }),
        )
      })

      test('should return zero for no allowance', async () => {
        jest.spyOn(adapter, 'readContract').mockResolvedValue(BigInt(0) as any)

        const allowance = await flashLoanSdk.getCollateralAllowance({
          trader: TEST_ADDRESS,
          collateralToken,
          amount: BigInt('1000000000000000000'),
          instanceAddress: '0x1234567890123456789012345678901234567890',
        })

        expect(allowance).toBe(BigInt(0))
      })

      test('should call readContract with correct parameters', async () => {
        const instanceAddress = '0xabcdef0123456789012345678901234567890abc'
        jest.spyOn(adapter, 'readContract').mockResolvedValue(BigInt('1000000') as any)

        await flashLoanSdk.getCollateralAllowance({
          trader: TEST_ADDRESS,
          collateralToken,
          amount: BigInt('1000000000000000000'),
          instanceAddress,
        })

        expect(adapter.readContract).toHaveBeenCalledWith({
          address: collateralToken,
          abi: expect.any(Array),
          functionName: 'allowance',
          args: [TEST_ADDRESS, instanceAddress],
        })
      })
    })

    describe('approveCollateral', () => {
      test('should send approval transaction with correct parameters', async () => {
        const mockTxResponse = { hash: '0xabc123' }
        const sendTransactionSpy = jest
          .spyOn(adapter.signer, 'sendTransaction')
          .mockResolvedValue(mockTxResponse as any)

        const amount = BigInt('20000000000000000000')
        const instanceAddress = '0x1234567890123456789012345678901234567890'

        const result = await flashLoanSdk.approveCollateral({
          trader: TEST_ADDRESS,
          collateralToken,
          amount,
          instanceAddress,
        })

        expect(result).toBe(mockTxResponse)
        expect(sendTransactionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            to: collateralToken,
            data: expect.any(String),
          }),
        )
      })

      test('should encode approval amount in hex correctly', async () => {
        const mockTxResponse = { hash: '0xdef456' }
        const sendTransactionSpy = jest
          .spyOn(adapter.signer, 'sendTransaction')
          .mockResolvedValue(mockTxResponse as any)

        const amount = BigInt('1000000000000000000')
        const instanceAddress = '0xabcdef0123456789012345678901234567890abc'

        await flashLoanSdk.approveCollateral({
          trader: TEST_ADDRESS,
          collateralToken,
          amount,
          instanceAddress,
        })

        const callArgs = sendTransactionSpy.mock.calls?.[0]?.[0]
        expect(callArgs?.to).toBe(collateralToken)
        expect(callArgs?.data).toContain('0x')
      })
    })
  })
})
