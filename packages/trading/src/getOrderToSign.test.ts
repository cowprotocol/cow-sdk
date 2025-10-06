import { getOrderToSign } from './getOrderToSign'
import { LimitOrderParameters } from './types'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { DEFAULT_QUOTE_VALIDITY } from './consts'

const currentTimestamp = 1487076708000

const params: any = { from: '0x6810e776880c02933d47db1b9fc05908e5386b96' }

const defaultOrderParams: LimitOrderParameters = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  signer: '0x006',
  appCode: '0x007',
  sellToken: '0xA0b86a33E6441c8C35a7ba3b7a6C03E2a3Ad32e7', // COW token
  sellTokenDecimals: 18,
  buyToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  buyTokenDecimals: 18,
  sellAmount: '1000000000000000000',
  buyAmount: '2000000000000000000',
  kind: OrderKind.SELL,
  quoteId: 31,
  slippageBps: 50,
}

const appDataKeccak256 = '0x00355666666'

describe('getOrderToSign', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => currentTimestamp)
  })
  it('When receiver is not set, then should use "from" parameter instead', () => {
    const result = getOrderToSign(params, { ...defaultOrderParams, receiver: undefined }, appDataKeccak256)

    expect(result.receiver).toBe('0x6810e776880c02933d47db1b9fc05908e5386b96')
  })

  it('When validTo is not set, then should use "validFor" parameter instead', () => {
    const result = getOrderToSign(
      params,
      { ...defaultOrderParams, validTo: undefined, validFor: 600 },
      appDataKeccak256,
    )

    expect(result.validTo).toBe(currentTimestamp / 1000 + 600)
  })

  it('When both validTo and validFor are not set, then should use default value', () => {
    const result = getOrderToSign(
      params,
      { ...defaultOrderParams, validTo: undefined, validFor: undefined },
      appDataKeccak256,
    )

    expect(result.validTo).toBe(currentTimestamp / 1000 + DEFAULT_QUOTE_VALIDITY)
  })

  it('When sell order, then buy amount should be adjusted to slippage', () => {
    const result = getOrderToSign(params, { ...defaultOrderParams, kind: OrderKind.SELL }, appDataKeccak256)

    expect(result.buyAmount).toBe('1990000000000000000')
  })

  it('When buy order, then sell amount should be adjusted to slippage', () => {
    const result = getOrderToSign(params, { ...defaultOrderParams, kind: OrderKind.BUY }, appDataKeccak256)

    expect(result.sellAmount).toBe('1005000000000000000')
  })
})
