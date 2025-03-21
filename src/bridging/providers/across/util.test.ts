import { OrderKind } from '@cowprotocol/contracts'
import { AdditionalTargetChainId, SupportedChainId } from '../../../chains'
import { QuoteBridgeRequest } from '../../types'
import { SuggestedFeesResponse } from './AcrossApi'
import { getChainConfigs, getTokenSymbol, getTokenAddress, toBridgeQuoteResult, pctToBps, applyPctFee } from './util'
import { AcrossQuoteResult } from './AcrossBridgeProvider'

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
      expectedFillTimeSec: '1742111892',
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
      const request: QuoteBridgeRequest = {
        kind: OrderKind.SELL,
        sellTokenChainId: SupportedChainId.MAINNET,
        sellTokenAddress: '0x1234567890123456789012345678901234567890',
        sellTokenDecimals: 18,
        buyTokenChainId: AdditionalTargetChainId.POLYGON,
        buyTokenAddress: '0x1234567890123456789012345678901234567890',
        buyTokenDecimals: 6,
        amount: mockAmount,
        appCode: 'test',
        account: '0x1234567890123456789012345678901234567890',
        signer: '0x1234567890123456789012345678901234567890',
      }

      const slippageBps = 30
      const result = toBridgeQuoteResult(request as unknown as QuoteBridgeRequest, slippageBps, mockSuggestedFees)

      const expected: AcrossQuoteResult = {
        isSell: true,
        amountsAndCosts: {
          beforeFee: { sellAmount: 1000000000000000000n, buyAmount: 1000000n }, // 1:1 (different decimals)
          afterFee: { sellAmount: 1000000000000000000n, buyAmount: 900000n }, // 1:0.9 (10% fee applied)
          afterSlippage: { sellAmount: 1000000000000000000n, buyAmount: 897300n }, // 1:0.8973 (30 BPS = 0.3% slippage applied)
          costs: {
            bridgingFee: {
              feeBps: 1000,
              amountInSellCurrency: 100000000000000000n,
              amountInBuyCurrency: 100000n,
            },
            slippageBps: 30,
          },
        },
        quoteTimestamp: 1742111291,
        expectedFillTimeSeconds: 1742111892,
        suggestedFees: mockSuggestedFees, // Returns the original suggested fees
      }

      expect(result).toEqual(expected)
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
      expect(applyPctFee(1000000000000000000n, 100000000000000000n)).toBe(900000000000000000n) // 0.9 (10% of 1 ETH)
      expect(applyPctFee(1000000000000000000n, 50000000000000000n)).toBe(950000000000000000n) // 0.95 (5% of 1 ETH)
      expect(applyPctFee(1000000000000000000n, 0n)).toBe(1000000000000000000n) // 1 (0% fee)
      expect(applyPctFee(0n, 100000000000000000n)).toBe(0n) // 0 (0% fee)
    })

    it('should throw an error if fee percentage exceeds 100%', () => {
      expect(() => applyPctFee(1000000000000000000n, 1000000000000000001n)).toThrow('Fee cannot exceed 100%')
    })
  })
})
