import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { CowError } from '@cowprotocol/sdk-common'
import { SolanaOrderBookApi } from './solanaApi'
import { CompetitionOrderStatus, OrderKind, OrderStatus } from './generated/solana'
import { OrderStatus as EvmOrderStatus } from './generated'

enableFetchMocks()

const BACKOFF = { numOfAttempts: 1, maxDelay: Infinity, jitter: 'none' } as const

const api = new SolanaOrderBookApi({ backoffOpts: { ...BACKOFF } })

const PROD_BASE = 'https://api.cow.fi/solana'
const OWNER = '3JF3sEqM796hk5WFqA6EtmEwJQ9quALszsfJyvXNQKy3'
const UID = '0x291a7e4327d1c8f8ffd97d290fa0d1d3e60cd71d16bee0a389a15adc7c99f076'

const HTTP_STATUS_OK = 200
const HEADERS = { 'Content-Type': 'application/json' }

const GET_PARAMETERS = expect.objectContaining({
  body: undefined,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  method: 'GET',
})

const ORDER = {
  uid: UID,
  owner: OWNER,
  sellToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  buyToken: 'So11111111111111111111111111111111111111112',
  sellTokenAccount: OWNER,
  buyTokenAccount: OWNER,
  sellAmount: '1000000',
  buyAmount: '2000000',
  validTo: 1893456000,
  kind: OrderKind.SELL,
  partiallyFillable: false,
  appData: '0x00',
  orderPda: OWNER,
  creationDate: '2026-01-01T00:00:00Z',
  executedSellAmount: '0',
  executedBuyAmount: '0',
  status: OrderStatus.OPEN,
}

function mockOnce(body: unknown): void {
  fetchMock.mockResponseOnce(JSON.stringify(body), { status: HTTP_STATUS_OK, headers: HEADERS })
}

describe('SolanaOrderBookApi', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  test('defaults to the Solana base URL without being told the chain', async () => {
    mockOnce(ORDER)

    await api.getOrder(UID)

    expect(fetchMock).toHaveBeenCalledWith(`${PROD_BASE}/api/v1/orders/${UID}`, GET_PARAMETERS)
  })

  test('honours the staging environment override', async () => {
    mockOnce(ORDER)

    await api.getOrder(UID, { env: 'staging' })

    expect(fetchMock).toHaveBeenCalledWith(`https://barn.api.cow.fi/solana/api/v1/orders/${UID}`, GET_PARAMETERS)
  })

  test('getOrders paginates the owner path', async () => {
    mockOnce([ORDER])

    const orders = await api.getOrders({ owner: OWNER, offset: 20, limit: 5 })

    expect(fetchMock).toHaveBeenCalledWith(
      `${PROD_BASE}/api/v1/account/${OWNER}/orders?offset=20&limit=5`,
      GET_PARAMETERS,
    )
    expect(orders[0]?.orderPda).toEqual(OWNER)
  })

  test('getOrderCompetitionStatus reads the status path', async () => {
    mockOnce({ type: 'expired' })

    const status = await api.getOrderCompetitionStatus(UID)

    expect(fetchMock).toHaveBeenCalledWith(`${PROD_BASE}/api/v1/orders/${UID}/status`, GET_PARAMETERS)
    expect(status.type).toEqual(CompetitionOrderStatus.type.EXPIRED)
  })

  test('getTrades filters by a single order', async () => {
    mockOnce([])

    await api.getTrades({ orderUid: UID })

    expect(fetchMock).toHaveBeenCalledWith(
      `${PROD_BASE}/api/v2/trades?orderUid=${UID}&offset=0&limit=10`,
      GET_PARAMETERS,
    )
  })

  test('getTrades rejects both filters at once', async () => {
    await expect(api.getTrades({ owner: OWNER, orderUid: UID })).rejects.toThrow(CowError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('getTrades rejects neither filter set', async () => {
    await expect(api.getTrades({})).rejects.toThrow(CowError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('sendOrder posts the partially signed transaction', async () => {
    mockOnce(UID)

    const uid = await api.sendOrder({ partiallySignedTx: 'base64tx', quoteId: 7 })

    expect(fetchMock).toHaveBeenCalledWith(
      `${PROD_BASE}/api/v1/orders`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ partiallySignedTx: 'base64tx', quoteId: 7 }) }),
    )
    expect(uid).toEqual(UID)
  })

  test('getQuote returns the funder the sponsored creation needs', async () => {
    mockOnce({ quote: {}, from: OWNER, expiration: '2026-01-01T00:00:00Z', verified: false, funder: OWNER })

    const quote = await api.getQuote({
      from: OWNER,
      sellToken: ORDER.sellToken,
      buyToken: ORDER.buyToken,
      kind: OrderKind.SELL,
      sellAmountBeforeFee: '1000000',
    })

    expect(fetchMock).toHaveBeenCalledWith(`${PROD_BASE}/api/v1/quote`, expect.objectContaining({ method: 'POST' }))
    expect(quote.funder).toEqual(OWNER)
  })
})

/**
 * The two order books declare same-named schemas with different members. Generating both from one spec,
 * or letting one stand in for the other, silently reintroduces that: these pin the difference.
 */
describe('Solana and EVM models stay apart', () => {
  test('the Solana competition status carries `expired`', () => {
    expect(CompetitionOrderStatus.type.EXPIRED).toEqual('expired')
  })

  test('only the EVM order status has `presignaturePending`', () => {
    expect(Object.values(OrderStatus)).not.toContain('presignaturePending')
    expect(Object.values(EvmOrderStatus)).toContain('presignaturePending')
  })

  test('a Solana order carries its on-chain accounts', () => {
    const order = ORDER

    expect(order.orderPda).toBeDefined()
    expect(order.sellTokenAccount).toBeDefined()
    expect(order.buyTokenAccount).toBeDefined()
  })
})
