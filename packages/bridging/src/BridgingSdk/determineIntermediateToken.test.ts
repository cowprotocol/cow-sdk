import { EVM_NATIVE_CURRENCY_ADDRESS, SupportedChainId, TokenInfo } from '@cowprotocol/sdk-config'
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
    address: EVM_NATIVE_CURRENCY_ADDRESS,
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

  const usdtArbitrum: TokenInfo = {
    chainId: SupportedChainId.ARBITRUM_ONE,
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT on Arbitrum
    decimals: 6,
    name: 'USDT',
    symbol: 'USDT',
  }

  // A non-stablecoin destination token (not present in PRIORITY_STABLECOIN_TOKENS).
  // Used as the default destination so the SUPERIOR tier never triggers unintentionally.
  const cowArbitrum: TokenInfo = {
    chainId: SupportedChainId.ARBITRUM_ONE,
    address: '0xcccccccccccccccccccccccccccccccccccccccc', // COW on Arbitrum (non-stable)
    decimals: 18,
    name: 'COW',
    symbol: 'COW',
  }

  // Neutral destination that never matches a priority stablecoin, so existing
  // priority expectations (HIGHEST/HIGH/MEDIUM/LOW/LOWEST) are preserved.
  const NEUTRAL_DESTINATION = {
    destinationChainId: cowArbitrum.chainId,
    destinationTokenAddress: cowArbitrum.address,
  }

  describe('error handling', () => {
    it('should throw error when no intermediate tokens provided', async () => {
      await expect(
        determineIntermediateToken({
          sourceChainId: SupportedChainId.MAINNET,
          sourceTokenAddress: cowMainnet.address,
          ...NEUTRAL_DESTINATION,
          intermediateTokens: [],
          allowIntermediateEqSellToken: true,
        }),
      ).rejects.toThrow(BridgeProviderQuoteError)
    })

    it('should throw error when intermediateTokens is empty array', async () => {
      await expect(
        determineIntermediateToken({
          sourceChainId: SupportedChainId.MAINNET,
          sourceTokenAddress: cowMainnet.address,
          ...NEUTRAL_DESTINATION,
          intermediateTokens: [],
          allowIntermediateEqSellToken: true,
        }),
      ).rejects.toThrow(BridgeProviderQuoteError)
    })
  })

  describe('priority level: SUPERIOR (stablecoin matching destination token)', () => {
    it('should prioritize the stablecoin whose symbol matches the destination stablecoin', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        destinationChainId: usdcArbitrum.chainId,
        destinationTokenAddress: usdcArbitrum.address, // USDC on Arbitrum
        intermediateTokens: [usdtMainnet, usdcMainnet], // USDT listed first
        allowIntermediateEqSellToken: true,
      })

      // USDC matches the destination USDC symbol -> SUPERIOR, beats USDT (HIGH)
      expect(result).toBe(usdcMainnet)
    })

    it('should match the destination stablecoin by symbol for USDT as well', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        destinationChainId: usdtArbitrum.chainId,
        destinationTokenAddress: usdtArbitrum.address, // USDT on Arbitrum
        intermediateTokens: [usdcMainnet, usdtMainnet], // USDC listed first
        allowIntermediateEqSellToken: true,
      })

      // USDT matches the destination USDT symbol -> SUPERIOR, beats USDC (HIGH)
      expect(result).toBe(usdtMainnet)
    })

    it('should rank the destination-matching stablecoin above the sell-token match', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: usdtMainnet.address, // USDT would be HIGHEST (same as sell)
        destinationChainId: usdcArbitrum.chainId,
        destinationTokenAddress: usdcArbitrum.address, // USDC on Arbitrum
        intermediateTokens: [usdtMainnet, usdcMainnet],
        allowIntermediateEqSellToken: true,
      })

      // SUPERIOR (USDC matches destination) beats HIGHEST (USDT matches sell token)
      expect(result).toBe(usdcMainnet)
    })

    it('should not apply SUPERIOR when the destination token is not a known stablecoin', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION, // non-stable destination
        intermediateTokens: [usdtMainnet, usdcMainnet],
        allowIntermediateEqSellToken: true,
      })

      // Both candidates fall back to HIGH; first in original order wins
      expect(result).toBe(usdtMainnet)
    })
  })

  describe('priority level: HIGHEST (same as sell token)', () => {
    it('should prioritize sell token over others', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [cowMainnet, randomToken, wethMainnet, usdcMainnet],
        allowIntermediateEqSellToken: true,
      })

      expect(result).toBe(cowMainnet)
    })
  })

  describe('priority level: HIGH (stablecoins)', () => {
    it('should prioritize USDC over other tokens', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [randomToken, wethMainnet, usdcMainnet],
        allowIntermediateEqSellToken: true,
      })

      expect(result).toBe(usdcMainnet)
    })

    it('should prioritize USDT over other tokens', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [randomToken, wethMainnet, usdtMainnet],
        allowIntermediateEqSellToken: true,
      })

      expect(result).toBe(usdtMainnet)
    })

    it('should prioritize first stablecoin when both USDC and USDT present', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [usdcMainnet, usdtMainnet],
        allowIntermediateEqSellToken: true,
      })

      expect(result).toBe(usdcMainnet)

      // Order matters - maintain stable sort
      const result2 = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [usdtMainnet, usdcMainnet],
        allowIntermediateEqSellToken: true,
      })

      expect(result2).toBe(usdtMainnet)
    })

    it('should prioritize stablecoins on different chains', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.ARBITRUM_ONE,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [randomToken, usdcArbitrum],
        allowIntermediateEqSellToken: true,
      })

      expect(result).toBe(usdcArbitrum)
    })
  })

  describe('priority level: MEDIUM (correlated tokens)', () => {
    it('should prioritize correlated tokens over non-correlated', async () => {
      const getCorrelatedTokens = async () => [wethMainnet.address]

      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [randomToken, wethMainnet],
        getCorrelatedTokens,
        allowIntermediateEqSellToken: true,
      })

      expect(result).toBe(wethMainnet)
    })

    it('should prioritize stablecoins over correlated tokens', async () => {
      const getCorrelatedTokens = async () => [wethMainnet.address]

      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [wethMainnet, usdcMainnet],
        getCorrelatedTokens,
        allowIntermediateEqSellToken: true,
      })

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

      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [randomToken, wethMainnet, daiToken],
        getCorrelatedTokens,
        allowIntermediateEqSellToken: true,
      })

      // Should return first correlated token in original order
      expect(result).toBe(wethMainnet)
    })

    it('should gracefully handle getCorrelatedTokens failure', async () => {
      const getCorrelatedTokens = async () => {
        throw new Error('API error')
      }

      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [randomToken, wethMainnet],
        getCorrelatedTokens,
        allowIntermediateEqSellToken: true,
      })

      // Should fallback and still work
      expect(result).toBe(randomToken)
    })
  })

  describe('priority level: LOW (native tokens)', () => {
    it('should prioritize native token over random tokens', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [randomToken, nativeEth],
        allowIntermediateEqSellToken: true,
      })

      expect(result).toBe(nativeEth)
    })

    it('should prioritize stablecoins over native token', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [nativeEth, usdcMainnet],
        allowIntermediateEqSellToken: true,
      })

      expect(result).toBe(usdcMainnet)
    })

    it('should prioritize correlated tokens over native token', async () => {
      const getCorrelatedTokens = async () => [wethMainnet.address]

      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [nativeEth, wethMainnet],
        getCorrelatedTokens,
        allowIntermediateEqSellToken: true,
      })

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

      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [token1, token2],
        allowIntermediateEqSellToken: true,
      })

      expect(result).toBe(token1)
    })
  })

  describe('allowIntermediateEqSellToken flag', () => {
    it('should filter out sell token when allowIntermediateEqSellToken is false', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [cowMainnet, usdcMainnet, randomToken],
        allowIntermediateEqSellToken: false,
      })

      // cowMainnet should be filtered out, USDC should be selected (HIGH priority)
      expect(result).toBe(usdcMainnet)
    })

    it('should keep sell token when allowIntermediateEqSellToken is true', async () => {
      const result = await determineIntermediateToken({
        sourceChainId: SupportedChainId.MAINNET,
        sourceTokenAddress: cowMainnet.address,
        ...NEUTRAL_DESTINATION,
        intermediateTokens: [cowMainnet, usdcMainnet, randomToken],
        allowIntermediateEqSellToken: true,
      })

      // cowMainnet should be kept and get HIGHEST priority
      expect(result).toBe(cowMainnet)
    })
  })
})
