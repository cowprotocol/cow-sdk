import { getEthFlowCancellation, getSettlementCancellation } from './onChainCancellation'
import {
  EnrichedOrder,
  OrderKind,
  SellTokenSource,
  BuyTokenDestination,
  SigningScheme,
  OrderStatus,
  OrderClass,
} from '@cowprotocol/sdk-order-book'
import { EthFlowContract, SettlementContract } from '@cowprotocol/sdk-common'

// Mock order data
const mockEnrichedOrder: EnrichedOrder = {
  uid: '0xd64389693b6cf89ad6c140a113b10df08073e5ef3063d05a02f3f42e1a42f0ad0b7795e18767259cc253a2af471dbc4c72b49516ffffffff',
  owner: '0x21c3de23d98caddc406e3d31b25e807addf33333',
  buyToken: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
  sellToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  receiver: '0x21c3de23d98caddc406e3d31b25e807addf33333',
  sellAmount: '1000000000000000000',
  buyAmount: '500000000000000000',
  validTo: 1234567890,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  feeAmount: '10000000000000000',
  kind: OrderKind.SELL,
  partiallyFillable: false,
  sellTokenBalance: SellTokenSource.ERC20,
  buyTokenBalance: BuyTokenDestination.ERC20,
  signingScheme: SigningScheme.EIP712,
  signature: '0x',
  creationDate: '2023-01-01T00:00:00.000Z',
  status: OrderStatus.OPEN,
  class: OrderClass.MARKET,
  totalFee: '10000000000000000',
  executedSellAmount: '0',
  executedSellAmountBeforeFees: '0',
  executedBuyAmount: '0',
  executedFeeAmount: '0',
  invalidated: false,
}

const ESTIMATED_GAS = BigInt(125000)
const FALLBACK_GAS = BigInt(150000)
const ENCODED_DATA = '0x0abcdef1234567890'

describe('onChainCancellation', () => {
  describe('getEthFlowCancellation', () => {
    it('should return cancellation with estimated gas when estimation succeeds', async () => {
      const mockEthFlowContract = {
        address: '0xethflow123456789',
        estimateGas: {
          invalidateOrder: jest.fn().mockResolvedValue({
            toHexString: () => '0x1e848',
          }),
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue(ENCODED_DATA),
        },
      } as unknown as EthFlowContract

      const result = await getEthFlowCancellation(mockEthFlowContract, mockEnrichedOrder)

      expect(result.estimatedGas).toBe(ESTIMATED_GAS)
      expect(result.transaction).toEqual({
        data: ENCODED_DATA,
        gasLimit: '0x1e848',
        to: mockEthFlowContract.address,
        value: '0x0',
      })

      expect(mockEthFlowContract.estimateGas.invalidateOrder).toHaveBeenCalledWith({
        buyToken: mockEnrichedOrder.buyToken,
        receiver: mockEnrichedOrder.receiver,
        sellAmount: mockEnrichedOrder.sellAmount,
        buyAmount: mockEnrichedOrder.buyAmount,
        appData: mockEnrichedOrder.appData.toString(),
        feeAmount: mockEnrichedOrder.feeAmount,
        validTo: mockEnrichedOrder.validTo.toString(),
        partiallyFillable: false,
        quoteId: 0,
      })
    })

    it('should use owner as receiver when receiver is not set', async () => {
      const orderWithoutReceiver = {
        ...mockEnrichedOrder,
        receiver: undefined,
      }

      const mockEthFlowContract = {
        address: '0xethflow123456789',
        estimateGas: {
          invalidateOrder: jest.fn().mockResolvedValue({
            toHexString: () => '0x1e848',
          }),
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue(ENCODED_DATA),
        },
      } as unknown as EthFlowContract

      await getEthFlowCancellation(mockEthFlowContract, orderWithoutReceiver)

      expect(mockEthFlowContract.estimateGas.invalidateOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          receiver: mockEnrichedOrder.owner,
        }),
      )
    })

    it('should return fallback gas when estimation fails', async () => {
      const mockEthFlowContract = {
        address: '0xethflow123456789',
        estimateGas: {
          invalidateOrder: jest.fn().mockRejectedValue(new Error('Gas estimation failed')),
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue(ENCODED_DATA),
        },
      } as unknown as EthFlowContract

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getEthFlowCancellation(mockEthFlowContract, mockEnrichedOrder)

      expect(result.estimatedGas).toBe(FALLBACK_GAS)
      expect(result.transaction.gasLimit).toBe('0x249f0') // 150000 in hex
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should handle gas estimation without toHexString method', async () => {
      const mockEthFlowContract = {
        address: '0xethflow123456789',
        estimateGas: {
          invalidateOrder: jest.fn().mockResolvedValue(125000),
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue(ENCODED_DATA),
        },
      } as unknown as EthFlowContract

      const result = await getEthFlowCancellation(mockEthFlowContract, mockEnrichedOrder)

      expect(result.estimatedGas).toBe(ESTIMATED_GAS)
    })
  })

  describe('getSettlementCancellation', () => {
    it('should return cancellation with estimated gas when estimation succeeds', async () => {
      const mockSettlementContract = {
        address: '0xsettlement123456789',
        estimateGas: {
          invalidateOrder: jest.fn().mockResolvedValue({
            toHexString: () => '0x1e848',
          }),
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue(ENCODED_DATA),
        },
      } as unknown as SettlementContract

      const result = await getSettlementCancellation(mockSettlementContract, mockEnrichedOrder)

      expect(result.estimatedGas).toBe(ESTIMATED_GAS)
      expect(result.transaction).toEqual({
        data: ENCODED_DATA,
        gasLimit: '0x1e848',
        to: mockSettlementContract.address,
        value: '0x0',
      })

      expect(mockSettlementContract.estimateGas.invalidateOrder).toHaveBeenCalledWith(mockEnrichedOrder.uid)
    })

    it('should return fallback gas when estimation fails', async () => {
      const mockSettlementContract = {
        address: '0xsettlement123456789',
        estimateGas: {
          invalidateOrder: jest.fn().mockRejectedValue(new Error('Gas estimation failed')),
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue(ENCODED_DATA),
        },
      } as unknown as SettlementContract

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await getSettlementCancellation(mockSettlementContract, mockEnrichedOrder)

      expect(result.estimatedGas).toBe(FALLBACK_GAS)
      expect(result.transaction.gasLimit).toBe('0x249f0') // 150000 in hex
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should handle gas estimation without toHexString method', async () => {
      const mockSettlementContract = {
        address: '0xsettlement123456789',
        estimateGas: {
          invalidateOrder: jest.fn().mockResolvedValue(125000),
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue(ENCODED_DATA),
        },
      } as unknown as SettlementContract

      const result = await getSettlementCancellation(mockSettlementContract, mockEnrichedOrder)

      expect(result.estimatedGas).toBe(ESTIMATED_GAS)
    })

    it('should encode function data with order uid', async () => {
      const mockSettlementContract = {
        address: '0xsettlement123456789',
        estimateGas: {
          invalidateOrder: jest.fn().mockResolvedValue({
            toHexString: () => '0x1e848',
          }),
        },
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue(ENCODED_DATA),
        },
      } as unknown as SettlementContract

      await getSettlementCancellation(mockSettlementContract, mockEnrichedOrder)

      expect(mockSettlementContract.interface.encodeFunctionData).toHaveBeenCalledWith('invalidateOrder', [
        mockEnrichedOrder.uid,
      ])
    })
  })
})
