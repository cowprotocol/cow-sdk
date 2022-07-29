/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers'
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { CowSdk } from '../../CowSdk'
import { OrderKind } from '@cowprotocol/contracts'
import { PriceQuoteLegacyParams } from '../../types'
import { SupportedChainId } from '../../constants/chains'
import { OptimalRate, SwapSide } from 'paraswap-core'
import { ParaswapPriceQuoteParams } from '../../api/paraswap/types'
import { getAllPricesLegacy } from '.'

/**
 * MOCK fetch calls
 * MOCK paraswap lib
 */
enableFetchMocks()
// eslint-disable-next-line @typescript-eslint/no-var-requires
const paraswap = require('paraswap')
// mock the entire library (found in top level __mocks__ > paraswap.js)
jest.mock('paraswap')

const signer = ethers.Wallet.createRandom()

const ENABLE_API = { enabled: true }

const HTTP_STATUS_OK = 200
const HEADERS = { 'Content-Type': 'application/json' }
// 200 good server response across the board
const GOOD_SERVER_RESPONSE = {
  status: HTTP_STATUS_OK,
  headers: HEADERS,
}
// 400 error server response with good headers
const FOUR_HUNDRED_SERVER_RESPONSE = {
  status: 400,
  headers: HEADERS,
}

/* const PARTIAL_ORDER = {
  sellToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  buyToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  receiver: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  sellAmount: '1234567890',
  buyAmount: '1234567890',
  validTo: 0,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  partiallyFillable: true,
  sellTokenBalance: 'erc20',
  buyTokenBalance: 'erc20',
  from: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  kind: 'buy',
} */

const FETCH_RESPONSE_PARAMETERS = {
  body: undefined,
  headers: {
    'Content-Type': 'application/json',
  },
  method: 'GET',
}

const COW_PRICE_QUOTE_RESPONSE = {
  amount: '1234567890',
  token: '0x6810e776880c02933d47db1b9fc05908e5386b96',
}

/* const COW_QUOTE_REQUEST = {
  ...PARTIAL_ORDER,
  priceQuality: 'fast',
  sellAmountBeforeFee: '1234567890',
  amount: '1234567890',
  userAddress: '0x6810e776880c02933d47db1b9fc05908e5386b96',
} */

const PARASWAP_PRICE_QUOTE_RESPONSE: OptimalRate = {
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

const ZEROX_PRICE_QUOTE_RESPONSE = {
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

const PARASWAP_QUERY = {
  fromDecimals: 18,
  toDecimals: 18,
  baseToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  quoteToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  amount: '1000000000000000000',
  kind: OrderKind.SELL,
  chainId: 1,
} as ParaswapPriceQuoteParams

const COW_QUOTE_RESPONSE = {
  quote: {
    kind: 'buy',
    sellToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    buyToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    receiver: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    sellAmount: '1234567890',
    buyAmount: '1234567890',
    validTo: 0,
    appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
    feeAmount: '1234567890',
    partiallyFillable: false,
    sellTokenBalance: 'erc20',
    buyTokenBalance: 'erc20',
  },
  from: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  expirationDate: '1985-03-10T18:35:18.814523Z',
}

beforeEach(() => {
  // GIVEN
  fetchMock.resetMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('getAllPricesLegacy returns CoW price and null for uninstantiated APIs', async () => {
  // GIVEN
  const chainId = SupportedChainId.MAINNET
  const cowSdk = new CowSdk(chainId, { signer }) // no additional APIs instantiated
  // mocks cow/0x/para quote response
  _mockApiResponses({
    cow: {
      response: {
        amount: '123',
        quoteId: undefined,
        token: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      },
      responseOptions: GOOD_SERVER_RESPONSE,
    },
    para: { response: null, responseOptions: GOOD_SERVER_RESPONSE },
    zrx: { response: null, responseOptions: GOOD_SERVER_RESPONSE },
  })

  // WHEN
  const quote = await getAllPricesLegacy(cowSdk, {
    chainId,
    fromDecimals: 18,
    toDecimals: 18,
    baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    quoteToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    amount: '1234567890',
    kind: OrderKind.BUY,
    validTo: Date.now() + 30000,
  })

  // THEN
  expect(quote).toEqual({
    cowQuoteResult: {
      status: 'fulfilled',
      value: { amount: '123', token: '0x6810e776880c02933d47db1b9fc05908e5386b96', quoteId: undefined },
    },
    paraswapQuoteResult: {
      status: 'fulfilled',
      value: null,
    },
    zeroXQuoteResult: {
      status: 'fulfilled',
      value: null,
    },
  })
})

test('getAllPricesLegacy returns 2 quotes when 0x API is added on VALID chainId', async () => {
  // GIVE
  const chainId = SupportedChainId.MAINNET
  // no additional APIs instantiated
  const cowSdk = new CowSdk(chainId, { signer }, { zeroXOptions: ENABLE_API })
  // mocks cow/0x/para quote response
  _mockApiResponses({
    cow: {
      response: {
        amount: '123',
        quoteId: undefined,
        token: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      },
      responseOptions: GOOD_SERVER_RESPONSE,
    },
    para: { response: null },
    zrx: { response: ZEROX_PRICE_QUOTE_RESPONSE, responseOptions: GOOD_SERVER_RESPONSE },
  })

  // WHEN
  const quote = await getAllPricesLegacy(cowSdk, {
    chainId,
    fromDecimals: 18,
    toDecimals: 18,
    baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    quoteToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    amount: '1234567890',
    kind: OrderKind.BUY,
    validTo: Date.now() + 30000,
  })

  // THEN
  expect(quote).toEqual({
    cowQuoteResult: {
      status: 'fulfilled',
      value: { amount: '123', token: '0x6810e776880c02933d47db1b9fc05908e5386b96', quoteId: undefined },
    },
    paraswapQuoteResult: {
      status: 'fulfilled',
      value: null,
    },
    zeroXQuoteResult: {
      status: 'fulfilled',
      value: ZEROX_PRICE_QUOTE_RESPONSE,
    },
  })
})

test('getAllPricesLegacy returns 3 quotes when 0x and Para APIs are added on VALID chainId', async () => {
  // GIVEN
  const cowSdk = new CowSdk(
    SupportedChainId.MAINNET,
    { signer },
    { paraswapOptions: ENABLE_API, zeroXOptions: ENABLE_API }
  )
  _mockApiResponses({
    cow: {
      response: {
        amount: '123',
        quoteId: undefined,
        token: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      },
      responseOptions: GOOD_SERVER_RESPONSE,
    },
    para: { response: PARASWAP_PRICE_QUOTE_RESPONSE },
    zrx: { response: ZEROX_PRICE_QUOTE_RESPONSE, responseOptions: GOOD_SERVER_RESPONSE },
  })

  // WHEN
  const quote = await getAllPricesLegacy(cowSdk, {
    chainId: SupportedChainId.MAINNET,
    fromDecimals: 18,
    toDecimals: 18,
    baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    quoteToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    amount: '1234567890',
    kind: OrderKind.BUY,
    validTo: Date.now() + 30000,
  })

  // THEN
  // cow mock
  expect(fetchMock).toHaveBeenNthCalledWith(
    1,
    'https://api.cow.fi/mainnet/api/v1/markets/0x6810e776880c02933d47db1b9fc05908e5386b96-0x6810e776880c02933d47db1b9fc05908e5386b96/buy/1234567890',
    FETCH_RESPONSE_PARAMETERS
  )
  // zrx mock
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    'https://api.0x.org/swap/v1/price?sellToken=0x6810e776880c02933d47db1b9fc05908e5386b96&buyToken=0x6810e776880c02933d47db1b9fc05908e5386b96&buyAmount=1234567890&affiliateAddress=0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
    FETCH_RESPONSE_PARAMETERS
  )

  expect(quote).toEqual({
    cowQuoteResult: {
      status: 'fulfilled',
      value: { amount: '123', token: '0x6810e776880c02933d47db1b9fc05908e5386b96', quoteId: undefined },
    },
    paraswapQuoteResult: {
      status: 'fulfilled',
      value: PARASWAP_PRICE_QUOTE_RESPONSE,
    },
    zeroXQuoteResult: {
      status: 'fulfilled',
      value: ZEROX_PRICE_QUOTE_RESPONSE,
    },
  })
})

/* function __createPromiseFulfilledValue<T>(value: T): PromiseFulfilledResult<T> {
  return {
    status: 'fulfilled',
    value,
  }
}

function __createPromiseRejectedWithValue<T>(
  value: T,
  reason: string
): PromiseRejectedResult & { value: T | undefined } {
  return {
    status: 'rejected',
    reason,
    value,
  }
} */

interface MockResponse<T> {
  response: T
  responseOptions: { status: number; headers: typeof HEADERS }
}
function _mockApiResponses({
  cow,
  para,
  zrx,
}: {
  cow: MockResponse<any>
  para: Omit<MockResponse<any>, 'responseOptions'>
  zrx: MockResponse<any>
}) {
  fetchMock.mockResponseOnce(JSON.stringify(cow.response), cow.responseOptions)
  // mocks 0x fetch response
  fetchMock.mockResponseOnce(JSON.stringify(zrx.response), zrx.responseOptions)
  // mock paraswap response separate from fetchMock
  paraswap.__setRateResponseOrError(JSON.stringify(para.response))
}
