import { QuoteBridgeRequest } from '../../types'
import {
  toBridgeQuoteResult,
  applyBps,
  calculateFeeBps,
  decodeBungeeBridgeTxData,
  objectToSearchParams,
  getBungeeBridgeFromDisplayName,
  getDisplayNameFromBungeeBridge,
} from './util'
import { BungeeBridge, BungeeQuoteWithBuildTx } from './types'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { SupportedChainId } from '@cowprotocol/sdk-config'

describe('Bungee Utils', () => {
  describe('toBridgeQuoteResult', () => {
    const mockAmount = 1000000000000000000n // 1 ETH
    const mockBungeeQuoteWithBuildTx: BungeeQuoteWithBuildTx = {
      bungeeQuote: {
        originChainId: 1,
        destinationChainId: 137,
        userAddress: '0x123',
        receiverAddress: '0x789',
        input: {
          token: {
            chainId: 1,
            address: '0x123',
            name: 'Token 1',
            symbol: 'TOKEN1',
            decimals: 18,
            logoURI: '',
            icon: '',
          },
          amount: '1000000000000000000',
          priceInUsd: 1,
          valueInUsd: 1,
        },
        route: {
          affiliateFee: null,
          quoteId: '123',
          quoteExpiry: 1234567890,
          output: {
            token: {
              chainId: 137,
              address: '0x456',
              name: 'Token 2',
              symbol: 'TOKEN2',
              decimals: 6,
              logoURI: '',
              icon: '',
            },
            amount: '1000000',
            priceInUsd: 1,
            valueInUsd: 1,
            minAmountOut: '999900',
            effectiveReceivedInUsd: 1,
          },
          approvalData: {
            spenderAddress: '0x123',
            amount: '1000000000000000000',
            tokenAddress: '0x123',
            userAddress: '0x123',
          },
          gasFee: {
            gasToken: {
              chainId: 1,
              address: '0x123',
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              icon: '',
              logoURI: '',
              chainAgnosticId: null,
            },
            gasLimit: '100000',
            gasPrice: '1000000000',
            estimatedFee: '50000',
            feeInUsd: 1,
          },
          slippage: 0,
          estimatedTime: 300,
          routeDetails: {
            name: 'across',
            logoURI: '',
            routeFee: {
              token: {
                chainId: 1,
                address: '0x123',
                name: 'Token 1',
                symbol: 'TOKEN1',
                decimals: 18,
                logoURI: '',
                icon: '',
              },
              amount: '5000000000000000',
              feeInUsd: 1,
              priceInUsd: 1,
            },
            dexDetails: null,
          },
          refuel: null,
        },
        routeBridge: BungeeBridge.Across,
        quoteTimestamp: 1234567890,
      },
      buildTx: {
        approvalData: {
          spenderAddress: '0x123',
          amount: '1000000000000000000',
          tokenAddress: '0x123',
          userAddress: '0x123',
        },
        txData: {
          data: '0x',
          to: '0x123',
          chainId: 1,
          value: '0',
        },
        userOp: '',
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
      const result = toBridgeQuoteResult(request, slippageBps, mockBungeeQuoteWithBuildTx)

      expect(result.isSell).toBe(true)
      expect(result.quoteTimestamp).toBe(1234567890)
      expect(result.expectedFillTimeSeconds).toBe(300)
      expect(result.fees.bridgeFee).toBe(BigInt('5000000000000000'))
      expect(result.fees.destinationGasFee).toBe(BigInt(0))
      expect(result.limits.minDeposit).toBe(BigInt(0))
      expect(result.limits.maxDeposit).toBe(BigInt(0))
      expect(result.bungeeQuote).toEqual(mockBungeeQuoteWithBuildTx.bungeeQuote)
      expect(result.buildTx).toEqual(mockBungeeQuoteWithBuildTx.buildTx)
    })
  })

  describe('applyBps', () => {
    it('should apply basis points correctly', () => {
      expect(applyBps(1000000000000000000n, 30)).toBe(997000000000000000n) // 0.3% reduction
      expect(applyBps(1000000000000000000n, 100)).toBe(990000000000000000n) // 1% reduction
      expect(applyBps(1000000000000000000n, 0)).toBe(1000000000000000000n) // no reduction
    })
  })

  describe('calculateFeeBps', () => {
    it('should calculate fee basis points correctly', () => {
      expect(calculateFeeBps(100000000000000000n, 1000000000000000000n)).toBe(1000) // 10% fee
      expect(calculateFeeBps(50000000000000000n, 1000000000000000000n)).toBe(500) // 5% fee
      expect(calculateFeeBps(0n, 1000000000000000000n)).toBe(0) // 0% fee
    })

    it('should throw error if fee amount is greater than total amount', () => {
      expect(() => calculateFeeBps(2000000000000000000n, 1000000000000000000n)).toThrow(
        'Fee amount is greater than amount',
      )
    })

    it('should throw error if denominator is zero', () => {
      expect(() => calculateFeeBps(100000000000000000n, 0n)).toThrow('Denominator is 0')
    })
  })

  describe('decodeBungeeBridgeTxData', () => {
    it('should decode txData correctly', () => {
      const txData =
        '0x0000019f792ebcb900000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000018a90000000000000000000000000000000000000000000000000000000000000a2d0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000daee4d2156de6fe6f7d50ca047136d758f96a6f0000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000f299700000000000000000000000000000000000000000000000000000000000021050000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000006839de5700000000000000000000000000000000000000000000000000000000683a325dd00dfeeddeadbeef765753be7f7a64d5509974b0d678e1e3149b02f4'
      const result = decodeBungeeBridgeTxData(txData)

      // The first 4 bytes (8 hex chars) after 0x are the routeId
      expect(result.routeId).toBe('0x0000019f')
      // The rest is the encoded function data
      expect(result.encodedFunctionData).toBe(
        '0x792ebcb900000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000018a90000000000000000000000000000000000000000000000000000000000000a2d0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000daee4d2156de6fe6f7d50ca047136d758f96a6f0000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000002000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000f299700000000000000000000000000000000000000000000000000000000000021050000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000006839de5700000000000000000000000000000000000000000000000000000000683a325dd00dfeeddeadbeef765753be7f7a64d5509974b0d678e1e3149b02f4',
      )
      // The first 4 bytes of the encoded function data are the function selector
      expect(result.functionSelector).toBe('0x792ebcb9')
    })

    it('should throw error for invalid txData format', () => {
      expect(() => decodeBungeeBridgeTxData('invalidtxdata')).toThrow('Invalid txData: must start with 0x')
    })

    it('should throw error for txData that is too short', () => {
      expect(() => decodeBungeeBridgeTxData('0x123')).toThrow('Invalid txData: too short')
    })

    // the < 10 and < 8 length checks cannot be tested
    // it('should throw error for txData with insufficient data for routeId', () => {
    //   expect(() => decodeBungeeBridgeTxData('0x12345678')).toThrow('Invalid txData: insufficient data for routeId')
    // })

    it('should throw error for txData with insufficient data for function selector', () => {
      expect(() => decodeBungeeBridgeTxData('0x12345678')).toThrow(
        'Invalid txData: insufficient data for function selector',
      )
    })
  })

  describe('objectToSearchParams', () => {
    it('should convert object to URLSearchParams correctly', () => {
      const params = {
        userAddress: '0x123',
        includeBridges: ['across', 'cctp'],
        amount: '1000',
      }

      const result = objectToSearchParams(params)
      expect(result.get('userAddress')).toBe('0x123')
      expect(result.get('includeBridges')).toBe('across,cctp')
      expect(result.get('amount')).toBe('1000')
    })
  })

  describe('BungeeBridge helpers', () => {
    it('should get bridge from display name', () => {
      expect(getBungeeBridgeFromDisplayName('Across')).toBe(BungeeBridge.Across)
      expect(getBungeeBridgeFromDisplayName('Invalid')).toBeUndefined()
    })

    it('should get display name from bridge', () => {
      expect(getDisplayNameFromBungeeBridge(BungeeBridge.Across)).toBe('Across')
      expect(getDisplayNameFromBungeeBridge('Invalid' as BungeeBridge)).toBeUndefined()
    })
  })
})
