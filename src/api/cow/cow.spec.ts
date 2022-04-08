import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { CowSdk } from '../../CowSdk'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import OperatorError from './errors/OperatorError'
import { PriceQuoteParams } from '../../utils/price'
import QuoteError from './errors/QuoteError'

enableFetchMocks()

const chainId = 4 //Rinkeby
const cowSdk = new CowSdk(chainId)

const HTTP_STATUS_OK = 200
const HTTP_STATUS_NOT_FOUND = 404

const ORDER_RESPONSE = {
  sellToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  buyToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  receiver: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  sellAmount: '1234567890',
  buyAmount: '1234567890',
  validTo: 0,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  feeAmount: '1234567890',
  kind: 'buy',
  partiallyFillable: true,
  sellTokenBalance: 'erc20',
  buyTokenBalance: 'erc20',
  signingScheme: 'eip712',
  signature:
    '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  from: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  creationTime: '2020-12-03T18:35:18.814523Z',
  owner: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  uid: 'string',
  availableBalance: '1234567890',
  executedSellAmount: '1234567890',
  executedSellAmountBeforeFees: '1234567890',
  executedBuyAmount: '1234567890',
  executedFeeAmount: '1234567890',
  invalidated: true,
  status: 'presignaturePending',
  fullFeeAmount: '1234567890',
}

const TRADE_RESPONSE = {
  blockNumber: 0,
  logIndex: 0,
  orderUid: 'string',
  owner: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  sellToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  buyToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
  sellAmount: '1234567890',
  sellAmountBeforeFees: '1234567890',
  buyAmount: '1234567890',
  transactionHash: '0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5',
}

const PRICE_QUOTE_RESPONSE = {
  amount: '1234567890',
  token: '0x6810e776880c02933d47db1b9fc05908e5386b96',
}

beforeEach(() => {
  fetchMock.resetMocks()
})

test('Valid: Get an order ', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(ORDER_RESPONSE), { status: HTTP_STATUS_OK })
  const order = await cowSdk.cowApi.getOrder('string')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith('https://api.cow.fi/rinkeby/api/v1/orders/string', {
    body: undefined,
    headers: {
      'Content-Type': 'application/json',
      'X-AppId': '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
    method: 'GET',
  })
  expect(order?.uid).toEqual('string')
})

test('Invalid: Get an order ', async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({
      errorType: 'NotFound',
      description: "You've passed an invalid URL",
    }),
    { status: HTTP_STATUS_NOT_FOUND }
  )

  try {
    await cowSdk.cowApi.getOrder('notValidOrderId')
  } catch (e: unknown) {
    const error = e as OperatorError
    expect(error.message).toEqual('Token pair selected has insufficient liquidity')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('https://api.cow.fi/rinkeby/api/v1/orders/notValidOrderId', {
      body: undefined,
      headers: {
        'Content-Type': 'application/json',
        'X-AppId': '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      method: 'GET',
    })
  }
})

test('Valid: Get last 5 orders for a given trader ', async () => {
  const ORDERS_RESPONSE = Array(5).fill(ORDER_RESPONSE)
  fetchMock.mockResponseOnce(JSON.stringify(ORDERS_RESPONSE), { status: HTTP_STATUS_OK })
  const orders = await cowSdk.cowApi.getOrders({
    owner: '0x00000000005ef87f8ca7014309ece7260bbcdaeb', // Trader
    limit: 5,
    offset: 0,
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.cow.fi/rinkeby/api/v1/account/0x00000000005ef87f8ca7014309ece7260bbcdaeb/orders/?limit=5',
    {
      body: undefined,
      headers: {
        'Content-Type': 'application/json',
        'X-AppId': '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      method: 'GET',
    }
  )
  expect(orders.length).toEqual(5)
})

test('Invalid: Get last 5 orders for an unexisting trader ', async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({
      errorType: 'NotFound',
      description: "You've passed an invalid URL",
    }),
    { status: HTTP_STATUS_NOT_FOUND }
  )

  try {
    await cowSdk.cowApi.getOrders({
      owner: 'invalidOwner',
      limit: 5,
      offset: 0,
    })
  } catch (e: unknown) {
    const error = e as OperatorError
    expect(error.message).toEqual('Token pair selected has insufficient liquidity')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('https://api.cow.fi/rinkeby/api/v1/account/invalidOwner/orders/?limit=5', {
      body: undefined,
      headers: {
        'Content-Type': 'application/json',
        'X-AppId': '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      method: 'GET',
    })
  }
})

test('Valid: Get last 5 trades for a given trader ', async () => {
  const TRADES_RESPONSE = Array(5).fill(TRADE_RESPONSE)
  fetchMock.mockResponseOnce(JSON.stringify(TRADES_RESPONSE), { status: HTTP_STATUS_OK })
  const trades = await cowSdk.cowApi.getTrades({
    owner: '0x00000000005ef87f8ca7014309ece7260bbcdaeb', // Trader
    limit: 5,
    offset: 0,
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.cow.fi/rinkeby/api/v1/trades?owner=0x00000000005ef87f8ca7014309ece7260bbcdaeb&limit=5',
    {
      body: undefined,
      headers: {
        'Content-Type': 'application/json',
        'X-AppId': '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      method: 'GET',
    }
  )
  expect(trades.length).toEqual(5)
})

test('Invalid: Get last 5 trades for an unexisting trader ', async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({
      errorType: 'NotFound',
      description: "You've passed an invalid URL",
    }),
    { status: HTTP_STATUS_NOT_FOUND }
  )

  try {
    await cowSdk.cowApi.getTrades({
      owner: 'invalidOwner',
      limit: 5,
      offset: 0,
    })
  } catch (e: unknown) {
    const error = e as OperatorError
    expect(error.message).toEqual('Token pair selected has insufficient liquidity')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('https://api.cow.fi/rinkeby/api/v1/trades?owner=invalidOwner&limit=5', {
      body: undefined,
      headers: {
        'Content-Type': 'application/json',
        'X-AppId': '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      method: 'GET',
    })
  }
})

test('Valid: Get Price Quote (Legacy)', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(PRICE_QUOTE_RESPONSE), { status: HTTP_STATUS_OK })
  const price = await cowSdk.cowApi.getPriceQuoteLegacy({
    baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    quoteToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    amount: '1234567890',
    kind: OrderKind.BUY,
  } as PriceQuoteParams)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.cow.fi/rinkeby/api/v1/markets/0x6810e776880c02933d47db1b9fc05908e5386b96-0x6810e776880c02933d47db1b9fc05908e5386b96/buy/1234567890',
    {
      body: undefined,
      headers: {
        'Content-Type': 'application/json',
        'X-AppId': '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      method: 'GET',
    }
  )
  expect(price?.amount).toEqual('1234567890')
  expect(price?.token).toEqual('0x6810e776880c02933d47db1b9fc05908e5386b96')
})

test('Invalid: Get Price Quote (Legacy) with unexisting token', async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({
      errorType: 'NotFound',
      description: "You've passed an invalid URL",
    }),
    { status: HTTP_STATUS_NOT_FOUND }
  )
  try {
    await cowSdk.cowApi.getPriceQuoteLegacy({
      baseToken: 'unexistingToken',
      quoteToken: 'unexistingToken',
      amount: '1234567890',
      kind: OrderKind.BUY,
    } as PriceQuoteParams)
  } catch (e) {
    const error = e as QuoteError
    expect(error.message).toEqual('Token pair selected has insufficient liquidity')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.cow.fi/rinkeby/api/v1/markets/unexistingToken-unexistingToken/buy/1234567890',
      {
        body: undefined,
        headers: {
          'Content-Type': 'application/json',
          'X-AppId': '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
        method: 'GET',
      }
    )
  }
})
