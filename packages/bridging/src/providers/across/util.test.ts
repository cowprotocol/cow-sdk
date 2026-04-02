import { QuoteBridgeRequest, BridgeStatus } from '../../types'
import {
  toBridgeQuoteResult,
  pctToBps,
  applyPctFee,
  mapAcrossStatusToBridgeStatus,
  getAcrossDepositEvents,
} from './util'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import { ACROSS_SWAP_APPROVAL_MAX_DEPOSIT_LIMIT, type SwapApprovalApiResponse } from './swapApprovalMapper'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { createAdapters } from '../../../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import stringify from 'json-stable-stringify'

describe('Across Utils', () => {
  describe('toBridgeQuoteResult', () => {
    const mockAmount = 1000000000000000000n // 1 ETH

    function padUtil(n: bigint): string {
      return n.toString(16).padStart(64, '0')
    }

    const quoteTs = 1742111291n
    const fillDl = 1742122091n
    const excl = 1742114891n
    const timingBody =
      [1n, 2n, 3n, 4n, 5n, 6n, 7n].map(padUtil).join('') +
      '0'.repeat(64) +
      padUtil(quoteTs) +
      padUtil(fillDl) +
      padUtil(excl)

    const mockSwapApproval: SwapApprovalApiResponse = {
      id: '1',
      // Quoted input size (wei / token atoms); becomes `limits.minDeposit` on the bridge quote.
      inputAmount: '10000000000000000000',
      // equals decimal-adjusted sell amount (18→6 decimals) for this scenario
      expectedOutputAmount: '1000000',
      inputToken: {
        chainId: SupportedChainId.MAINNET,
        address: '0x1234567890123456789012345678901234567890',
        decimals: 18,
        symbol: 'TK',
        name: 'Token',
      },
      outputToken: {
        chainId: SupportedChainId.POLYGON,
        address: '0x1234567890123456789012345678901234567890',
        decimals: 6,
        symbol: 'TK',
        name: 'Token',
      },
      // From API `expectedFillTime` (here matches legacy test fixture semantics)
      expectedFillTime: 1742111892,
      swapTx: {
        data: `0x110560ad${timingBody}`,
        to: '0x1234567890123456789012345678901234567890',
      },
      steps: {
        bridge: {
          outputAmount: '1000000',
          fees: {
            // PctFee: 1% = 1e16, 100% = 1e18, etc. (same as contract / `SuggestedFeesResponse` docs)
            pct: '100000000000000000', // 10% → 1e17
            amount: '100000000000000000',
            details: {
              type: 'across',
              relayerCapital: {
                pct: '150000000000000000', // 15% in contract format
                amount: '150000000000000000',
              },
              destinationGas: {
                pct: '200000000000000000', // 20% in contract format
                amount: '200000000000000000',
              },
              lp: {
                pct: '250000000000000000', // 25% in contract format
                amount: '250000000000000000',
              },
            },
          },
        },
      },
    }

    it('should convert to bridge quote result correctly', () => {
      const request: QuoteBridgeRequest = {
        kind: OrderKind.SELL,
        sellTokenChainId: SupportedChainId.MAINNET,
        sellTokenAddress: '0x1234567890123456789012345678901234567890',
        sellTokenDecimals: 18,
        buyTokenChainId: SupportedChainId.POLYGON,
        buyTokenAddress: '0x1234567890123456789012345678901234567890',
        buyTokenDecimals: 6,
        amount: mockAmount,
        appCode: 'test',
        account: '0x1234567890123456789012345678901234567890',
        signer: '0x1234567890123456789012345678901234567890',
      }

      const slippageBps = 30
      const result = toBridgeQuoteResult(request as unknown as QuoteBridgeRequest, slippageBps, mockSwapApproval)

      const expected: AcrossQuoteResult = {
        id: '1',
        isSell: true,
        quoteBody: stringify(mockSwapApproval),
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
          },
          slippageBps: 30,
        },
        quoteTimestamp: 1742111291,
        expectedFillTimeSeconds: 1742111892,
        fees: {
          bridgeFee: 150000000000000000n,
          destinationGasFee: 200000000000000000n,
        },
        limits: {
          minDeposit: 10000000000000000000n, // from `swapApproval.inputAmount`
          // Swap API has no `limits.maxDeposit`; implementation uses max uint256 (see constant JSDoc)
          maxDeposit: BigInt(ACROSS_SWAP_APPROVAL_MAX_DEPOSIT_LIMIT),
        },
        swapApproval: mockSwapApproval,
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

  describe('mapAcrossStatusToBridgeStatus', () => {
    it('should map Across deposit status to Bridge status', () => {
      expect(mapAcrossStatusToBridgeStatus('filled')).toBe(BridgeStatus.EXECUTED)
      expect(mapAcrossStatusToBridgeStatus('pending')).toBe(BridgeStatus.IN_PROGRESS)
      expect(mapAcrossStatusToBridgeStatus('expired')).toBe(BridgeStatus.EXPIRED)
      expect(mapAcrossStatusToBridgeStatus('refunded')).toBe(BridgeStatus.REFUND)
      expect(mapAcrossStatusToBridgeStatus('slowFillRequested')).toBe(BridgeStatus.EXECUTED)
    })
  })

  const adapters = createAdapters()
  const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

  adapterNames.forEach((adapterName) => {
    describe(`getAcrossDepositEvents (with ${adapterName})`, () => {
      beforeEach(() => {
        const adapter = adapters[adapterName]

        setGlobalAdapter(adapter)
      })

      it('should return empty array if passing nothing', () => {
        const result = getAcrossDepositEvents(SupportedChainId.MAINNET, [])
        expect(result).toEqual([])
      })
    })
  })
})
