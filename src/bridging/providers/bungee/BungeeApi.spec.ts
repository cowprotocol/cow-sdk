import { SupportedChainId } from '../../../chains'
import { BungeeApi } from './BungeeApi'

// unmock cross-fetch to use the real API
jest.unmock('cross-fetch')

describe('BungeeApi: Shape of API response', () => {
  let api: BungeeApi

  beforeEach(() => {
    // Use the real API (not mocked)
    api = new BungeeApi()
  })

  it('getBungeeQuote from ARBITRUM_ONE to BASE', async () => {
    const result = await api.getBungeeQuote({
      userAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
      originChainId: SupportedChainId.ARBITRUM_ONE.toString(),
      destinationChainId: SupportedChainId.BASE.toString(),
      inputToken: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // weth
      inputAmount: '3000000000000000', // 0.0003 eth
      receiverAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
      outputToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // weth
      enableManual: true,
      disableSwapping: true,
      disableAuto: true,
    })

    expect(result).toBeDefined()
    expect(result.originChainId).toBe(SupportedChainId.ARBITRUM_ONE)
    expect(result.destinationChainId).toBe(SupportedChainId.BASE)
    expect(result.route).toBeDefined()
    expect(result.routeBridge).toBeDefined()
  })

  it('getBungeeQuote from MAINNET to POLYGON', async () => {
    const result = await api.getBungeeQuote({
      userAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
      originChainId: SupportedChainId.MAINNET.toString(),
      destinationChainId: SupportedChainId.POLYGON.toString(),
      inputToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // weth
      inputAmount: '1000000000000000000',
      receiverAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
      outputToken: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // weth
      enableManual: true,
      disableSwapping: true,
      disableAuto: true,
    })

    expect(result).toBeDefined()
    expect(result.originChainId).toBe(SupportedChainId.MAINNET)
    expect(result.destinationChainId).toBe(SupportedChainId.POLYGON)
    expect(result.route).toBeDefined()
    expect(result.routeBridge).toBeDefined()
  })

  it('getBungeeBuildTx', async () => {
    // First get a quote
    const quote = await api.getBungeeQuote({
      userAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
      originChainId: SupportedChainId.ARBITRUM_ONE.toString(),
      destinationChainId: SupportedChainId.BASE.toString(),
      inputToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // weth
      inputAmount: '2389939424141418',
      receiverAddress: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
      outputToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // weth
      enableManual: true,
      disableSwapping: true,
      disableAuto: true,
    })

    // Then get the build tx
    const result = await api.getBungeeBuildTx(quote)

    expect(result).toBeDefined()
    expect(result.txData).toBeDefined()
    expect(result.txData.data).toBeDefined()
    expect(result.txData.to).toBeDefined()
    expect(result.txData.chainId).toBeDefined()
    expect(result.txData.value).toBeDefined()
    expect(result.approvalData).toBeDefined()
  })

  it('getEvents', async () => {
    // Note: This test requires a valid orderId from a previous transaction
    // Using a known orderId from a previous transaction
    const result = await api.getEvents({
      orderId: '0x0bfa5c44e95964a907d5f0d69ea65221e3a8fb1871e41aa3195e446c4ce855bbdaee4d2156de6fe6f7d50ca047136d758f96a6f067ee7474',
    })

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
    if (result.length > 0) {
      const event = result[0]
      expect(event.identifier).toBeDefined()
      expect(event.srcTransactionHash).toBeDefined()
      expect(event.bridgeName).toBeDefined()
      expect(event.fromChainId).toBeDefined()
      expect(event.isCowswapTrade).toBeDefined()
      expect(event.orderId).toBeDefined()
      expect(event.recipient).toBeDefined()
      expect(event.sender).toBeDefined()
      expect(event.destTransactionHash).toBeDefined()
      expect(event.srcTxStatus).toBeDefined()
      expect(event.destTxStatus).toBeDefined()
    }
  })

  it('getAcrossStatus', async () => {
    // Note: This test requires a valid depositTxHash from a previous transaction
    // Using a known depositTxHash from a previous transaction
    const result = await api.getAcrossStatus('0x2bb3be895fd9be20522562cd62b52ae8d58eb00b31548c2caa7fcb557708f4cf')

    expect(result).toBeDefined()
    expect(['filled', 'pending', 'expired', 'refunded', 'slowFillRequested']).toContain(result)
  })
})
