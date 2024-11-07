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

import { getOrderToSign } from './getOrderToSign'
import { LimitOrderParameters } from './types'
import { SupportedChainId } from '../common'
import { OrderKind } from '../order-book'
import { DEFAULT_QUOTE_VALIDITY } from './consts'

const currentTimestamp = 1487076708000

const params = { from: '0xaaa444' }

const defaultOrderParams: LimitOrderParameters = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  signer: '0x006',
  appCode: '0x007',
  sellToken: '0xaaa',
  sellTokenDecimals: 18,
  buyToken: '0xbbb',
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

    expect(result.receiver).toBe('0xaaa444')
  })

  it('When validTo is not set, then should use "validFor" parameter instead', () => {
    const result = getOrderToSign(
      params,
      { ...defaultOrderParams, validTo: undefined, validFor: 600 },
      appDataKeccak256
    )

    expect(result.validTo).toBe(currentTimestamp / 1000 + 600)
  })

  it('When both validTo and validFor are not set, then should use default value', () => {
    const result = getOrderToSign(
      params,
      { ...defaultOrderParams, validTo: undefined, validFor: undefined },
      appDataKeccak256
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
