import { NATIVE_CURRENCY_ADDRESS, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
import { determineIntermediateToken } from './determineIntermediateToken'
import { BridgeProviderQuoteError } from '../errors'

describe('determineIntermediateToken', () => {
  // Sample tokens for testing
  const cowMainnet: TokenInfo = {
    chainId: SupportedChainId.MAINNET,
    address: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB', // COW on Mainnet
    decimals: 18,
    name: 'COW',
    symbol: 'COW',
  }

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
      await expect(
        determineIntermediateToken(SupportedChainId.MAINNET, cowMainnet.address, [], undefined, true),
      ).rejects.toThrow(BridgeProviderQuoteError)
    })

    it('should throw error when intermediateTokens is empty array', async () => {
      await expect(
        determineIntermediateToken(SupportedChainId.MAINNET, cowMainnet.address, [], undefined, true),
      ).rejects.toThrow(BridgeProviderQuoteError)
    })
  })

  describe('priority level: HIGHEST (same as sell token)', () => {
    it('should prioritize sell token over others', async () => {
      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [cowMainnet, randomToken, wethMainnet, usdcMainnet],
        undefined,
        true,
      )

      expect(result).toBe(cowMainnet)
    })
  })

  describe('priority level: HIGH (stablecoins)', () => {
    it('should prioritize USDC over other tokens', async () => {
      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [randomToken, wethMainnet, usdcMainnet],
        undefined,
        true,
      )

      expect(result).toBe(usdcMainnet)
    })

    it('should prioritize USDT over other tokens', async () => {
      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [randomToken, wethMainnet, usdtMainnet],
        undefined,
        true,
      )

      expect(result).toBe(usdtMainnet)
    })

    it('should prioritize first stablecoin when both USDC and USDT present', async () => {
      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [usdcMainnet, usdtMainnet],
        undefined,
        true,
      )

      expect(result).toBe(usdcMainnet)

      // Order matters - maintain stable sort
      const result2 = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [usdtMainnet, usdcMainnet],
        undefined,
        true,
      )

      expect(result2).toBe(usdtMainnet)
    })

    it('should prioritize stablecoins on different chains', async () => {
      const result = await determineIntermediateToken(
        SupportedChainId.ARBITRUM_ONE,
        cowMainnet.address,
        [randomToken, usdcArbitrum],
        undefined,
        true,
      )

      expect(result).toBe(usdcArbitrum)
    })
  })

  describe('priority level: MEDIUM (correlated tokens)', () => {
    it('should prioritize correlated tokens over non-correlated', async () => {
      const getCorrelatedTokens = async () => [wethMainnet.address]

      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [randomToken, wethMainnet],
        getCorrelatedTokens,
        true,
      )

      expect(result).toBe(wethMainnet)
    })

    it('should prioritize stablecoins over correlated tokens', async () => {
      const getCorrelatedTokens = async () => [wethMainnet.address]

      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [wethMainnet, usdcMainnet],
        getCorrelatedTokens,
        true,
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

      const getCorrelatedTokens = async () => [wethMainnet.address, daiToken.address]

      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [randomToken, wethMainnet, daiToken],
        getCorrelatedTokens,
        true,
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
        cowMainnet.address,
        [randomToken, wethMainnet],
        getCorrelatedTokens,
        true,
      )

      // Should fallback and still work
      expect(result).toBe(randomToken)
    })
  })

  describe('priority level: LOW (native tokens)', () => {
    it('should prioritize native token over random tokens', async () => {
      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [randomToken, nativeEth],
        undefined,
        true,
      )

      expect(result).toBe(nativeEth)
    })

    it('should prioritize stablecoins over native token', async () => {
      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [nativeEth, usdcMainnet],
        undefined,
        true,
      )

      expect(result).toBe(usdcMainnet)
    })

    it('should prioritize correlated tokens over native token', async () => {
      const getCorrelatedTokens = async () => [wethMainnet.address]

      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [nativeEth, wethMainnet],
        getCorrelatedTokens,
        true,
      )

      expect(result).toBe(wethMainnet)
    })
  })

  describe('priority level: LOWEST (other tokens)', () => {
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

      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [token1, token2],
        undefined,
        true,
      )

      expect(result).toBe(token1)
    })
  })

  describe('allowIntermediateEqSellToken flag', () => {
    it('should filter out sell token when allowIntermediateEqSellToken is false', async () => {
      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [cowMainnet, usdcMainnet, randomToken],
        undefined,
        false,
      )

      // cowMainnet should be filtered out, USDC should be selected (HIGH priority)
      expect(result).toBe(usdcMainnet)
    })

    it('should throw when single intermediate token equals sell token and allowIntermediateEqSellToken is falsy', async () => {
      await expect(
        determineIntermediateToken(SupportedChainId.MAINNET, cowMainnet.address, [cowMainnet], undefined, false),
      ).rejects.toThrow(BridgeProviderQuoteError)
    })

    it('should keep sell token when allowIntermediateEqSellToken is true', async () => {
      const result = await determineIntermediateToken(
        SupportedChainId.MAINNET,
        cowMainnet.address,
        [cowMainnet, usdcMainnet, randomToken],
        undefined,
        true,
      )

      // cowMainnet should be kept and get HIGHEST priority
      expect(result).toBe(cowMainnet)
    })
  })
})
