import { ethers } from 'ethers'
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { CowSdk } from '../../CowSdk'
import { OrderKind } from '@cowprotocol/contracts'
import { PriceQuoteLegacyParams } from '../../types'
import { SupportedChainId } from '../../constants/chains'
import { getAllPricesLegacy } from '.'

enableFetchMocks()

const signer = ethers.Wallet.createRandom()

const ENABLE_API = { enabled: true }

const HTTP_STATUS_OK = 200
const HEADERS = { 'Content-Type': 'application/json' }

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
  fetchMock.resetMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('getAllPricesLegacy only called once when no additional APIs instantiated', async () => {
  // GIVEN
  // no additional APIs instantiated
  const chainId = SupportedChainId.MAINNET
  const cowSdk = new CowSdk(chainId, { signer })
  fetchMock.mockResponseOnce(JSON.stringify(COW_QUOTE_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS })

  // WHEN
  await getAllPricesLegacy(cowSdk, {
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
  expect(fetchMock).toHaveBeenCalledTimes(1)

  /* expect(quote?.from).toEqual(COW_QUOTE_RESPONSE.from)
  expect(quote?.quote.buyToken).toEqual(COW_QUOTE_RESPONSE.quote.buyToken)
  expect(quote?.quote.sellToken).toEqual(COW_QUOTE_RESPONSE.quote.sellToken) */
})

test('getAllPricesLegacy called three times when 2 additional APIs added for correct chainId', async () => {
  // GIVEN
  // 2 additional APIs instantiated
  const cowSdk = new CowSdk(
    SupportedChainId.MAINNET,
    { signer },
    { paraswapOptions: ENABLE_API, zeroXOptions: ENABLE_API }
  )
  fetchMock.mockResponseOnce(JSON.stringify(COW_QUOTE_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS })

  // WHEN
  await getAllPricesLegacy(cowSdk, {
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
  expect(fetchMock).toHaveBeenCalledTimes(3)

  /* expect(quote?.from).toEqual(COW_QUOTE_RESPONSE.from)
    expect(quote?.quote.buyToken).toEqual(COW_QUOTE_RESPONSE.quote.buyToken)
    expect(quote?.quote.sellToken).toEqual(COW_QUOTE_RESPONSE.quote.sellToken) */
})

xtest('Valid: Get Price Quote (Legacy)', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(COW_PRICE_QUOTE_RESPONSE), { status: HTTP_STATUS_OK, headers: HEADERS })
  const cowSdk = new CowSdk(
    SupportedChainId.GOERLI,
    { signer },
    { paraswapOptions: ENABLE_API, zeroXOptions: ENABLE_API }
  )
  const price = await cowSdk.cowApi.getPriceQuoteLegacy({
    baseToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    quoteToken: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    amount: '1234567890',
    kind: OrderKind.BUY,
  } as PriceQuoteLegacyParams)

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.cow.fi/rinkeby/api/v1/markets/0x6810e776880c02933d47db1b9fc05908e5386b96-0x6810e776880c02933d47db1b9fc05908e5386b96/buy/1234567890',
    FETCH_RESPONSE_PARAMETERS
  )
  expect(price?.amount).toEqual(COW_PRICE_QUOTE_RESPONSE.amount)
  expect(price?.token).toEqual(COW_PRICE_QUOTE_RESPONSE.token)
})
