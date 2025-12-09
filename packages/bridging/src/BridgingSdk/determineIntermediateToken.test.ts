import { NATIVE_CURRENCY_ADDRESS, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { determineIntermediateToken } from './determineIntermediateToken'
import { BridgeProviderQuoteError } from '../errors'

describe('determineIntermediateToken', () => {
  // Sample tokens for testing
  const usdcMainnet: TokenInfo = {
    chainId: SupportedChainId.MAINNET,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on Mainnet
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
  }

  const usdtMainnet: TokenInfo = {
    chainId: SupportedChainId.MAINNET,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Mainnet
    decimals: 6,
    name: 'USDT',
    symbol: 'USDT',
  }

  const wethMainnet: TokenInfo = {
    chainId: SupportedChainId.MAINNET,
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH on Mainnet
    decimals: 18,
    name: 'WETH',
    symbol: 'WETH',
  }

  const nativeEth: TokenInfo = {
    chainId: SupportedChainId.MAINNET,
    address: NATIVE_CURRENCY_ADDRESS,
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  }

  const randomToken: TokenInfo = {
    chainId: SupportedChainId.MAINNET,
    address: '0x1111111111111111111111111111111111111111',
    decimals: 18,
    name: 'Random',
    symbol: 'RND',
  }

  const usdcArbitrum: TokenInfo = {
    chainId: SupportedChainId.ARBITRUM_ONE,
    address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC on Arbitrum
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
  }

  describe('error handling', () => {
    it('should throw error when no intermediate tokens provided', async () => {
      await expect(determineIntermediateToken(SupportedChainId.MAINNET, [])).rejects.toThrow(BridgeProviderQuoteError)
    })

    it('should throw error when intermediateTokens is empty array', async () => {
      await expect(determineIntermediateToken(SupportedChainId.MAINNET, [])).rejects.toThrow(BridgeProviderQuoteError)
    })
  })

  describe('priority level: HIGHEST (stablecoins)', () => {
    it('should prioritize USDC over other tokens', async () => {
      const result = await determineIntermediateToken(SupportedChainId.MAINNET, [randomToken, wethMainnet, usdcMainnet])

      expect(result).toBe(usdcMainnet)
    })

    it('should prioritize USDT over other tokens', async () => {
      const result = await determineIntermediateToken(SupportedChainId.MAINNET, [randomToken, wethMainnet, usdtMainnet])

      expect(result).toBe(usdtMainnet)
    })

    it('should prioritize first stablecoin when both USDC and USDT present', async () => {
      const result = await determineIntermediateToken(SupportedChainId.MAINNET, [usdcMainnet, usdtMainnet])

      expect(result).toBe(usdcMainnet)

      // Order matters - maintain stable sort
      const result2 = await determineIntermediateToken(SupportedChainId.MAINNET, [usdtMainnet, usdcMainnet])

      expect(result2).toBe(usdtMainnet)
    })

    it('should prioritize stablecoins on different chains', async () => {
      const result = await determineIntermediateToken(SupportedChainId.ARBITRUM_ONE, [randomToken, usdcArbitrum])

      expect(result).toBe(usdcArbitrum)
    })
  })

  describe('priority level: HIGH (correlated tokens)', () => {
    it('should prioritize correlated tokens over non-correlated', async () => {
      const getCorrelatedTokens = async () => [wethMainnet]

      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        [randomToken, wethMainnet],
        getCorrelatedTokens,
      )

      expect(result).toBe(wethMainnet)
    })

    it('should prioritize stablecoins over correlated tokens', async () => {
      const getCorrelatedTokens = async () => [wethMainnet]

      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        [wethMainnet, usdcMainnet],
        getCorrelatedTokens,
      )

      expect(result).toBe(usdcMainnet)
    })

    it('should handle multiple correlated tokens with stable sort', async () => {
      const daiToken: TokenInfo = {
        chainId: SupportedChainId.MAINNET,
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        name: 'DAI',
        symbol: 'DAI',
      }

      const getCorrelatedTokens = async () => [wethMainnet, daiToken]

      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        [randomToken, wethMainnet, daiToken],
        getCorrelatedTokens,
      )

      // Should return first correlated token in original order
      expect(result).toBe(wethMainnet)
    })

    it('should gracefully handle getCorrelatedTokens failure', async () => {
      const getCorrelatedTokens = async () => {
        throw new Error('API error')
      }

      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        [randomToken, wethMainnet],
        getCorrelatedTokens,
      )

      // Should fallback and still work
      expect(result).toBe(randomToken)
    })
  })

  describe('priority level: MEDIUM (native tokens)', () => {
    it('should prioritize native token over random tokens', async () => {
      const result = await determineIntermediateToken(SupportedChainId.MAINNET, [randomToken, nativeEth])

      expect(result).toBe(nativeEth)
    })

    it('should prioritize stablecoins over native token', async () => {
      const result = await determineIntermediateToken(SupportedChainId.MAINNET, [nativeEth, usdcMainnet])

      expect(result).toBe(usdcMainnet)
    })

    it('should prioritize correlated tokens over native token', async () => {
      const getCorrelatedTokens = async () => [wethMainnet]

      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        [nativeEth, wethMainnet],
        getCorrelatedTokens,
      )

      expect(result).toBe(wethMainnet)
    })
  })

  describe('priority level: LOW (other tokens)', () => {
    it('should return first token when all have low priority', async () => {
      const token1: TokenInfo = {
        chainId: SupportedChainId.MAINNET,
        address: '0x1111111111111111111111111111111111111111',
        decimals: 18,
        name: 'Token1',
      }

      const token2: TokenInfo = {
        chainId: SupportedChainId.MAINNET,
        address: '0x2222222222222222222222222222222222222222',
        decimals: 18,
        name: 'Token2',
      }

      const result = await determineIntermediateToken(SupportedChainId.MAINNET, [token1, token2])

      expect(result).toBe(token1)
    })
  })
})
