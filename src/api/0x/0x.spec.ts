import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { OrderKind } from '@cowprotocol/contracts'
import { PriceQuoteParams } from '../cow/types'
import { SupportedChainId } from '../../constants/chains'
import { ZeroXSdk } from '../../0xSdk'
import ZeroXError from './error'

enableFetchMocks()

const chainId = 1 as SupportedChainId //Rinkeby

const zeroXSdk = new ZeroXSdk(chainId, {}, { loglevel: 'debug' })

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

test('Valid: Get Price Quote', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(PRICE_QUOTE_RESPONSE), { status: HTTP_STATUS_OK })
  const price = await zeroXSdk.api.getQuote({
    baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amount: '1234567890',
    kind: OrderKind.BUY,
  } as PriceQuoteParams)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.0x.org/swap/v1/price?sellToken=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&buyToken=0x6810e776880c02933d47db1b9fc05908e5386b96&buyAmount=1234567890&excludedSources=&affiliateAddress=0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
    FETCH_RESPONSE_PARAMETERS
  )
  expect(price?.value).toEqual(PRICE_QUOTE_RESPONSE.value)
  expect(price?.buyTokenAddress).toEqual(PRICE_QUOTE_RESPONSE.buyTokenAddress)
})
test('Invalid: Get Price Quote', async () => {
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
  try {
    await zeroXSdk.api.getQuote({
      baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      quoteToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      amount: '0',
      kind: OrderKind.BUY,
    } as PriceQuoteParams)
  } catch (e) {
    const error = e as ZeroXError

    expect(error.message).toEqual('Validation Failed')
    expect(error.description).toEqual('INSUFFICIENT_ASSET_LIQUIDITY')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }
})
