import { SupportedChainId, TargetChainId } from '../../../chains'
import { TokenInfo } from '../../../common'
import { BungeeApi } from './BungeeApi'
import { BUNGEE_SUPPORTED_NETWORKS, BungeeBridgeProvider, BungeeBridgeProviderOptions } from './BungeeBridgeProvider'
import { latest as latestAppData } from '@cowprotocol/app-data'

// Mock BungeeApi
jest.mock('./BungeeApi')

class BungeeBridgeProviderTest extends BungeeBridgeProvider {
  constructor(options: BungeeBridgeProviderOptions) {
    super(options)
  }

  // Re-expose the API for testing
  public getApi() {
    return this.api
  }

  // Allow to set the API for testing
  public setApi(api: BungeeApi) {
    this.api = api
  }
}

describe('BungeeBridgeProvider', () => {
  const mockGetTokenInfos = jest.fn()
  let provider: BungeeBridgeProviderTest

  beforeEach(() => {
    const options = {
      getTokenInfos: mockGetTokenInfos,
      apiOptions: {},
    }
    provider = new BungeeBridgeProviderTest(options)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getNetworks', () => {
    it('should return supported networks', async () => {
      const networks = await provider.getNetworks()

      expect(networks.length).toBeGreaterThan(0)
      expect(networks).toEqual(BUNGEE_SUPPORTED_NETWORKS)
    })
  })

  describe('getBuyTokens', () => {
    const mockTokens: TokenInfo[] = [
      { chainId: SupportedChainId.POLYGON, address: '0x123', decimals: 18, symbol: 'TOKEN1', name: 'Token 1' },
      { chainId: SupportedChainId.POLYGON, address: '0x456', decimals: 6, symbol: 'TOKEN2', name: 'Token 2' },
    ]

    beforeEach(() => {
      mockGetTokenInfos.mockResolvedValue(mockTokens)
    })

    it('should return tokens for supported chain', async () => {
      const tokens = await provider.getBuyTokens(SupportedChainId.POLYGON)

      expect(tokens).toEqual(mockTokens)
      // mockGetTokenInfos was called with a list of addresses which includes 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 and 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619

      // The token result contains USDC and WETH in polygon
      expect(mockGetTokenInfos).toHaveBeenCalledWith(
        SupportedChainId.POLYGON,
        expect.arrayContaining([
          '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
          '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        ]),
      )
    })

    it('should return empty array for unsupported chain', async () => {
      const tokens = await provider.getBuyTokens(12345 as TargetChainId)

      // The token result is empty and we don't call getTokenInfos
      expect(tokens).toEqual([])
      expect(mockGetTokenInfos).not.toHaveBeenCalled()
    })
  })

  describe('info', () => {
    it('should return provider info', () => {
      expect(provider.info).toEqual({
        name: 'Bungee',
        logoUrl: expect.stringContaining('bungee-logo.png'),
      })
    })
  })

  describe('decodeBridgeHook', () => {
    it('should return bridging id', async () => {
      await expect(provider.decodeBridgeHook({} as unknown as latestAppData.CoWHook)).rejects.toThrowError(
        'Not implemented',
      )
    })
  })

  describe('getBridgingId', () => {
    it('should return bridging id', async () => {
      const bridgingId = await provider.getBridgingId('123', '123', 1)
      expect(bridgingId).toEqual('123')
    })
  })

  describe('getExplorerUrl', () => {
    it('should return explorer url', () => {
      expect(provider.getExplorerUrl('123')).toEqual('https://socketscan.io/tx/123')
    })
  })

  describe('getStatus', () => {
    it('should return status', async () => {
      await expect(provider.getStatus('123')).rejects.toThrowError('Not implemented')
    })
  })

  describe('getCancelBridgingTx', () => {
    it('should return cancel bridging tx', async () => {
      await expect(provider.getCancelBridgingTx('123')).rejects.toThrowError('Not implemented')
    })
  })

  describe('getRefundBridgingTx', () => {
    it('should return refund bridging tx', async () => {
      await expect(provider.getRefundBridgingTx('123')).rejects.toThrowError('Not implemented')
    })
  })
})
