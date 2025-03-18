import { AdditionalTargetChainId, SupportedChainId } from '../../../chains'
import { SuggestedFeesResponse } from './AcrossApi'
import { getChainConfigs, getTokenSymbol, getTokenAddress, toBridgeQuoteResult, pctToBps, applyFee } from './util'

describe('Across Utils', () => {
  describe('getChainConfigs', () => {
    it('should return chain configs for supported chains', () => {
      const result = getChainConfigs(SupportedChainId.MAINNET, AdditionalTargetChainId.OPTIMISM)
      expect(result?.sourceChainConfig).toHaveProperty('tokens')
      expect(result?.sourceChainConfig).toHaveProperty('chainId')
      expect(result?.targetChainConfig).toHaveProperty('tokens')
      expect(result?.targetChainConfig).toHaveProperty('chainId')
    })

    it('should return undefined for unknown chains', () => {
      const result = getChainConfigs(999999 as SupportedChainId, SupportedChainId.SEPOLIA)
      expect(result).toBeUndefined()
    })

    it('should return undefined for sepolia', () => {
      // Sepolia is not supported by Across
      const result = getChainConfigs(SupportedChainId.MAINNET, SupportedChainId.SEPOLIA)
      expect(result).toBeUndefined()
    })
  })

  describe('getTokenSymbol and getTokenAddress', () => {
    const mockChainConfig = {
      chainId: SupportedChainId.MAINNET,
      tokens: {
        'TEST-TOKEN': '0x1234567890123456789012345678901234567890',
      },
    }

    it('should return token symbol for valid address', () => {
      const symbol = getTokenSymbol('0x1234567890123456789012345678901234567890', mockChainConfig)
      expect(symbol).toBe('TEST-TOKEN')
    })

    it('should return undefined for invalid address', () => {
      const symbol = getTokenSymbol('0x0000000000000000000000000000000000000000', mockChainConfig)
      expect(symbol).toBeUndefined()
    })

    it('should return token address for valid symbol', () => {
      const address = getTokenAddress('TEST-TOKEN', mockChainConfig)
      expect(address).toBe('0x1234567890123456789012345678901234567890')
    })

    it('should return undefined for invalid symbol', () => {
      const address = getTokenAddress('INVALID-TOKEN', mockChainConfig)
      expect(address).toBeUndefined()
    })
  })

  describe('toBridgeQuoteResult', () => {
    const mockAmount = 1000000000000000000n // 1 ETH
    const mockSuggestedFees: SuggestedFeesResponse = {
      totalRelayFee: {
        pct: '100000000000000000', // 0.1 or 10% in contract format
        total: '100000000000000000',
      },
      relayerCapitalFee: {
        pct: '150000000000000000', // 0.1 or 15% in contract format
        total: '150000000000000000',
      },
      relayerGasFee: {
        pct: '200000000000000000', // 0.1 or 20% in contract format
        total: '200000000000000000',
      },
      lpFee: {
        pct: '250000000000000000', // 0.1 or 25% in contract format
        total: '250000000000000000',
      },
      timestamp: '1742111291',
      exclusiveRelayer: '0x1234567890123456789012345678901234567890',
      isAmountTooLow: false,
      quoteBlock: '1715808000',
      spokePoolAddress: '0x1234567890123456789012345678901234567890',
      exclusivityDeadline: '1742114891',
      expectedFillTimeSec: '1742111891',
      fillDeadline: '1742122091',
      limits: {
        maxDeposit: '50000000000000000000',
        maxDepositShortDelay: '40000000000000000000',
        maxDepositInstant: '30000000000000000000',
        recommendedDepositInstant: '35000000000000000000',
        minDeposit: '10000000000000000000',
      },
    }

    it('should convert to bridge quote result correctly', () => {
      const result = toBridgeQuoteResult(mockAmount, mockSuggestedFees)
      expect(result).toBeDefined()
      expect(result.buyAmount).toBe(900000000000000000n) // 0.9 (10% fee applied to 1 ETH)
      expect(result.suggestedFees).toBeDefined()
      expect(result.feeBps).toBe(1000) // 10% = 1000 bps
      expect(result.slippageBps).toBe(0)
    })
  })

  describe('pctToBps', () => {
    it('should convert percentage to basis points', () => {
      expect(pctToBps(0n)).toBe(0) // 0%
      expect(pctToBps(10000000000000000n)).toBe(100) // 1%
      expect(pctToBps(100000000000000000n)).toBe(1000) // 10%
      expect(pctToBps(1000000000000000000n)).toBe(10000) // 100%
    })
  })

  describe('applyFee', () => {
    it('should apply fee percentage correctly', () => {
      expect(applyFee(1000000000000000000n, 100000000000000000n)).toBe(900000000000000000n) // 0.9 (10% of 1 ETH)
      expect(applyFee(1000000000000000000n, 50000000000000000n)).toBe(950000000000000000n) // 0.95 (5% of 1 ETH)
      expect(applyFee(1000000000000000000n, 0n)).toBe(1000000000000000000n) // 1 (0% fee)
      expect(applyFee(0n, 100000000000000000n)).toBe(0n) // 0 (0% fee)
    })

    it('should throw an error if fee percentage exceeds 100%', () => {
      expect(() => applyFee(1000000000000000000n, 1000000000000000001n)).toThrow('Fee cannot exceed 100%')
    })
  })
})
