import { RelayApi } from './RelayApi'

describe('RelayApi: Shape of API response', () => {
  let api: RelayApi

  beforeEach(() => {
    api = new RelayApi()
  })

  it('getCurrencies returns tokens for Base', async () => {
    const result = await api.getCurrencies({ chainIds: [8453], depositAddressOnly: true })

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)

    const currency = result[0]
    expect(currency).toHaveProperty('chainId', 8453)
    expect(currency).toHaveProperty('address')
    expect(currency).toHaveProperty('symbol')
    expect(currency).toHaveProperty('name')
    expect(currency).toHaveProperty('decimals')
  })

  it('getCurrencies returns tokens for Ethereum mainnet', async () => {
    const result = await api.getCurrencies({ chainIds: [1], depositAddressOnly: true })

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('getQuote returns quote for USDC Base -> Ethereum', async () => {
    const user = '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3'
    const result = await api.getQuote({
      user,
      recipient: user,
      originChainId: 8453,
      destinationChainId: 1,
      originCurrency: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
      destinationCurrency: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on Ethereum
      amount: '1000000', // 1 USDC
      tradeType: 'EXACT_INPUT',
      useDepositAddress: true,
      strict: true,
      refundTo: user,
    })

    expect(result).toBeDefined()
    expect(result.steps).toBeDefined()
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0]!.depositAddress).toBeDefined()
    expect(result.fees).toBeDefined()
    expect(result.details).toBeDefined()
    expect(result.details.currencyIn).toBeDefined()
    expect(result.details.currencyOut).toBeDefined()
  })

  it('getRequests returns response for a deposit address', async () => {
    const result = await api.getRequests('0x03508bB71268BBA25ECaCC8F620e01866650532c')

    expect(result).toBeDefined()
    expect(result).toHaveProperty('requests')
    expect(Array.isArray(result.requests)).toBe(true)
  })

  it('getStatus returns success for a known completed request', async () => {
    const result = await api.getStatus('0x4801b4fbc17f8fa11da83837bf2dabfb158bc643db89a90fca6451f69b9584eb')

    expect(result).toBeDefined()
    expect(result.status).toBe('success')
    expect(result.inTxHashes).toBeDefined()
    expect(result.txHashes).toBeDefined()
  })
})
