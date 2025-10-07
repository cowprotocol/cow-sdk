import { TradingSdk } from './tradingSdk'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { TradeBaseParameters } from './types'
import {
  BuyTokenDestination,
  EcdsaSigningScheme,
  EnrichedOrder,
  OrderBookApi,
  OrderClass,
  OrderKind,
  OrderStatus,
  SellTokenSource,
  SigningScheme,
} from '@cowprotocol/sdk-order-book'
import { AdaptersTestSetup, createAdapters } from '../tests/setup'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import * as onChainCancellationModule from './onChainCancellation'
import * as getEthFlowTransactionModule from './getEthFlowTransaction'
import * as resolveOrderBookApiModule from './utils/resolveOrderBookApi'

const defaultOrderParams: TradeBaseParameters = {
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '100000000000000000',
  kind: OrderKind.SELL,
}

const quoteResponseMock = {
  quote: {
    sellToken: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    buyToken: '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59',
    receiver: '0xc8c753ee51e8fc80e199ab297fb575634a1ac1d3',
    sellAmount: '1005456782512030400',
    buyAmount: '400000000000000000000',
    validTo: 1737468944,
    appData:
      '{"appCode":"test","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":50}},"version":"1.3.0"}',
    appDataHash: '0xe269b09f45b1d3c98d8e4e841b99a0779fbd3b77943d069b91ddc4fd9789e27e',
    feeAmount: '1112955650440102',
    kind: 'buy',
    partiallyFillable: false,
    sellTokenBalance: 'erc20',
    buyTokenBalance: 'erc20',
    signingScheme: 'eip712',
  },
  from: '0xc8c753ee51e8fc80e199ab297fb575634a1ac1d3',
  expiration: '2025-01-21T14:07:44.176194885Z',
  id: 575498,
  verified: true,
}

const orderUid =
  '0xd64389693b6cf89ad6c140a113b10df08073e5ef3063d05a02f3f42e1a42f0ad0b7795e18767259cc253a2af471dbc4c72b49516ffffffff'

const mockOrder: EnrichedOrder = {
  uid: orderUid,
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

describe('TradingSdk', () => {
  let orderBookApi: OrderBookApi
  let adapters: AdaptersTestSetup
  let adapterNames: Array<keyof AdaptersTestSetup>

  beforeAll(() => {
    adapters = createAdapters()
    adapterNames = Object.keys(adapters) as Array<keyof AdaptersTestSetup>
  })

  describe('Logs', () => {
    beforeEach(() => {
      orderBookApi = {
        context: {
          chainId: SupportedChainId.GNOSIS_CHAIN,
        },
        getQuote: jest.fn().mockResolvedValue(quoteResponseMock),
        sendOrder: jest.fn().mockResolvedValue('0x01'),
      } as unknown as OrderBookApi
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('When logs option is set to false, then should not display logs', async () => {
      const logSpy = jest.spyOn(console, 'log')

      for (const adapterName of adapterNames) {
        const sdk = new TradingSdk(
          {
            chainId: SupportedChainId.GNOSIS_CHAIN,
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { enableLogging: false, orderBookApi },
          adapters[adapterName],
        )

        await sdk.getQuote(defaultOrderParams)

        expect(logSpy.mock.calls.length).toBe(0)
      }
    })

    it('When logs option is set to true, then should display logs', async () => {
      const logSpy = jest.spyOn(console, 'log')

      for (const adapterName of adapterNames) {
        const sdk = new TradingSdk(
          {
            chainId: SupportedChainId.GNOSIS_CHAIN,
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { enableLogging: true, orderBookApi },
          adapters[adapterName],
        )

        await sdk.getQuote(defaultOrderParams)

        expect(logSpy.mock.calls[0]?.[0]).toContain('[COW SDK]')
      }
    })
  })

  describe('getOrder', () => {
    let getOrderSpy: jest.SpyInstance

    beforeEach(() => {
      // Mock resolveOrderBookApi to return mocked orderBookApi
      getOrderSpy = jest.fn().mockResolvedValue(mockOrder)
      orderBookApi = {
        context: {
          chainId: SupportedChainId.GNOSIS_CHAIN,
        },
        getOrder: getOrderSpy,
      } as unknown as OrderBookApi

      jest.spyOn(resolveOrderBookApiModule, 'resolveOrderBookApi').mockReturnValue(orderBookApi)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should get order with chainId from trader params', async () => {
      for (const adapterName of adapterNames) {
        const sdk = new TradingSdk(
          {
            chainId: SupportedChainId.GNOSIS_CHAIN,
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { orderBookApi },
          adapters[adapterName],
        )

        const result = await sdk.getOrder({ orderUid })

        expect(result).toEqual(mockOrder)
        expect(getOrderSpy).toHaveBeenCalledWith(orderUid)
      }
    })

    it('should get order with chainId from params', async () => {
      for (const adapterName of adapterNames) {
        const sdk = new TradingSdk(
          {
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { orderBookApi },
          adapters[adapterName],
        )

        const result = await sdk.getOrder({
          orderUid,
          chainId: SupportedChainId.GNOSIS_CHAIN,
        })

        expect(result).toEqual(mockOrder)
      }
    })

    it('should throw error when chainId is missing', async () => {
      for (const adapterName of adapterNames) {
        const sdk = new TradingSdk(
          {
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { orderBookApi },
          adapters[adapterName],
        )

        await expect(sdk.getOrder({ orderUid })).rejects.toThrow('Chain ID is missing in getOrder() call')
      }
    })
  })

  describe('offChainCancelOrder', () => {
    const orderUid =
      '0xd64389693b6cf89ad6c140a113b10df08073e5ef3063d05a02f3f42e1a42f0ad0b7795e18767259cc253a2af471dbc4c72b49516ffffffff'

    const mockSignOrderCancellationsResult = {
      signature:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
      signingScheme: EcdsaSigningScheme.EIP712,
      signer: '0x21c3de23d98caddc406e3d31b25e807addf33333',
    }

    let sendSignedOrderCancellationsSpy: jest.SpyInstance

    beforeEach(() => {
      sendSignedOrderCancellationsSpy = jest.fn().mockResolvedValue(undefined)
      orderBookApi = {
        context: {
          chainId: SupportedChainId.GNOSIS_CHAIN,
        },
        sendSignedOrderCancellations: sendSignedOrderCancellationsSpy,
      } as unknown as OrderBookApi

      jest.spyOn(resolveOrderBookApiModule, 'resolveOrderBookApi').mockReturnValue(orderBookApi)
      jest.spyOn(OrderSigningUtils, 'signOrderCancellations').mockResolvedValue(mockSignOrderCancellationsResult)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should cancel order off-chain with chainId from trader params', async () => {
      for (const adapterName of adapterNames) {
        const sdk = new TradingSdk(
          {
            chainId: SupportedChainId.GNOSIS_CHAIN,
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { orderBookApi },
          adapters[adapterName],
        )

        const result = await sdk.offChainCancelOrder({ orderUid })

        expect(result).toBe(true)
        expect(sendSignedOrderCancellationsSpy).toHaveBeenCalledWith({
          ...mockSignOrderCancellationsResult,
          orderUids: [orderUid],
        })
      }
    })

    it('should cancel order off-chain with chainId from params', async () => {
      for (const adapterName of adapterNames) {
        const sdk = new TradingSdk(
          {
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { orderBookApi },
          adapters[adapterName],
        )

        const result = await sdk.offChainCancelOrder({
          orderUid,
          chainId: SupportedChainId.GNOSIS_CHAIN,
        })

        expect(result).toBe(true)
      }
    })

    it('should throw error when chainId is missing', async () => {
      for (const adapterName of adapterNames) {
        const sdk = new TradingSdk(
          {
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { orderBookApi },
          adapters[adapterName],
        )

        // The error comes from resolveOrderBookApi which is called from offChainCancelOrder
        await expect(sdk.offChainCancelOrder({ orderUid })).rejects.toThrow('Chain ID is missing')
      }
    })
  })

  describe('onChainCancelOrder', () => {
    const txHash = '0xb70173b95de968998517243cddf6d7cd77d74495e3ae79977f7312cfc3fc5d43'

    const mockEthFlowOrder: EnrichedOrder = {
      ...mockOrder,
      onchainOrderData: {
        sender: mockOrder.owner,
      },
    }

    const mockCancellationResult = {
      estimatedGas: BigInt(125000),
      transaction: {
        data: '0x00abcdef',
        gasLimit: '0x1e848',
        to: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41', // Valid address format
        value: '0x0',
      },
    }

    let mockSigner: any
    let getOrderSpy: jest.SpyInstance

    beforeEach(() => {
      // Create fresh mock signer for each test
      mockSigner = {
        getAddress: jest.fn().mockResolvedValue('0x21c3de23d98caddc406e3d31b25e807addf33333'),
        sendTransaction: jest.fn().mockResolvedValue({ hash: txHash }),
      }

      getOrderSpy = jest.fn().mockResolvedValue(mockOrder)
      orderBookApi = {
        context: {
          chainId: SupportedChainId.GNOSIS_CHAIN,
        },
        getOrder: getOrderSpy,
      } as unknown as OrderBookApi

      jest.spyOn(resolveOrderBookApiModule, 'resolveOrderBookApi').mockReturnValue(orderBookApi)
      jest.spyOn(onChainCancellationModule, 'getSettlementCancellation').mockResolvedValue(mockCancellationResult)
      jest.spyOn(onChainCancellationModule, 'getEthFlowCancellation').mockResolvedValue(mockCancellationResult)
      jest.spyOn(getEthFlowTransactionModule, 'getEthFlowContract').mockReturnValue({} as any)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      jest.clearAllMocks()
    })

    it('should cancel regular order on-chain using settlement contract', async () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]

        jest.spyOn(adapter, 'createSigner').mockReturnValue(mockSigner)

        const sdk = new TradingSdk(
          {
            chainId: SupportedChainId.GNOSIS_CHAIN,
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { orderBookApi },
          adapter,
        )

        const result = await sdk.onChainCancelOrder({ orderUid, signer: mockSigner })

        expect(result).toBe(txHash)
        expect(onChainCancellationModule.getSettlementCancellation).toHaveBeenCalled()
        expect(mockSigner.sendTransaction).toHaveBeenCalledWith(mockCancellationResult.transaction)
      }
    })

    it('should cancel ETH flow order on-chain using EthFlow contract', async () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]

        jest.spyOn(adapter, 'createSigner').mockReturnValue(mockSigner)

        getOrderSpy.mockResolvedValue(mockEthFlowOrder)

        const sdk = new TradingSdk(
          {
            chainId: SupportedChainId.GNOSIS_CHAIN,
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { orderBookApi },
          adapter,
        )

        const result = await sdk.onChainCancelOrder({ orderUid, signer: mockSigner })

        expect(result).toBe(txHash)
        expect(getOrderSpy).toHaveBeenCalledWith(orderUid)
        expect(onChainCancellationModule.getEthFlowCancellation).toHaveBeenCalled()
        expect(getEthFlowTransactionModule.getEthFlowContract).toHaveBeenCalled()
        expect(mockSigner.sendTransaction).toHaveBeenCalledWith(mockCancellationResult.transaction)
      }
    })

    it('should cancel order on-chain with chainId from params', async () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]

        jest.spyOn(adapter, 'createSigner').mockReturnValue(mockSigner)

        const sdk = new TradingSdk(
          {
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { orderBookApi },
          adapter,
        )

        const result = await sdk.onChainCancelOrder({
          orderUid,
          chainId: SupportedChainId.GNOSIS_CHAIN,
          signer: mockSigner,
        })

        expect(result).toBe(txHash)
      }
    })

    it('should throw error when chainId is missing', async () => {
      for (const adapterName of adapterNames) {
        const adapter = adapters[adapterName]

        jest.spyOn(adapter, 'createSigner').mockReturnValue(mockSigner)

        const sdk = new TradingSdk(
          {
            appCode: 'test',
            signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
          },
          { orderBookApi },
          adapter,
        )

        await expect(sdk.onChainCancelOrder({ orderUid })).rejects.toThrow('Chain ID is missing')
      }
    })
  })
})
