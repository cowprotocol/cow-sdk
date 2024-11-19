import { EthFlow__factory } from '../common/generated'

jest.mock('cross-fetch', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetchMock = require('jest-fetch-mock')
  // Require the original module to not be mocked...
  const originalFetch = jest.requireActual('cross-fetch')
  return {
    __esModule: true,
    ...originalFetch,
    default: fetchMock,
  }
})

jest.mock('../common/generated', () => {
  const original = jest.requireActual('../common/generated')

  return {
    ...original,
    EthFlow__factory: {
      connect: jest.fn(),
    },
  }
})

import { VoidSigner } from '@ethersproject/abstract-signer'
import { AppDataInfo, LimitOrderParameters } from './types'
import { SupportedChainId } from '../common'
import { OrderBookApi, OrderKind } from '../order-book'
import { postOnChainTrade } from './postOnChainTrade'

const defaultOrderParams: LimitOrderParameters = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  signer: '1bb337bafb276f779c3035874b8914e4b851bb989dbb34e776397076576f3804',
  appCode: '0x007',
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
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

const account = '0x21c3de23d98caddc406e3d31b25e807addf33333'
const signer = new VoidSigner(account)
signer.getChainId = jest.fn().mockResolvedValue(SupportedChainId.GNOSIS_CHAIN)

const currentTimestamp = 1487076708000

const uploadAppDataMock = jest.fn()
const orderBookApiMock = { uploadAppData: uploadAppDataMock } as unknown as OrderBookApi
const appDataMock = {
  appDataKeccak256: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
  fullAppData:
    '{\\"appCode\\":\\"CoW Swap\\",\\"environment\\":\\"barn\\",\\"metadata\\":{\\"orderClass\\":{\\"orderClass\\":\\"market\\"},\\"quote\\":{\\"slippageBips\\":201,\\"smartSlippage\\":true}},\\"version\\":\\"1.3.0\\"}',
} as unknown as AppDataInfo

let ethFlowContractFactoryMock: jest.SpyInstance
const ethFlowContractMock = {
  estimateGas: {
    createOrder: jest.fn(),
  },
  createOrder: jest.fn(),
}

describe('postOnChainTrade', () => {
  beforeAll(() => {
    ethFlowContractFactoryMock = EthFlow__factory.connect as unknown as jest.SpyInstance
  })

  beforeEach(() => {
    ethFlowContractFactoryMock.mockReturnValue(ethFlowContractMock)
    uploadAppDataMock.mockResolvedValue(undefined)
    ethFlowContractMock.estimateGas.createOrder.mockResolvedValue({ toHexString: () => '0x1' })
    ethFlowContractMock.createOrder.mockResolvedValue({ hash: '0x000cc' })

    Date.now = jest.fn(() => currentTimestamp)
  })

  afterEach(() => {
    uploadAppDataMock.mockReset()
    ethFlowContractFactoryMock.mockReset()
    ethFlowContractMock.estimateGas.createOrder.mockReset()
    ethFlowContractMock.createOrder.mockReset()
  })

  it('Should call checkEthFlowOrderExists if it is set', async () => {
    const checkEthFlowOrderExists = jest.fn().mockResolvedValue(false)

    await postOnChainTrade(orderBookApiMock, signer, appDataMock, defaultOrderParams, '0', checkEthFlowOrderExists)

    expect(checkEthFlowOrderExists).toHaveBeenCalledTimes(1)
  })

  it('Should upload appData', async () => {
    await postOnChainTrade(orderBookApiMock, signer, appDataMock, defaultOrderParams)

    expect(uploadAppDataMock).toHaveBeenCalledWith(appDataMock.appDataKeccak256, appDataMock.fullAppData)
  })

  it('When transaction gas estimation is failed, then should use fallback value + 20%', async () => {
    ethFlowContractMock.estimateGas.createOrder.mockRejectedValue(new Error('Estimation failed'))

    await postOnChainTrade(orderBookApiMock, signer, appDataMock, defaultOrderParams)

    const call = ethFlowContractMock.createOrder.mock.calls[0][1]

    expect(call.gasLimit).toBe(BigInt(180000)) // 150000 by default + 20%
  })

  it('Should create an on-chain transaction with all specified parameters', async () => {
    await postOnChainTrade(orderBookApiMock, signer, appDataMock, defaultOrderParams)

    expect(ethFlowContractMock.createOrder).toHaveBeenCalledTimes(1)
    expect(ethFlowContractMock.createOrder).toHaveBeenCalledWith(
      {
        appData: appDataMock.appDataKeccak256,
        sellToken: defaultOrderParams.sellToken,
        sellAmount: defaultOrderParams.sellAmount,
        sellTokenBalance: 'erc20',
        buyAmount: '1990000000000000000', // defaultOrderParams.buyAmount - slippage
        buyToken: defaultOrderParams.buyToken,
        buyTokenBalance: 'erc20',
        feeAmount: '0',
        partiallyFillable: false,
        kind: defaultOrderParams.kind,
        quoteId: defaultOrderParams.quoteId,
        receiver: account,
        validTo: defaultOrderParams.validTo!.toString(),
      },
      { value: defaultOrderParams.sellAmount, gasLimit: BigInt(1) }
    )
  })
})
