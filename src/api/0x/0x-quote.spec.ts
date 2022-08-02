import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { OrderKind } from '@cowprotocol/contracts'
import { PriceQuoteLegacyParams } from '../cow/types'
import { SupportedChainId } from '../../constants/chains'
import CowSdk from '../../CowSdk'
import { ERC20BridgeSource } from './types'

enableFetchMocks()

const chainId = SupportedChainId.MAINNET

const cowSdk = new CowSdk(chainId, {}, { loglevel: 'debug', zeroXOptions: { enabled: true } })

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
} as PriceQuoteLegacyParams

describe('Get Quote', () => {
  test('Returns price quote using default options', async () => {
    // GIVEN stub
    fetchMock.mockResponseOnce(JSON.stringify(PRICE_QUOTE_RESPONSE), { status: HTTP_STATUS_OK })

    // WHEN - we fetch a quote
    const price = await cowSdk.zeroXApi.getQuote(query)

    // THEN
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.0x.org/swap/v1/price?sellToken=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&buyToken=0x6810e776880c02933d47db1b9fc05908e5386b96&buyAmount=1234567890&affiliateAddress=0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
      FETCH_RESPONSE_PARAMETERS
    )
    expect(price?.value).toEqual(PRICE_QUOTE_RESPONSE.value)
    expect(price?.buyTokenAddress).toEqual(PRICE_QUOTE_RESPONSE.buyTokenAddress)
  })

  test('Returns price quote using custom options', async () => {
    // GIVEN stub
    fetchMock.mockResponseOnce(JSON.stringify(PRICE_QUOTE_RESPONSE), { status: HTTP_STATUS_OK })
    // WHEN - we instantiate a new cowsdk with custom matcha options
    const cowSdk = new CowSdk(
      chainId,
      {},
      {
        zeroXOptions: {
          enabled: true,
          affiliateAddressMap: {
            [SupportedChainId.MAINNET]: '0xAFFILIATE_ADDRESS_MAINNET',
          },
          excludedSources: [ERC20BridgeSource.Uniswap, ERC20BridgeSource.ACryptos, ERC20BridgeSource.CheeseSwap],
        },
      }
    )
    // WHEN - we fetch a quote
    const price = await cowSdk.zeroXApi.getQuote(query)

    // THEN
    expect(fetchMock).toHaveBeenCalledTimes(1)
    // we expect here the URL to reflect the changed options
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.0x.org/swap/v1/price?sellToken=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&buyToken=0x6810e776880c02933d47db1b9fc05908e5386b96&buyAmount=1234567890&affiliateAddress=0xAFFILIATE_ADDRESS_MAINNET&excludedSources=Uniswap%2CACryptoS%2CCheeseSwap',
      FETCH_RESPONSE_PARAMETERS
    )
    expect(price?.value).toEqual(PRICE_QUOTE_RESPONSE.value)
    expect(price?.buyTokenAddress).toEqual(PRICE_QUOTE_RESPONSE.buyTokenAddress)
  })
})
