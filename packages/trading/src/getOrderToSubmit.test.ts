import { getOrderToSubmit } from './getOrderToSubmit'
import {
  BuyTokenDestination,
  OrderKind,
  OrderQuoteResponse,
  SellTokenSource,
  SigningScheme,
} from '@cowprotocol/sdk-order-book'
import { UnsignedOrder } from '@cowprotocol/sdk-order-signing'
import { ETH_ADDRESS } from '@cowprotocol/sdk-config'
import { TradeParameters, TradingAppDataInfo } from './types'

const owner = '0x21c3de23d98caddc406e3d31b25e807addf33633'

const orderToSign: UnsignedOrder = {
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  sellAmount: '1000000000000000000',
  buyAmount: '1990000000000000000',
  validTo: 1487078508,
  kind: OrderKind.SELL,
  partiallyFillable: false,
  appData: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
  receiver: owner,
  feeAmount: '0',
  sellTokenBalance: SellTokenSource.ERC20,
  buyTokenBalance: BuyTokenDestination.ERC20,
}

const appDataInfo: TradingAppDataInfo = {
  doc: {} as TradingAppDataInfo['doc'],
  fullAppData:
    '{"appCode":"CoW Swap","metadata":{"orderClass":{"orderClass":"market"},"quote":{"slippageBips":50}},"version":"1.3.0"}',
  appDataKeccak256: '0xaf1908d8e30f63bf4a6dbd41d2191eb092ac0af626b37c720596426130717658',
}

const tradeParameters: TradeParameters = {
  kind: OrderKind.SELL,
  owner,
  sellToken: orderToSign.sellToken,
  sellTokenDecimals: 18,
  buyToken: orderToSign.buyToken,
  buyTokenDecimals: 18,
  amount: '1000000000000000000',
}

const quoteResponse = { id: 31 } as OrderQuoteResponse

const defaultQuoteResults = { orderToSign, appDataInfo, quoteResponse, tradeParameters }

describe('getOrderToSubmit', () => {
  it('should return the orderToSign struct verbatim, without rebuilding it', () => {
    const result = getOrderToSubmit(defaultQuoteResults)

    // The external signature covers exactly the quote-time struct,
    // any recomputed field (e.g. validTo) would invalidate it
    const { appData: _appData, ...signedFields } = orderToSign
    expect(result).toEqual(expect.objectContaining(signedFields))
    expect(result.validTo).toBe(orderToSign.validTo)
  })

  it('should send the full app-data document and its hash separately', () => {
    const result = getOrderToSubmit(defaultQuoteResults)

    expect(result.appData).toBe(appDataInfo.fullAppData)
    expect(result.appDataHash).toBe(appDataInfo.appDataKeccak256)
  })

  it('should use the quote owner as "from"', () => {
    const result = getOrderToSubmit(defaultQuoteResults)

    expect(result.from).toBe(owner)
  })

  it('should default to the EIP712 signing scheme', () => {
    const result = getOrderToSubmit(defaultQuoteResults)

    expect(result.signingScheme).toBe(SigningScheme.EIP712)
  })

  it('should use the provided signing scheme', () => {
    const result = getOrderToSubmit(defaultQuoteResults, SigningScheme.ETHSIGN)

    expect(result.signingScheme).toBe(SigningScheme.ETHSIGN)
  })

  it('should throw for the PRESIGN scheme (on-chain flow)', () => {
    expect(() => getOrderToSubmit(defaultQuoteResults, SigningScheme.PRESIGN)).toThrow(/PRESIGN/)
  })

  it('should throw for the EIP1271 scheme (not yet supported)', () => {
    expect(() => getOrderToSubmit(defaultQuoteResults, SigningScheme.EIP1271)).toThrow(/EIP-1271/)
  })

  it('should pass the quoteId through', () => {
    const result = getOrderToSubmit(defaultQuoteResults)

    expect(result.quoteId).toBe(31)
  })

  it('should set quoteId to null when the quote response has no id', () => {
    const result = getOrderToSubmit({ ...defaultQuoteResults, quoteResponse: {} as OrderQuoteResponse })

    expect(result.quoteId).toBe(null)
  })

  it('should throw when the quote is not bound to an owner', () => {
    const { owner: _owner, ...tradeParametersWithoutOwner } = tradeParameters

    expect(() =>
      getOrderToSubmit({ ...defaultQuoteResults, tradeParameters: tradeParametersWithoutOwner }),
    ).toThrow(/owner/)
  })

  it('should throw for orders selling the native token', () => {
    const ethFlowTradeParameters = { ...tradeParameters, sellToken: ETH_ADDRESS }

    expect(() => getOrderToSubmit({ ...defaultQuoteResults, tradeParameters: ethFlowTradeParameters })).toThrow(
      /native token/,
    )
  })
})
