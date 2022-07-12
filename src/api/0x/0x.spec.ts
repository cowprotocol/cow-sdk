import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { OrderKind } from '@cowprotocol/contracts'
import { PriceQuoteParams } from '../cow/types'
import { SupportedChainId } from '../../constants/chains'
import CowSdk from '../../CowSdk'
import ZeroXError from './error'
import { ERC20BridgeSource } from './types'

enableFetchMocks()

const chainId = SupportedChainId.MAINNET

const cowSdk = new CowSdk(chainId, {}, { loglevel: 'debug' })

const HTTP_STATUS_OK = 200

const FETCH_RESPONSE_PARAMETERS = {
  body: undefined,
  headers: {
    'Content-Type': 'application/json',
  },
  method: 'GET',
}

const PRICE_QUOTE_RESPONSE = {
  chainId: 1,
  price: '0.123456789101112',
  estimatedPriceImpact: '0',
  value: '0',
  gasPrice: '42000000000',
  gas: '111000',
  estimatedGas: '111000',
  protocolFee: '0',
  minimumProtocolFee: '0',
  buyTokenAddress: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  buyAmount: '1234567890',
  sellTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  sellAmount: '123456789',
  sources: [
    {
      name: 'Uniswap',
      proportion: '0',
    },
  ],
  allowanceTarget: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
  sellTokenToEthRate: '1',
  buyTokenToEthRate: '10',
}

beforeEach(() => {
  fetchMock.resetMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

const query = {
  baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  amount: '1234567890',
  kind: OrderKind.BUY,
} as PriceQuoteParams

test('Valid: Get Price Quote with default options', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(PRICE_QUOTE_RESPONSE), { status: HTTP_STATUS_OK })
  const price = await cowSdk.zeroXApi.getQuote(query)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.0x.org/swap/v1/price?sellToken=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&buyToken=0x6810e776880c02933d47db1b9fc05908e5386b96&buyAmount=1234567890&affiliateAddress=0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
    FETCH_RESPONSE_PARAMETERS
  )
  expect(price?.value).toEqual(PRICE_QUOTE_RESPONSE.value)
  expect(price?.buyTokenAddress).toEqual(PRICE_QUOTE_RESPONSE.buyTokenAddress)
})

test('Valid: Get Price Quote with custom options', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(PRICE_QUOTE_RESPONSE), { status: HTTP_STATUS_OK })
  const cowSdk = new CowSdk(
    chainId,
    {},
    {
      matchaOptions: {
        affiliateAddressMap: {
          [SupportedChainId.MAINNET]: '0xAFFILIATE_ADDRESS_MAINNET',
        },
        excludedSources: [ERC20BridgeSource.Uniswap, ERC20BridgeSource.ACryptos, ERC20BridgeSource.CheeseSwap],
      },
    }
  )
  const price = await cowSdk.zeroXApi.getQuote(query)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.0x.org/swap/v1/price?sellToken=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&buyToken=0x6810e776880c02933d47db1b9fc05908e5386b96&buyAmount=1234567890&affiliateAddress=0xAFFILIATE_ADDRESS_MAINNET&excludedSources=Uniswap%2CACryptoS%2CCheeseSwap',
    FETCH_RESPONSE_PARAMETERS
  )
  expect(price?.value).toEqual(PRICE_QUOTE_RESPONSE.value)
  expect(price?.buyTokenAddress).toEqual(PRICE_QUOTE_RESPONSE.buyTokenAddress)
})
test('Invalid: Get Price Quote - Insufficient liquidity', async () => {
  fetchMock.mockResponseOnce(
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

  await expect(cowSdk.zeroXApi.getQuote(query)).rejects.toThrowError(ZeroXError)
})
// normally this won't happen - but just in case we get 400 with no
// standard error response body
test('Invalid: Get Price Quote - 400', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({}), { status: 400 })
  try {
    await zeroXSdk.api.getQuote({
      baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '0',
      kind: OrderKind.BUY,
    } as PriceQuoteParams)
  } catch (e) {
    const error = e as ZeroXError

    expect(error.message).toEqual(
      'Price fetch failed. This may be due to a server or network connectivity issue. Please try again later.'
    )
    expect(error.error_code).toEqual('400')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }
})
test('Invalid: Get Price Quote - 404', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({}), { status: 404 })
  try {
    await zeroXSdk.api.getQuote({
      baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '0',
      kind: OrderKind.BUY,
    } as PriceQuoteParams)
  } catch (e) {
    const error = e as ZeroXError

    expect(error.message).toEqual('Not found')
    expect(error.error_code).toEqual('404')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }
})
test('Invalid: Get Price Quote - 429', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({}), { status: 429 })
  try {
    await zeroXSdk.api.getQuote({
      baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '0',
      kind: OrderKind.BUY,
    } as PriceQuoteParams)
  } catch (e) {
    const error = e as ZeroXError

    expect(error.message).toEqual('Too many requests - Rate limit exceeded')
    expect(error.error_code).toEqual('429')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }
})
test('Invalid: Get Price Quote - 500', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 })
  try {
    await zeroXSdk.api.getQuote({
      baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '0',
      kind: OrderKind.BUY,
    } as PriceQuoteParams)
  } catch (e) {
    const error = e as ZeroXError

    expect(error.message).toEqual('Internal server error')
    expect(error.error_code).toEqual('500')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }
})
test('Invalid: Get Price Quote - 501', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({}), { status: 501 })
  try {
    await zeroXSdk.api.getQuote({
      baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '0',
      kind: OrderKind.BUY,
    } as PriceQuoteParams)
  } catch (e) {
    const error = e as ZeroXError

    expect(error.message).toEqual('Not Implemented')
    expect(error.error_code).toEqual('501')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }
})
test('Invalid: Get Price Quote - 503', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({}), { status: 503 })
  try {
    await zeroXSdk.api.getQuote({
      baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '0',
      kind: OrderKind.BUY,
    } as PriceQuoteParams)
  } catch (e) {
    const error = e as ZeroXError

    expect(error.message).toEqual('Server Error - Too many open connections')
    expect(error.error_code).toEqual('503')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }
})
test('Invalid: Get Price Quote - unknown', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({}), { status: 600 })
  try {
    await zeroXSdk.api.getQuote({
      baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '0',
      kind: OrderKind.BUY,
    } as PriceQuoteParams)
  } catch (e) {
    const error = e as ZeroXError

    expect(error.message).toEqual('Error fetching quote')
    expect(error.error_code).toEqual('600')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }
})
