import { AppDataInfo, LimitOrderParameters } from './types'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderBookApi, OrderKind } from '@cowprotocol/sdk-order-book'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getEthFlowTransaction } from './getEthFlowTransaction'
import { AdaptersTestSetup, createAdapters } from '../tests/setup'
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

// Helper mock signer.sendTransaction
interface MockedSigner {
  mockSendTransaction: jest.Mock
  restore: () => void
}

function createMockedSigner(adapter: any): MockedSigner {
  const originalSendTransaction = adapter.signer.sendTransaction.bind(adapter.signer)
  const mockSendTransaction = jest.fn().mockResolvedValue(mockTransactionResponse)

  adapter.signer.sendTransaction = mockSendTransaction

  return {
    mockSendTransaction,
    restore: () => {
      adapter.signer.sendTransaction = originalSendTransaction
    },
  }
}

describe('postSellNativeCurrencyTrade', () => {
  let adapters: AdaptersTestSetup

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
      async (_appDataKeccak256, _params, _chainId, additionalParams, _signer) => {
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

    for (const adapterName of Object.keys(adapters) as Array<keyof AdaptersTestSetup>) {
      setGlobalAdapter(adapters[adapterName])

      const mockedSigner = createMockedSigner(adapters[adapterName])

      try {
        await postSellNativeCurrencyOrder(
          orderBookApiMock,
          appDataMock,
          defaultOrderParams,
          {
            networkCostsAmount: '0',
            checkEthFlowOrderExists,
          },
          adapters[adapterName].signer,
        )

        expect(mockedGetEthFlowTransaction).toHaveBeenCalledWith(
          appDataMock.appDataKeccak256,
          defaultOrderParams,
          SupportedChainId.GNOSIS_CHAIN,
          {
            networkCostsAmount: '0',
            checkEthFlowOrderExists,
          },
          expect.any(Object), // signer
        )

        expect(checkEthFlowOrderExists).toHaveBeenCalledTimes(1)
        expect(checkEthFlowOrderExists).toHaveBeenCalledWith('0xmockOrderId', '0xmockDigest')
        expect(mockedSigner.mockSendTransaction).toHaveBeenCalledTimes(1)
      } finally {
        mockedSigner.restore()
      }

      checkEthFlowOrderExists.mockReset()
    }
  })

  it('Should upload appData', async () => {
    for (const adapterName of Object.keys(adapters) as Array<keyof AdaptersTestSetup>) {
      setGlobalAdapter(adapters[adapterName])

      const mockedSigner = createMockedSigner(adapters[adapterName])

      try {
        await postSellNativeCurrencyOrder(
          orderBookApiMock,
          appDataMock,
          defaultOrderParams,
          {},
          adapters[adapterName].signer,
        )

        expect(uploadAppDataMock).toHaveBeenCalledWith(appDataMock.appDataKeccak256, appDataMock.fullAppData)
        expect(mockedSigner.mockSendTransaction).toHaveBeenCalledTimes(1)
      } finally {
        mockedSigner.restore()
      }

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

    for (const adapterName of Object.keys(adapters) as Array<keyof AdaptersTestSetup>) {
      setGlobalAdapter(adapters[adapterName])

      const mockedSigner = createMockedSigner(adapters[adapterName])

      try {
        await postSellNativeCurrencyOrder(
          orderBookApiMock,
          appDataMock,
          defaultOrderParams,
          {},
          adapters[adapterName].signer,
        )

        expect(mockedSigner.mockSendTransaction).toHaveBeenCalledTimes(1)

        const call = mockedSigner.mockSendTransaction.mock.calls[0][0]
        expect(parseInt(call.gasLimit, 16)).toBe(180000) // 150000 + 20%
      } finally {
        mockedSigner.restore()
      }
    }
  })

  it('Should create an on-chain transaction with all specified parameters', async () => {
    for (const adapterName of Object.keys(adapters) as Array<keyof AdaptersTestSetup>) {
      setGlobalAdapter(adapters[adapterName])

      const mockedSigner = createMockedSigner(adapters[adapterName])

      try {
        await postSellNativeCurrencyOrder(
          orderBookApiMock,
          appDataMock,
          defaultOrderParams,
          {},
          adapters[adapterName].signer,
        )

        expect(mockedGetEthFlowTransaction).toHaveBeenCalledWith(
          appDataMock.appDataKeccak256,
          defaultOrderParams,
          SupportedChainId.GNOSIS_CHAIN,
          {},
          expect.any(Object),
        )

        expect(uploadAppDataMock).toHaveBeenCalledWith(appDataMock.appDataKeccak256, appDataMock.fullAppData)

        expect(mockedSigner.mockSendTransaction).toHaveBeenCalledTimes(1)

        const txParams = mockedSigner.mockSendTransaction.mock.calls[0][0]
        expect(txParams.to).toBe('0xbA3cB449bD2B4ADddBc894D8697F5170800EAdeC')
        expect(txParams.data).toBe('0x123456')
        expect(txParams.value).toBe('0x0de0b6b3a7640000')
      } finally {
        mockedSigner.restore()
      }
    }
  })
})
