/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { OrderKind } from '@cowprotocol/contracts'
import { enableFetchMocks } from 'jest-fetch-mock'
import ZeroXError from '.'
import { SupportedChainId } from '../../../constants/chains'
import CowSdk from '../../../CowSdk'
import { PriceQuoteParams } from '../../cow/types'

enableFetchMocks()

const chainId = SupportedChainId.MAINNET

const cowSdk = new CowSdk(chainId, {}, { loglevel: 'debug', zeroXOptions: { enabled: true } })

const query = {
  baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  amount: '1234567890',
  kind: OrderKind.BUY,
} as PriceQuoteParams

describe('0x Error handling', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  test('Handles INSUFFICIENT_ASSET_LIQUIDITY', async () => {
    // GIVEN a 400 server response with an error code 100: Validation Failed
    fetchMock.mockResponse(
      JSON.stringify({
        code: 100,
        reason: 'Validation Failed',
        validationErrors: [
          {
            field: 'sellAmount',
            code: 1004,
            reason: 'INSUFFICIENT_ASSET_LIQUIDITY',
          },
        ],
      }),
      { status: 400 }
    )

    // we write this OUTSIDE the try/catch block
    // to protect against the catch silently failing and the test falsely passing
    // we expect the correct amount of test assertions (expect calls)
    expect.assertions(2)

    try {
      // WHEN
      await cowSdk.zeroXApi!.getQuote(query)
    } catch (error) {
      const e = error instanceof ZeroXError ? error : undefined
      // THEN expect the error to be properly constructed
      expect(e).toBeInstanceOf(ZeroXError)
      expect(e).toEqual(
        new ZeroXError({
          code: 100,
          reason: 'Validation Failed',
          validationErrors: [
            {
              field: 'sellAmount',
              code: 1004,
              reason: 'INSUFFICIENT_ASSET_LIQUIDITY',
            },
          ],
        })
      )
    }
  })

  test('Handles a 404 response', async () => {
    // GIVEN response is 404
    fetchMock.mockResponse(JSON.stringify({}), { status: 404 })

    // we expect the correct amount of test assertions (expect calls)
    expect.assertions(2)

    try {
      // WHEN request is made
      await cowSdk.zeroXApi!.getQuote(query)
    } catch (error) {
      const e = error instanceof ZeroXError ? error : undefined
      // THEN expect the e to be properly constructed
      expect(e).toBeInstanceOf(ZeroXError)
      expect(e).toEqual(new ZeroXError({ code: 404, reason: 'Not found' }))
    }
  })
  test('Invalid: Get Price Quote - 429', async () => {
    // GIVEN response is 429
    fetchMock.mockResponse(JSON.stringify({}), { status: 429 })

    // we expect the correct amount of test assertions (expect calls)
    expect.assertions(2)

    try {
      // WHEN request is made
      await cowSdk.zeroXApi!.getQuote(query)
    } catch (error) {
      const e = error instanceof ZeroXError ? error : undefined
      // THEN expect the e to be properly constructed
      expect(e).toBeInstanceOf(ZeroXError)
      expect(e).toEqual(new ZeroXError({ code: 429, reason: 'Too many requests - Rate limit exceeded' }))
    }
  })
  test('Invalid: Get Price Quote - 500', async () => {
    // GIVEN response is 500
    fetchMock.mockResponse(JSON.stringify({}), { status: 500 })

    // we expect the correct amount of test assertions (expect calls)
    expect.assertions(2)

    try {
      // WHEN request is made
      await cowSdk.zeroXApi!.getQuote(query)
    } catch (error) {
      const e = error instanceof ZeroXError ? error : undefined
      // THEN expect the e to be properly constructed
      expect(e).toBeInstanceOf(ZeroXError)
      expect(e).toEqual(new ZeroXError({ code: 500, reason: 'Internal server error' }))
    }
  })
  test('Invalid: Get Price Quote - 501', async () => {
    // GIVEN response is 501
    fetchMock.mockResponse(JSON.stringify({}), { status: 501 })

    // we expect the correct amount of test assertions (expect calls)
    expect.assertions(2)

    try {
      // WHEN request is made
      await cowSdk.zeroXApi!.getQuote(query)
    } catch (error) {
      const e = error instanceof ZeroXError ? error : undefined
      // THEN expect the e to be properly constructed
      expect(e).toBeInstanceOf(ZeroXError)
      expect(e).toEqual(new ZeroXError({ code: 501, reason: 'Not Implemented' }))
    }
  })
  test('Invalid: Get Price Quote - 503', async () => {
    // GIVEN response is 503
    fetchMock.mockResponse(JSON.stringify({}), { status: 503 })

    // we expect the correct amount of test assertions (expect calls)
    expect.assertions(2)

    try {
      // WHEN request is made
      await cowSdk.zeroXApi!.getQuote(query)
    } catch (error) {
      const e = error instanceof ZeroXError ? error : undefined
      // THEN expect the e to be properly constructed
      expect(e).toBeInstanceOf(ZeroXError)
      expect(e).toEqual(new ZeroXError({ code: 503, reason: 'Server Error - Too many open connections' }))
    }
  })
  test('Invalid: Get Price Quote - unknown', async () => {
    // GIVEN response is unknown
    fetchMock.mockResponse(JSON.stringify({}), { status: 999 })

    // we expect the correct amount of test assertions (expect calls)
    expect.assertions(2)

    try {
      // WHEN request is made
      await cowSdk.zeroXApi!.getQuote(query)
    } catch (error) {
      const e = error instanceof ZeroXError ? error : undefined
      // THEN expect the e to be properly constructed
      expect(e).toBeInstanceOf(ZeroXError)
      expect(e).toEqual(new ZeroXError({ code: 999, reason: 'Error fetching quote' }))
    }
  })
})
