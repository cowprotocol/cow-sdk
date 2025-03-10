const GAS = '0x1e848' // 125000
const mockConnect = {
  address: '0xaa1',
  estimateGas: {
    createOrder: jest.fn().mockResolvedValue({ toHexString: () => GAS }),
  },
  interface: {
    encodeFunctionData: jest.fn().mockReturnValue('0x0ac'),
  },
}

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
      connect: jest.fn().mockImplementation(() => mockConnect),
    },
  }
})

import { getEthFlowTransaction } from './getEthFlowTransaction'
import { VoidSigner } from '@ethersproject/abstract-signer'
import { SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '../common'
import { LimitTradeParametersFromQuote } from './types'
import { OrderKind } from '../order-book'

const appDataKeccak256 = '0x578c975b1cfd3e24c21fb599076c4f7879c4268efd33eed3eb9efa5e30efac21'

const params: LimitTradeParametersFromQuote = {
  kind: OrderKind.SELL,
  sellToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  buyToken: '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab',
  sellAmount: '12000000000000000',
  buyAmount: '36520032402342342322',
  quoteId: 3,
  sellTokenDecimals: 18,
  buyTokenDecimals: 18,
}

describe('getEthFlowTransaction', () => {
  const chainId = SupportedChainId.GNOSIS_CHAIN
  const account = '0x21c3de23d98caddc406e3d31b25e807addf33333'
  const signer = new VoidSigner(account)

  signer.getChainId = jest.fn().mockResolvedValue(chainId)
  signer.getAddress = jest.fn().mockResolvedValue(account)

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Should always override sell token with wrapped native token', async () => {
    const result = await getEthFlowTransaction(signer, appDataKeccak256, params, chainId)
    const wrappedToken = WRAPPED_NATIVE_CURRENCIES[chainId]

    expect(result.transaction.data.includes(params.sellToken.slice(2))).toBe(false)
    expect(result.transaction.data.includes(wrappedToken.slice(2))).toBe(false)
  })

  it('Should call gas estimation and return estimated value + 20%', async () => {
    const result = await getEthFlowTransaction(signer, appDataKeccak256, params, chainId)
    const gasNum = +GAS

    expect(+result.transaction.gasLimit).toBe(gasNum + gasNum * 0.2)
  })

  it('Transaction value should be equal to sell amount', async () => {
    const result = await getEthFlowTransaction(signer, appDataKeccak256, params, chainId)

    expect(result.transaction.value).toBe('0x' + BigInt(params.sellAmount).toString(16))
  })

  it('Default slippage must be 2%', async () => {
    await getEthFlowTransaction(signer, appDataKeccak256, params, chainId)
    const orderData = mockConnect.interface.encodeFunctionData.mock.calls[0][1][0]
    const buyAmountBeforeSlippage = BigInt(params.buyAmount)
    // 2% slippage
    const buyAmountAfterSlippage = buyAmountBeforeSlippage - (buyAmountBeforeSlippage * BigInt(2)) / BigInt(100)

    expect(orderData.buyAmount).toBe(buyAmountAfterSlippage.toString())
  })
})
