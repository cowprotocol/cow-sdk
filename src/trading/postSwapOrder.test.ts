import { getQuoteWithSigner } from './getQuote'

import { postSwapOrderFromQuote } from './postSwapOrder'
import { SwapParameters } from './types'
import { OrderKind } from '../order-book'
import { parseUnits } from 'ethers/lib/utils'
import { SupportedChainId } from '../chains'

const WETH_ADDRESS = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
const COW_ADDRESS = '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59'

const SELL_ORDER_QUOTE_MOCK = {
  quote: {
    sellToken: WETH_ADDRESS.toLowerCase(),
    buyToken: COW_ADDRESS.toLowerCase(),
    receiver: '0xc8c753ee51e8fc80e199ab297fb575634a1ac1d3',
    sellAmount: '98646335338956442',
    buyAmount: '39562052700191266415',
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

const SELL_ORDER_PARAMS: SwapParameters = {
  chainId: SupportedChainId.SEPOLIA,
  appCode: 'test',
  signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
  kind: OrderKind.SELL,
  amount: parseUnits('0.1', 18).toString(), // 0.1 WETH
  sellToken: WETH_ADDRESS,
  sellTokenDecimals: 18,
  buyToken: COW_ADDRESS,
  buyTokenDecimals: 18,
  slippageBps: 50,
}

describe('postSwapOrder', () => {
  it('Sell order amounts should take fees and slippage into account', async () => {
    const orderBookApi = {
      context: {
        chainId: SELL_ORDER_PARAMS.chainId,
      },
      getQuote: jest.fn().mockResolvedValue(SELL_ORDER_QUOTE_MOCK),
      sendOrder: jest.fn().mockResolvedValue('0x01'),
    }

    const orderId = await postSwapOrderFromQuote(
      await getQuoteWithSigner(SELL_ORDER_PARAMS, undefined, orderBookApi as any)
    )

    const call = orderBookApi.sendOrder.mock.calls[0][0]

    expect(orderId).toEqual('0x01')
    // quoteResponseMock.sellAmount + quoteResponseMock.feeAmount
    // 98646335338956442 + 1353664661043558 = 100000000000000000
    expect(call.sellAmount).toBe('100000000000000000')
    // quoteResponseMock.buyAmount - 0.5%
    // BigInt('39562052700191266415') - ((BigInt('39562052700191266415') * BigInt(50)) / 10000n) = 39364242436690310083
    expect(call.buyAmount).toBe('39364242436690310083')
  })

  it('Buy order amounts should take fees and slippage into account', async () => {
    const parameters: SwapParameters = {
      chainId: SupportedChainId.SEPOLIA,
      appCode: 'test',
      signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
      kind: OrderKind.BUY,
      amount: parseUnits('400', 18).toString(), // 400 COW
      sellToken: WETH_ADDRESS,
      sellTokenDecimals: 18,
      buyToken: COW_ADDRESS,
      buyTokenDecimals: 18,
      slippageBps: 50,
    }

    const quoteResponseMock = {
      quote: {
        sellToken: WETH_ADDRESS.toLowerCase(),
        buyToken: COW_ADDRESS.toLowerCase(),
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

    const orderBookApi = {
      context: {
        chainId: parameters.chainId,
      },
      getQuote: jest.fn().mockResolvedValue(quoteResponseMock),
      sendOrder: jest.fn().mockResolvedValue('0x01'),
    }

    const orderId = await postSwapOrderFromQuote(await getQuoteWithSigner(parameters, undefined, orderBookApi as any))

    const call = orderBookApi.sendOrder.mock.calls[0][0]

    expect(orderId).toEqual('0x01')
    // sellAmountAfterNetworkCosts = quoteResponseMock.sellAmount + quoteResponseMock.feeAmount
    // sellAmountAfterNetworkCosts = BigInt('1005456782512030400') + BigInt('1112955650440102') = 1006569738162470502n

    // sellAmountAfterNetworkCosts + 0.5%
    // 1006569738162470502n + ((1006569738162470502n * BigInt(50)) / 10000n) = 1011602586853282854n
    expect(call.sellAmount).toBe('1011602586853282854')
    // quoteResponseMock.buyAmount
    expect(call.buyAmount).toBe('400000000000000000000')
  })

  it('When partner fee is specified, then it must be reflected in appData', async () => {
    const orderBookApi = {
      context: {
        chainId: SELL_ORDER_PARAMS.chainId,
      },
      getQuote: jest.fn().mockResolvedValue(SELL_ORDER_QUOTE_MOCK),
      sendOrder: jest.fn().mockResolvedValue('0x01'),
    }

    const orderParams = {
      ...SELL_ORDER_PARAMS,
      partnerFee: {
        bps: 50,
        recipient: '0x444cc',
      },
    }

    await postSwapOrderFromQuote(await getQuoteWithSigner(orderParams, undefined, orderBookApi as any))

    const call = orderBookApi.sendOrder.mock.calls[0][0]

    expect(JSON.parse(call.appData).metadata.partnerFee).toEqual(orderParams.partnerFee)
  })
})
