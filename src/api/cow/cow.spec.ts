import { ethers } from 'ethers'
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { CowSdk } from '../../CowSdk'
import { OrderKind, SigningScheme } from '@gnosis.pm/gp-v2-contracts'
import OperatorError from './errors/OperatorError'
import { PriceQuoteParams } from '../../utils/price'
import QuoteError from './errors/QuoteError'
import { CowError } from '../../utils/common'
import { OrderCreation, UnsignedOrder } from '../../utils/sign'

enableFetchMocks()

const chainId = 4 //Rinkeby

const signer = ethers.Wallet.createRandom()

const cowSdk = new CowSdk(chainId, { signer })

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
  uid: '0x59920c85de0162e9e55df8d396e75f3b6b7c2dfdb535f03e5c807731c31585eaff714b8b0e2700303ec912bd40496c3997ceea2b616d6710',
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

const FETCH_RESPONSE_PARAMETERS = {
  body: undefined,
  headers: {
    'Content-Type': 'application/json',
    'X-AppId': cowSdk.context.appDataHash,
  },
  method: 'GET',
}

const PRICE_QUOTE_RESPONSE = {
  amount: '1234567890',
  token: '0x6810e776880c02933d47db1b9fc05908e5386b96',
}

const PROFILE_DATA_RESPONSE = {
  totalTrades: 1,
  totalReferrals: 0,
  tradeVolumeUsd: 24.22795306584268,
  referralVolumeUsd: 0.0,
  lastUpdated: '2022-04-11T15:51:06Z',
}

const SIGNED_ORDER_RESPONSE = {
  signature:
    '0x4d306ce7c770d22005bcfc00223f8d9aaa04e8a20099cc986cb9ccf60c7e876b777ceafb1e03f359ebc6d3dc84245d111a3df584212b5679cb5f9e6717b69b031b',
  signingScheme: SigningScheme.EIP712,
}

beforeEach(() => {
  fetchMock.resetMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('Valid: Get an order ', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(ORDER_RESPONSE), { status: HTTP_STATUS_OK })
  const order = await cowSdk.cowApi.getOrder(ORDER_RESPONSE.uid)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    `https://api.cow.fi/rinkeby/api/v1/orders/${ORDER_RESPONSE.uid}`,
    FETCH_RESPONSE_PARAMETERS
  )
  expect(order?.uid).toEqual(ORDER_RESPONSE.uid)
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
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.cow.fi/rinkeby/api/v1/orders/notValidOrderId',
      FETCH_RESPONSE_PARAMETERS
    )
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
    FETCH_RESPONSE_PARAMETERS
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
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.cow.fi/rinkeby/api/v1/account/invalidOwner/orders/?limit=5',
      FETCH_RESPONSE_PARAMETERS
    )
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
    FETCH_RESPONSE_PARAMETERS
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
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.cow.fi/rinkeby/api/v1/trades?owner=invalidOwner&limit=5',
      FETCH_RESPONSE_PARAMETERS
    )
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
    FETCH_RESPONSE_PARAMETERS
  )
  expect(price?.amount).toEqual(PRICE_QUOTE_RESPONSE.amount)
  expect(price?.token).toEqual(PRICE_QUOTE_RESPONSE.token)
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
      FETCH_RESPONSE_PARAMETERS
    )
  }
})

test('Valid: Get Profile Data', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(PROFILE_DATA_RESPONSE), { status: HTTP_STATUS_OK })
  const cowSdk1 = new CowSdk(chainId)
  cowSdk1.updateChainId(1)

  await cowSdk1.cowApi.getProfileData('0x6810e776880c02933d47db1b9fc05908e5386b96')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.cow.fi/affiliate/api/v1/profile/0x6810e776880c02933d47db1b9fc05908e5386b96',
    FETCH_RESPONSE_PARAMETERS
  )
})

test('Invalid: Get Profile Data from unexisting address', async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({
      errorType: 'NotFound',
      description: "You've passed an invalid URL",
    }),
    { status: HTTP_STATUS_NOT_FOUND }
  )
  const cowSdk1 = new CowSdk(chainId)
  cowSdk1.updateChainId(1)

  try {
    await cowSdk1.cowApi.getProfileData('unexistingAddress')
  } catch (e) {
    const error = e as CowError
    expect(error.message).toEqual("You've passed an invalid URL")
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.cow.fi/affiliate/api/v1/profile/unexistingAddress',
      FETCH_RESPONSE_PARAMETERS
    )
  }
})

test('Invalid: Get Profile Data from not supported network', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(PROFILE_DATA_RESPONSE), { status: HTTP_STATUS_OK })
  const profileData = await cowSdk.cowApi.getProfileData('0x6810e776880c02933d47db1b9fc05908e5386b96')
  expect(profileData).toBeNull()
})

test('Valid: Sign Order', async () => {
  const order: Omit<UnsignedOrder, 'appData'> = {
    kind: OrderKind.SELL,
    partiallyFillable: false, // Allow partial executions of an order (true would be for a "Fill or Kill" order, which is not yet supported but will be added soon)
    sellToken: '0xc778417e063141139fce010982780140aa0cd5ab', // WETH
    buyToken: '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b', // USDC
    sellAmount: '1234567890',
    buyAmount: '1234567890',
    validTo: 2524608000,
    receiver: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    feeAmount: '1234567890',
  }

  const signedOrder = await cowSdk.signOrder(order)
  expect(signedOrder.signature).not.toBeNull()
  expect(signedOrder.signingScheme).not.toBeNull()
})

test('Valid: Sign cancellation Order', async () => {
  const signCancellationOrder = await cowSdk.signOrderCancellation(ORDER_RESPONSE.uid)
  expect(signCancellationOrder.signature).not.toBeNull()
  expect(signCancellationOrder.signingScheme).not.toBeNull()
})

test('Valid: Send an order ', async () => {
  fetchMock.mockResponseOnce(JSON.stringify('validOrderId'), { status: HTTP_STATUS_OK })
  const orderId = await cowSdk.cowApi.sendOrder({
    order: { ...ORDER_RESPONSE, ...SIGNED_ORDER_RESPONSE } as Omit<OrderCreation, 'appData'>,
    owner: '0x1811be0994930fe9480eaede25165608b093ad7a',
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith('https://api.cow.fi/rinkeby/api/v1/orders', {
    ...FETCH_RESPONSE_PARAMETERS,
    body: JSON.stringify({
      ...ORDER_RESPONSE,
      ...SIGNED_ORDER_RESPONSE,
      from: '0x1811be0994930fe9480eaede25165608b093ad7a',
      signingScheme: 'eip712',
    }),
    method: 'POST',
  })
  expect(orderId).toEqual('validOrderId')
})

test('Invalid: Send an duplicate order ', async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({
      errorType: 'DuplicateOrder',
      description: 'string',
    }),
    { status: HTTP_STATUS_NOT_FOUND }
  )

  try {
    await cowSdk.cowApi.sendOrder({
      order: { ...ORDER_RESPONSE, ...SIGNED_ORDER_RESPONSE } as Omit<OrderCreation, 'appData'>,
      owner: '0x1811be0994930fe9480eaede25165608b093ad7a',
    })
  } catch (e: unknown) {
    const error = e as CowError
    expect(error.message).toEqual('There was another identical order already submitted. Please try again.')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('https://api.cow.fi/rinkeby/api/v1/orders', {
      ...FETCH_RESPONSE_PARAMETERS,
      body: JSON.stringify({
        ...ORDER_RESPONSE,
        ...SIGNED_ORDER_RESPONSE,
        from: '0x1811be0994930fe9480eaede25165608b093ad7a',
        signingScheme: 'eip712',
      }),
      method: 'POST',
    })
  }
})

test('Valid: AppDataHash properly set on X-AppId header', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(PROFILE_DATA_RESPONSE), { status: HTTP_STATUS_OK })
  const cowSdk1 = new CowSdk(chainId, {
    appDataHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
  })
  cowSdk1.updateChainId(1)
  await cowSdk1.cowApi.getProfileData('0x6810e776880c02933d47db1b9fc05908e5386b96')
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.cow.fi/affiliate/api/v1/profile/0x6810e776880c02933d47db1b9fc05908e5386b96',
    {
      ...FETCH_RESPONSE_PARAMETERS,
      headers: { ...FETCH_RESPONSE_PARAMETERS.headers, 'X-AppId': cowSdk1.context.appDataHash },
    }
  )
})

test('Valid: AppDataHash properly set on X-AppId header when undefined', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(PROFILE_DATA_RESPONSE), { status: HTTP_STATUS_OK })
  const cowSdk1 = new CowSdk(chainId, { appDataHash: undefined })
  cowSdk1.updateChainId(1)
  await cowSdk1.cowApi.getProfileData('0x6810e776880c02933d47db1b9fc05908e5386b96')
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.cow.fi/affiliate/api/v1/profile/0x6810e776880c02933d47db1b9fc05908e5386b96',
    {
      ...FETCH_RESPONSE_PARAMETERS,
      headers: {
        ...FETCH_RESPONSE_PARAMETERS.headers,
        'X-AppId': '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
    }
  )
})
