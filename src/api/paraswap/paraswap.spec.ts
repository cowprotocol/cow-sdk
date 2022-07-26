import { OrderKind } from '@cowprotocol/contracts'
import { SupportedChainId } from '../../constants/chains'
import CowSdk from '../../CowSdk'
// import ParaswapApi from './index'
import { ParaswapPriceQuoteParams } from './types'
import { OptimalRate, SwapSide } from 'paraswap-core'
import ParaswapError from './error'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const paraswap = require('paraswap')

// mock the entire library (found in top level __mocks__ > paraswap.js)
jest.mock('paraswap')

const PRICE_QUOTE_RESPONSE: OptimalRate = {
  blockNumber: 99999999,
  network: 1,
  srcToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  srcDecimals: 18,
  srcAmount: '1000000000000000000',
  destToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  destDecimals: 18,
  destAmount: '1000000000000000000',
  bestRoute: [
    {
      percent: 100,
      swaps: [
        {
          srcToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          srcDecimals: 0,
          destToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          destDecimals: 0,
          swapExchanges: [
            {
              exchange: 'UniswapV2',
              srcAmount: '1000000000000000000',
              destAmount: '1000000000000000000',
              percent: 100,
              data: {
                router: '0x0000000000000000000000000000000000000000',
                path: ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
                factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
                initCode: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
                feeFactor: 10000,
                pools: [
                  {
                    address: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
                    fee: 30,
                    direction: false,
                  },
                ],
                gasUSD: '10',
              },
            },
          ],
        },
      ],
    },
  ],
  others: [
    {
      exchange: 'UniswapV2',
      srcAmount: '1000000000000000000',
      destAmount: '3255989380',
      unit: '3255989380',
      data: {
        router: '0x0000000000000000000000000000000000000000',
        path: ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
        factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        initCode: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
        feeFactor: 10000,
        pools: [
          {
            address: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
            fee: 30,
            direction: false,
          },
        ],
        gasUSD: '13.227195',
      },
    },
  ],
  gasCostUSD: '10',
  gasCost: '111111',
  side: SwapSide.SELL,
  tokenTransferProxy: '0x3e7d31751347BAacf35945074a4a4A41581B2271',
  contractAddress: '0x485D2446711E141D2C8a94bC24BeaA5d5A110D74',
  contractMethod: 'swapOnUniswap',
  srcUSD: '5000',
  destUSD: '5000',
  partner: 'paraswap.io',
  partnerFee: 0,
  maxImpactReached: false,
  hmac: '319c5cf83098a07aeebb11bed6310db51311201f',
}

const query = {
  fromDecimals: 18,
  toDecimals: 18,
  baseToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  quoteToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  amount: '1000000000000000000',
  kind: OrderKind.SELL,
  chainId: 1,
} as ParaswapPriceQuoteParams

const chainId = SupportedChainId.MAINNET
const cowSdk = new CowSdk(chainId, {}, { loglevel: 'debug' })

describe('Get Quote', () => {
  beforeEach(() => {
    // GIVEN
    paraswap.__setRateResponseOrError(PRICE_QUOTE_RESPONSE)
  })

  test('Returns price quote using default options', async () => {
    // GIVEN
    // WHEN
    expect.assertions(1)
    const price = await cowSdk.paraswapApi.getQuote(query)

    // THEN
    expect(price).toEqual(PRICE_QUOTE_RESPONSE)
  })
})

describe('Error responses', () => {
  test('Returns 404', async () => {
    // GIVEN
    paraswap.__setRateResponseOrError({
      status: 404,
      message: 'No routes found with enough liquidity',
      data: {
        error: 'No routes found with enough liquidity',
      },
    })

    expect.assertions(1)

    try {
      // WHEN
      await cowSdk.paraswapApi.getQuote(query)
    } catch (error) {
      // THEN
      expect(error).toEqual(
        new ParaswapError({
          status: 404,
          message: 'No routes found with enough liquidity',
          data: {
            error: 'No routes found with enough liquidity',
          },
        })
      )
    }
  })

  test('Returns 400 - Validation failed', async () => {
    // GIVEN
    paraswap.__setRateResponseOrError({
      status: 400,
      message: 'Validation failed: "destToken" does not match any of the allowed types',
      data: {
        error: 'Validation failed: "destToken" does not match any of the allowed types',
      },
    })

    expect.assertions(1)

    try {
      // WHEN
      await cowSdk.paraswapApi.getQuote(query)
    } catch (error) {
      // THEN
      expect(error).toEqual(
        new ParaswapError({
          status: 400,
          message: 'Validation failed: "destToken" does not match any of the allowed types',
          data: {
            error: 'Validation failed: "destToken" does not match any of the allowed types',
          },
        })
      )
    }
  })
})

describe('Changing class options', () => {
  test('Returns correct apiUrl after changing it', async () => {
    // GIVEN
    // WHEN - we fetch a quote passing in excludedSources as the RateOptions
    cowSdk.paraswapApi.updateOptions({ apiUrl: 'https://apiv6.paraswap.io' })

    // THEN
    expect(cowSdk.paraswapApi.apiUrl).toEqual('https://apiv6.paraswap.io')
  })
  test('Returns empty rateOptions object when passing null', async () => {
    // GIVEN
    // WHEN - we fetch a quote passing in excludedSources as the RateOptions
    cowSdk.paraswapApi.updateOptions({ rateOptions: null })

    // THEN
    expect(cowSdk.paraswapApi.rateOptions).toEqual({})
  })
  test('Returns updated rateOptions object', async () => {
    // GIVEN
    // WHEN - we fetch a quote passing in excludedSources as the RateOptions
    cowSdk.paraswapApi.updateOptions({
      rateOptions: {
        excludePools: 'UniswapV2',
        excludeDEXS: 'CowSwap',
      },
    })

    // THEN
    expect(cowSdk.paraswapApi.rateOptions).toEqual({
      excludePools: 'UniswapV2',
      // T_T - don't do this!
      excludeDEXS: 'CowSwap',
    })
  })
})
