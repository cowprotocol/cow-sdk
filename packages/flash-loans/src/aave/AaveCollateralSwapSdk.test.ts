import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind, SigningScheme } from '@cowprotocol/sdk-order-book'
import { TradingSdk, TradeParameters } from '@cowprotocol/sdk-trading'

import { createAdapters, TEST_ADDRESS } from '../../tests/setup'

import { AaveCollateralSwapSdk } from './AaveCollateralSwapSdk'
import { AAVE_ADAPTER_FACTORY, HASH_ZERO } from './const'

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
            additionalParams: expect.objectContaining({
              signingScheme: SigningScheme.EIP1271,
              customEIP1271Signature: expect.any(Function),
            }),
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
                  receiver: AAVE_ADAPTER_FACTORY[SupportedChainId.SEPOLIA],
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
                      target: AAVE_ADAPTER_FACTORY[SupportedChainId.SEPOLIA],
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

      test(`should use default gas limit for pre-hook`, async () => {
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
                      target: AAVE_ADAPTER_FACTORY[SupportedChainId.SEPOLIA],
                      callData: expect.any(String),
                      gasLimit: '300000',
                    }),
                  ]),
                }),
              }),
            },
          }),
        )
      })

      test(`should use default gas limit for post-hook`, async () => {
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            collateralToken,
          },
          mockTradingSdk,
        )

        const callArgs = (mockPostSwapOrderFromQuote as jest.Mock).mock.calls[0][0]
        const postHooks = callArgs.appData.metadata.hooks.post

        expect(postHooks).toBeDefined()
        expect(postHooks[0].gasLimit).toBe('600000')
      })

      test(`should always include post-hook with empty permit by default`, async () => {
        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            collateralToken,
          },
          mockTradingSdk,
        )

        const callArgs = (mockPostSwapOrderFromQuote as jest.Mock).mock.calls[0][0]
        const postHooks = callArgs.appData.metadata.hooks.post

        expect(postHooks).toBeDefined()
        expect(postHooks).toHaveLength(1)
        expect(postHooks[0]).toMatchObject({
          target: expect.any(String),
          callData: expect.any(String),
          gasLimit: '600000',
        })
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

    describe('calculateFlashLoanAmounts', () => {
      test('should calculate correct flash loan fee amount', () => {
        const sellAmount = BigInt('1000000000000000000') // 1 ETH
        const flashLoanFeeBps = 5 // 0.05%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 0.05% of 1 ETH = 0.0005 ETH = 500000000000000 wei
        expect(result.flashLoanFeeAmount).toBe(BigInt('500000000000000'))
        expect(result.sellAmountToSign).toBe(BigInt('999500000000000000'))
      })

      test('should handle zero flash loan fee', () => {
        const sellAmount = BigInt('1000000000000000000') // 1 ETH
        const flashLoanFeeBps = 0

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        expect(result.flashLoanFeeAmount).toBe(BigInt('0'))
        expect(result.sellAmountToSign).toBe(sellAmount)
      })

      test('should calculate fee for small amounts', () => {
        const sellAmount = BigInt('100') // Very small amount
        const flashLoanFeeBps = 9 // 0.09%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 100 * 9 / 10000 = 0.09, ceil rounds up to 1
        expect(result.flashLoanFeeAmount).toBe(BigInt('1'))
        expect(result.sellAmountToSign).toBe(BigInt('99'))
      })

      test('should calculate fee for large percentage', () => {
        const sellAmount = BigInt('10000000000000000000') // 10 ETH
        const flashLoanFeeBps = 100 // 1%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 1% of 10 ETH = 0.1 ETH = 100000000000000000 wei
        expect(result.flashLoanFeeAmount).toBe(BigInt('100000000000000000'))
        expect(result.sellAmountToSign).toBe(BigInt('9900000000000000000'))
      })

      test('should handle fractional percentages precisely', () => {
        const sellAmount = BigInt('1000000000000000000') // 1 ETH
        const flashLoanFeeBps = 123 // 1.23% (123 basis points)

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 1000000000000000000 * 123 / 10000 = 12300000000000000 (exact)
        expect(result.flashLoanFeeAmount).toBe(BigInt('12300000000000000'))
        expect(result.sellAmountToSign).toBe(BigInt('987700000000000000'))
      })

      test('should round up for very small amounts with tiny remainders', () => {
        // Test edge case: amount so small that fee rounds to 1 wei
        const sellAmount = BigInt('1') // 1 wei
        const flashLoanFeeBps = 5 // 0.05%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 1 * 5 / 10000 = 0.0005, should round up to 1
        expect(result.flashLoanFeeAmount).toBe(BigInt('1'))
        expect(result.sellAmountToSign).toBe(BigInt('0'))
      })

      test('should handle exact division with no remainder', () => {
        // Test case where division is exact (no rounding needed)
        const sellAmount = BigInt('10000') // 10000 wei
        const flashLoanFeeBps = 1 // 0.01%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 10000 * 1 / 10000 = 1 (exact)
        expect(result.flashLoanFeeAmount).toBe(BigInt('1'))
        expect(result.sellAmountToSign).toBe(BigInt('9999'))
      })

      test('should round up for small remainder', () => {
        // Test with remainder = 1
        const sellAmount = BigInt('10001')
        const flashLoanFeeBps = 1 // 0.01%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 10001 * 1 / 10000 = 1.0001, should round up to 2
        expect(result.flashLoanFeeAmount).toBe(BigInt('2'))
        expect(result.sellAmountToSign).toBe(BigInt('9999'))
      })

      test('should round up for medium amounts', () => {
        // Test with typical DeFi amounts
        const sellAmount = BigInt('1500000000000000000') // 1.5 ETH
        const flashLoanFeeBps = 9 // 0.09%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 1.5 ETH * 0.09% = 0.00135 ETH = 1350000000000000 wei
        // 1500000000000000000 * 9 / 10000 = 1350000000000000 (exact)
        expect(result.flashLoanFeeAmount).toBe(BigInt('1350000000000000'))
        expect(result.sellAmountToSign).toBe(BigInt('1498650000000000000'))
      })

      test('should round up for large amounts with small remainder', () => {
        // Test with very large amounts (100 ETH)
        const sellAmount = BigInt('100000000000000000001') // 100 ETH + 1 wei
        const flashLoanFeeBps = 5 // 0.05%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 100000000000000000001 * 5 / 10000 = 50000000000000000.0005
        // Should round up to 50000000000000001
        expect(result.flashLoanFeeAmount).toBe(BigInt('50000000000000001'))
        expect(result.sellAmountToSign).toBe(BigInt('99950000000000000000'))
      })

      test('should handle maximum uint256-like amounts', () => {
        // Test with very large numbers (close to max supply of common tokens)
        const sellAmount = BigInt('1000000000000000000000000') // 1 million tokens with 18 decimals
        const flashLoanFeeBps = 10 // 0.1%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 1000000000000000000000000 * 10 / 10000 = 1000000000000000000000 (exact)
        expect(result.flashLoanFeeAmount).toBe(BigInt('1000000000000000000000'))
        expect(result.sellAmountToSign).toBe(BigInt('999000000000000000000000'))
      })

      test('should round up with fractional percentage that creates remainder', () => {
        // Test with percentage that guarantees a remainder
        const sellAmount = BigInt('123456789')
        const flashLoanFeeBps = 7 // 0.07%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // 123456789 * 7 / 10000 = 86419.7523, should round up to 86420
        expect(result.flashLoanFeeAmount).toBe(BigInt('86420'))
        expect(result.sellAmountToSign).toBe(BigInt('123370369'))
      })

      test('should match Aave PercentageMath.percentMul() rounding behavior', () => {
        // This test verifies we use ceil rounding (round up on any remainder)
        // Our implementation: if (remainder > 0) round up by 1

        const sellAmount = BigInt('2813982695824406449')
        const flashLoanFeeBps = 5 // 0.05%

        const result = flashLoanSdk.calculateFlashLoanAmounts({ sellAmount, flashLoanFeeBps })

        // Manual calculation:
        // bps = 0.05 * 100 = 5
        // product = 2813982695824406449 * 5 = 14069913479122032245
        // quotient = 14069913479122032245 / 10000 = 1406991347912203 (truncated)
        // remainder = 14069913479122032245 % 10000 = 2245
        // Since remainder > 0, round up: 1406991347912203 + 1 = 1406991347912204

        expect(result.flashLoanFeeAmount).toBe(BigInt('1406991347912204'))
        expect(result.sellAmountToSign).toBe(BigInt('2813982695824406449') - BigInt('1406991347912204'))
      })
    })

    describe('customEIP1271Signature', () => {
      test('should generate EIP-1271 signature with correct domain', async () => {
        const mockEcdsaSignature = '0xabcd1234567890'
        const signTypedDataSpy = jest
          .spyOn(adapter.signer, 'signTypedData')
          .mockResolvedValue(mockEcdsaSignature as any)

        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            collateralToken,
          },
          mockTradingSdk,
        )

        // Extract the customEIP1271Signature function from the call
        const swapSettingsCall = (mockPostSwapOrderFromQuote as jest.Mock).mock.calls[0][0]
        const customSignatureFn = swapSettingsCall.additionalParams.customEIP1271Signature

        expect(customSignatureFn).toBeDefined()
        expect(typeof customSignatureFn).toBe('function')

        // Call the custom signature function
        await customSignatureFn(mockOrderToSign, adapter.signer)

        // Verify signTypedData was called with correct domain
        expect(signTypedDataSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'AaveAdapterFactory',
            version: '1',
            chainId: SupportedChainId.SEPOLIA,
            verifyingContract: AAVE_ADAPTER_FACTORY[SupportedChainId.SEPOLIA],
          }),
          expect.any(Object),
          expect.any(Object),
        )
      })

      test('should include correct signature types in EIP-712 message', async () => {
        const mockEcdsaSignature = '0xabcd1234567890'
        const signTypedDataSpy = jest
          .spyOn(adapter.signer, 'signTypedData')
          .mockResolvedValue(mockEcdsaSignature as any)

        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            collateralToken,
          },
          mockTradingSdk,
        )

        const swapSettingsCall = (mockPostSwapOrderFromQuote as jest.Mock).mock.calls[0][0]
        const customSignatureFn = swapSettingsCall.additionalParams.customEIP1271Signature

        await customSignatureFn(mockOrderToSign, adapter.signer)

        // Verify signature types are correct
        expect(signTypedDataSpy).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            AdapterOrderSig: expect.arrayContaining([
              { name: 'instance', type: 'address' },
              { name: 'sellToken', type: 'address' },
              { name: 'buyToken', type: 'address' },
              { name: 'sellAmount', type: 'uint256' },
              { name: 'buyAmount', type: 'uint256' },
              { name: 'kind', type: 'bytes32' },
              { name: 'validTo', type: 'uint32' },
              { name: 'appData', type: 'bytes32' },
            ]),
          }),
          expect.any(Object),
        )
      })

      test('should sign message with correct order parameters', async () => {
        const mockEcdsaSignature = '0xabcd1234567890'
        const signTypedDataSpy = jest
          .spyOn(adapter.signer, 'signTypedData')
          .mockResolvedValue(mockEcdsaSignature as any)

        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            collateralToken,
          },
          mockTradingSdk,
        )

        const swapSettingsCall = (mockPostSwapOrderFromQuote as jest.Mock).mock.calls[0][0]
        const customSignatureFn = swapSettingsCall.additionalParams.customEIP1271Signature

        await customSignatureFn(mockOrderToSign, adapter.signer)

        // Verify the message contains the expected instance address and order details
        expect(signTypedDataSpy).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(Object),
          expect.objectContaining({
            instance: expect.any(String), // instanceAddress
            sellToken: mockOrderToSign.sellToken,
            buyToken: mockOrderToSign.buyToken,
            sellAmount: mockOrderToSign.sellAmount,
            buyAmount: mockOrderToSign.buyAmount,
            kind: expect.any(String), // kind is encoded as bytes32 hash
            validTo: mockOrderToSign.validTo,
            appData: mockOrderToSign.appData,
          }),
        )
      })

      test('should return EIP-1271 formatted signature', async () => {
        const mockEcdsaSignature =
          '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd123456789012'
        jest.spyOn(adapter.signer, 'signTypedData').mockResolvedValue(mockEcdsaSignature as any)

        await flashLoanSdk.collateralSwap(
          {
            chainId: SupportedChainId.SEPOLIA,
            tradeParameters: mockTradeParameters,
            collateralToken,
          },
          mockTradingSdk,
        )

        const swapSettingsCall = (mockPostSwapOrderFromQuote as jest.Mock).mock.calls[0][0]
        const customSignatureFn = swapSettingsCall.additionalParams.customEIP1271Signature

        const signature = await customSignatureFn(mockOrderToSign, adapter.signer)

        // Signature should be formatted as EIP-1271 signature (owner + ECDSA signature)
        expect(signature).toBeDefined()
        expect(typeof signature).toBe('string')
        expect(signature).toContain('0x')
      })
    })
  })
})
