import { AppDataInfo, LimitOrderParameters } from './types'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi, OrderKind } from '@cowprotocol/sdk-order-book'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getEthFlowTransaction } from './getEthFlowTransaction'
import { createAdapters } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

jest.mock('./getEthFlowTransaction', () => ({
  getEthFlowTransaction: jest.fn(),
}))

const mockedGetEthFlowTransaction = getEthFlowTransaction as jest.Mock

const defaultOrderParams: Omit<LimitOrderParameters, 'signer'> & { quoteId: number } = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  appCode: '0x007',
  sellToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  sellAmount: '1000000000000000000',
  buyAmount: '2000000000000000000',
  kind: OrderKind.SELL,
  quoteId: 31,
  slippageBps: 50,
  validTo: 520,
}

const currentTimestamp = 1487076708000

const uploadAppDataMock = jest.fn()
const orderBookApiMock = {
  uploadAppData: uploadAppDataMock,
  context: { chainId: SupportedChainId.GNOSIS_CHAIN },
} as unknown as OrderBookApi

const appDataMock = {
  appDataKeccak256: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
  fullAppData:
    '{\\"appCode\\":\\"CoW Swap\\",\\"environment\\":\\"barn\\",\\"metadata\\":{\\"orderClass\\":{\\"orderClass\\":\\"market\\"},\\"quote\\":{\\"slippageBips\\":201,\\"smartSlippage\\":true}},\\"version\\":\\"1.3.0\\"}',
} as unknown as AppDataInfo

const mockTransactionResponse = {
  hash: '0xccdd11',
  wait: jest.fn().mockResolvedValue({ status: 1 }),
}

const mockOrderToSign = {
  sellToken: defaultOrderParams.sellToken,
  buyToken: defaultOrderParams.buyToken,
  sellAmount: defaultOrderParams.sellAmount,
  buyAmount: '1990000000000000000', // com slippage aplicado
  validTo: 520,
  kind: 'sell',
  partiallyFillable: false,
  appData: appDataMock.appDataKeccak256,
  receiver: '0x76b0340e50BD9883D8B2CA5fd9f52439a9e7Cf58',
  feeAmount: '0',
  sellTokenBalance: 'erc20',
  buyTokenBalance: 'erc20',
}

describe('postSellNativeCurrencyTrade', () => {
  let adapters: Record<string, any>

  beforeAll(async () => {
    adapters = await createAdapters()
  })

  beforeEach(() => {
    jest.clearAllMocks()

    mockedGetEthFlowTransaction.mockResolvedValue({
      orderId: '0xabc123',
      transaction: {
        data: '0x123456',
        gasLimit: '0x1e848', // 125000 em hex
        to: '0xbA3cB449bD2B4ADddBc894D8697F5170800EAdeC',
        value: '0x0de0b6b3a7640000', // 1 ETH em hex
      },
      orderToSign: mockOrderToSign,
    })

    uploadAppDataMock.mockResolvedValue(undefined)
    Date.now = jest.fn(() => currentTimestamp)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Should call checkEthFlowOrderExists if it is set', async () => {
    const checkEthFlowOrderExists = jest.fn().mockResolvedValue(false)

    mockedGetEthFlowTransaction.mockImplementation(
      async (_signer, _appDataKeccak256, _params, _chainId, additionalParams) => {
        if (additionalParams?.checkEthFlowOrderExists) {
          await additionalParams.checkEthFlowOrderExists('0xmockOrderId', '0xmockDigest')
        }

        return {
          orderId: '0xabc123',
          transaction: {
            data: '0x123456',
            gasLimit: '0x1e848',
            to: '0xbA3cB449bD2B4ADddBc894D8697F5170800EAdeC',
            value: '0x0de0b6b3a7640000',
          },
          orderToSign: mockOrderToSign,
        }
      },
    )

    for (const adapterName of Object.keys(adapters)) {
      setGlobalAdapter(adapters[adapterName])

      const mockSendTransaction = jest.fn().mockResolvedValue(mockTransactionResponse)
      const originalSigner = adapters[adapterName].Signer
      adapters[adapterName].Signer = class extends originalSigner {
        constructor(signer: any) {
          super(signer)
        }
        async sendTransaction() {
          return mockSendTransaction()
        }
      }

      await postSellNativeCurrencyOrder(orderBookApiMock, adapters[adapterName], appDataMock, defaultOrderParams, {
        networkCostsAmount: '0',
        checkEthFlowOrderExists,
      })

      expect(mockedGetEthFlowTransaction).toHaveBeenCalledWith(
        expect.any(Object), // signer
        appDataMock.appDataKeccak256,
        defaultOrderParams,
        SupportedChainId.GNOSIS_CHAIN,
        {
          networkCostsAmount: '0',
          checkEthFlowOrderExists,
        },
      )

      expect(checkEthFlowOrderExists).toHaveBeenCalledTimes(1)
      expect(checkEthFlowOrderExists).toHaveBeenCalledWith('0xmockOrderId', '0xmockDigest')

      checkEthFlowOrderExists.mockReset()
      mockedGetEthFlowTransaction.mockClear()
    }
  })

  it('Should upload appData', async () => {
    for (const adapterName of Object.keys(adapters)) {
      setGlobalAdapter(adapters[adapterName])

      // Mock do sendTransaction
      const mockSendTransaction = jest.fn().mockResolvedValue(mockTransactionResponse)
      const originalSigner = adapters[adapterName].Signer
      adapters[adapterName].Signer = class extends originalSigner {
        constructor(signer: any) {
          super(signer)
        }
        async sendTransaction() {
          return mockSendTransaction()
        }
      }

      await postSellNativeCurrencyOrder(orderBookApiMock, adapters[adapterName], appDataMock, defaultOrderParams)

      expect(uploadAppDataMock).toHaveBeenCalledWith(appDataMock.appDataKeccak256, appDataMock.fullAppData)
      uploadAppDataMock.mockReset()
    }
  })

  it('When transaction gas estimation is failed, then should use fallback value + 20%', async () => {
    mockedGetEthFlowTransaction.mockResolvedValue({
      orderId: '0xabc123',
      transaction: {
        data: '0x123456',
        gasLimit: '0x2bf20', // 180000 em hex (150000 + 20%)
        to: '0xbA3cB449bD2B4ADddBc894D8697F5170800EAdeC',
        value: '0x0de0b6b3a7640000',
      },
      orderToSign: mockOrderToSign,
    })

    for (const adapterName of Object.keys(adapters)) {
      setGlobalAdapter(adapters[adapterName])

      const mockSendTransaction = jest.fn().mockResolvedValue(mockTransactionResponse)
      const originalSigner = adapters[adapterName].Signer
      adapters[adapterName].Signer = class extends originalSigner {
        constructor(signer: any) {
          super(signer)
        }
        async sendTransaction(txParams: any) {
          return mockSendTransaction(txParams)
        }
      }

      await postSellNativeCurrencyOrder(orderBookApiMock, adapters[adapterName], appDataMock, defaultOrderParams)

      const call = mockSendTransaction.mock.calls[0][0]
      expect(parseInt(call.gasLimit, 16)).toBe(180000) // 150000 + 20%

      mockSendTransaction.mockReset()
    }
  })

  it('Should create an on-chain transaction with all specified parameters', async () => {
    for (const adapterName of Object.keys(adapters)) {
      setGlobalAdapter(adapters[adapterName])

      const mockSendTransaction = jest.fn().mockResolvedValue(mockTransactionResponse)
      const originalSigner = adapters[adapterName].Signer
      adapters[adapterName].Signer = class extends originalSigner {
        constructor(signer: any) {
          super(signer)
        }
        async sendTransaction() {
          return mockSendTransaction()
        }
      }

      await postSellNativeCurrencyOrder(orderBookApiMock, adapters[adapterName], appDataMock, defaultOrderParams)

      expect(mockedGetEthFlowTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        appDataMock.appDataKeccak256,
        defaultOrderParams,
        SupportedChainId.GNOSIS_CHAIN,
        {},
      )

      expect(uploadAppDataMock).toHaveBeenCalledWith(appDataMock.appDataKeccak256, appDataMock.fullAppData)

      expect(mockSendTransaction).toHaveBeenCalledTimes(1)

      mockedGetEthFlowTransaction.mockClear()
      uploadAppDataMock.mockReset()
      mockSendTransaction.mockReset()
    }
  })
})
