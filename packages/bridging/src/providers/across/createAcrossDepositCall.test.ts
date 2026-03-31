import { createAcrossDepositCall, addressToBytes32 } from './createAcrossDepositCall'
import { QuoteBridgeRequest } from '../../types'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import { SuggestedFeesResponse } from './types'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../../tests/setup'
import { ACROSS_SPOKE_POOL_PERIPHERY_CONTRACT_ADDRESSES, ACROSS_SPOKE_POOL_CONTRACT_ADDRESSES } from './const/contracts'

jest.mock('@cowprotocol/sdk-cow-shed', () => ({
  CowShedSdk: jest.fn().mockImplementation(() => ({
    getCowShedAccount: jest.fn(() => '0xCowShedAccount'),
  })),
}))

const mockSuggestedFees: SuggestedFeesResponse = {
  id: 'test-quote-id',
  outputAmount: '1000000000',
  inputToken: { chainId: 1, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  outputToken: { chainId: 56, address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
  totalRelayFee: { pct: '100000000000000000', total: '100000000000000000' },
  relayerCapitalFee: { pct: '500000000000000000', total: '500000000000000000' },
  relayerGasFee: { pct: '500000000000000000', total: '500000000000000000' },
  lpFee: { pct: '300000000000000000', total: '300000000000000000' },
  timestamp: '1234567890',
  isAmountTooLow: false,
  quoteBlock: '12345',
  spokePoolAddress: '0xSpokePool',
  exclusiveRelayer: '0x0000000000000000000000000000000000000000',
  exclusivityDeadline: '1234567900',
  estimatedFillTimeSec: '300',
  fillDeadline: '1234568000',
  limits: {
    minDeposit: '1000000',
    maxDeposit: '1000000000000',
    maxDepositInstant: '100000000',
    maxDepositShortDelay: '500000000',
    recommendedDepositInstant: '50000000',
  },
}

/** Fixture Across SwapProxy — real tests use on-chain `swapProxy()` via the provider. */
const TEST_SWAP_PROXY = '0x1111111111111111111111111111111111111111'

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe(`createAcrossDepositCall with ${adapterName}`, () => {
    let cowShedSdk: CowShedSdk
    let mockEncodeFunction: jest.Mock

    beforeEach(() => {
      jest.clearAllMocks()
      const adapter = adapters[adapterName]

      mockEncodeFunction = jest.fn().mockReturnValue('0xmockEncoded')
      adapter.utils.encodeFunction = mockEncodeFunction as any
      adapter.utils.encodeAbi = jest.fn().mockReturnValue('0xmockEncodedMessage') as any

      setGlobalAdapter(adapter)
      cowShedSdk = new CowShedSdk()
    })

    function makeRequest(overrides: Partial<QuoteBridgeRequest> = {}): QuoteBridgeRequest {
      return {
        kind: OrderKind.SELL,
        sellTokenChainId: SupportedChainId.MAINNET,
        sellTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        sellTokenDecimals: 6,
        buyTokenChainId: SupportedChainId.BNB,
        buyTokenAddress: '0x55d398326f99059fF775485246999027B3197955',
        buyTokenDecimals: 18,
        amount: 1000000000n,
        account: '0x1234567890123456789012345678901234567890',
        receiver: '0x9876543210987654321098765432109876543210',
        appCode: 'test',
        signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
        ...overrides,
      }
    }

    function makeQuote(overrides: Partial<AcrossQuoteResult> = {}): AcrossQuoteResult {
      return {
        isSell: true,
        amountsAndCosts: {
          beforeFee: { sellAmount: 1000000000n, buyAmount: 1000000000000000000000n },
          afterFee: { sellAmount: 1000000000n, buyAmount: 900000000000000000000n },
          afterSlippage: { sellAmount: 1000000000n, buyAmount: 900000000000000000000n },
          costs: {
            bridgingFee: {
              feeBps: 1000,
              amountInSellCurrency: 100000000n,
              amountInBuyCurrency: 100000000000000000000n,
            },
          },
          slippageBps: 0,
        },
        quoteTimestamp: 1234567890,
        expectedFillTimeSeconds: 300,
        fees: {
          bridgeFee: 50000000n,
          destinationGasFee: 50000000n,
        },
        limits: {
          minDeposit: 1000000n,
          maxDeposit: 1000000000000n,
        },
        suggestedFees: mockSuggestedFees,
        ...overrides,
      }
    }

    it('should return two EvmCalls: transfer to SwapProxy + swapAndBridge', () => {
      const request = makeRequest()
      const quote = makeQuote()
      const result = createAcrossDepositCall({
        request,
        quote,
        cowShedSdk,
        swapProxyAddress: TEST_SWAP_PROXY,
      })

      expect(result).toHaveLength(2)

      // Call 1: ERC20.transfer from cow-shed to SwapProxy:
      expect(result[0]?.to).toBe(request.sellTokenAddress)
      expect(result[0]?.value).toBe(0n)

      // Call 2: swapAndBridge targets the periphery:
      const expectedPeriphery = ACROSS_SPOKE_POOL_PERIPHERY_CONTRACT_ADDRESSES[request.sellTokenChainId]
      expect(result[1]?.to).toBe(expectedPeriphery)
      expect(result[1]?.value).toBe(0n)
    })

    it('should encode transfer(swapProxy, prefund) then swapAndBridge', () => {
      const request = makeRequest()
      const quote = makeQuote()
      createAcrossDepositCall({ request, quote, cowShedSdk, swapProxyAddress: TEST_SWAP_PROXY })

      // encodeFunction call order: balanceOf (no-op swap calldata), transfer, swapAndBridge
      const [balanceOfCall, transferCall, swapAndBridgeCall] = mockEncodeFunction.mock.calls;

      expect(balanceOfCall?.[1]).toBe('balanceOf')

      expect(transferCall?.[1]).toBe('transfer')
      expect(transferCall?.[2]).toEqual([TEST_SWAP_PROXY, request.amount])

      expect(swapAndBridgeCall?.[1]).toBe('swapAndBridge')
    })

    it('should encode swapAndBridge with correct SwapAndDepositData struct', () => {
      const request = makeRequest()
      const quote = makeQuote()
      createAcrossDepositCall({ request, quote, cowShedSdk, swapProxyAddress: TEST_SWAP_PROXY })

      // Third call to encodeFunction is swapAndBridge
      const swapAndBridgeCall = mockEncodeFunction.mock.calls[2]
      expect(swapAndBridgeCall[1]).toBe('swapAndBridge')

      const [swapAndDepositData] = swapAndBridgeCall[2]

      expect(swapAndDepositData.swapToken).toBe(request.sellTokenAddress)

      // Periphery must not transferFrom cow-shed, we already prefunded `SwapProxy`:
      expect(swapAndDepositData.swapTokenAmount).toBe(0n)

      // Same value as getSuggestedFees `amount`, surplus increases output proportionally:
      expect(swapAndDepositData.minExpectedInputTokenAmount).toBe(request.amount)

      expect(swapAndDepositData.enableProportionalAdjustment).toBe(true)
      expect(swapAndDepositData.nonce).toBe(0n)
      expect(swapAndDepositData.exchange).toBe(request.sellTokenAddress)
      expect(swapAndDepositData.transferType).toBe(0) // APPROVAL (no-op swap path inside SwapProxy)

      const spokePoolAddress = ACROSS_SPOKE_POOL_CONTRACT_ADDRESSES[request.sellTokenChainId]
      expect(swapAndDepositData.spokePool).toBe(spokePoolAddress)
    })

    it('should encode BaseDepositData with correct bytes32 conversions and afterSlippage outputAmount', () => {
      const request = makeRequest()
      const quote = makeQuote()
      createAcrossDepositCall({ request, quote, cowShedSdk, swapProxyAddress: TEST_SWAP_PROXY })

      const swapAndBridgeCall = mockEncodeFunction.mock.calls[2]
      const { depositData } = swapAndBridgeCall[2][0]

      expect(depositData.inputToken).toBe(request.sellTokenAddress)
      expect(depositData.outputToken).toBe(addressToBytes32(request.buyTokenAddress))
      // Must match quote.amountsAndCosts.afterSlippage.buyAmount:
      expect(depositData.outputAmount).toBe(quote.amountsAndCosts.afterSlippage.buyAmount)
      expect(depositData.depositor).toBe('0xCowShedAccount')
      expect(depositData.recipient).toBe(addressToBytes32('0x9876543210987654321098765432109876543210'))
      expect(depositData.destinationChainId).toBe(BigInt(request.buyTokenChainId))
      expect(depositData.exclusiveRelayer).toBe(addressToBytes32(mockSuggestedFees.exclusiveRelayer))
      expect(depositData.quoteTimestamp).toBe(Number(mockSuggestedFees.timestamp))
      expect(depositData.fillDeadline).toBe(Number(mockSuggestedFees.fillDeadline))
      expect(depositData.exclusivityParameter).toBe(Number(mockSuggestedFees.exclusivityDeadline))
      expect(depositData.message).toBe('0xmockEncodedMessage')
    })

    it('should use account as recipient when receiver is not provided', () => {
      const request = makeRequest({ receiver: undefined })
      const quote = makeQuote()
      createAcrossDepositCall({ request, quote, cowShedSdk, swapProxyAddress: TEST_SWAP_PROXY })

      const swapAndBridgeCall = mockEncodeFunction.mock.calls[2]
      const { depositData } = swapAndBridgeCall[2][0]

      expect(depositData.recipient).toBe(addressToBytes32(request.account))
    })

    it('should throw error when periphery address is not found for chain', () => {
      const request = makeRequest({ sellTokenChainId: SupportedChainId.SEPOLIA })
      const quote = makeQuote()

      expect(() =>
        createAcrossDepositCall({ request, quote, cowShedSdk, swapProxyAddress: TEST_SWAP_PROXY }),
      ).toThrow('Spoke pool periphery address not found for chain')
    })

    it('should throw error when spoke pool address is not found for chain', () => {
      const request = makeRequest({ sellTokenChainId: SupportedChainId.AVALANCHE })
      const quote = makeQuote()

      // AVALANCHE has neither periphery nor spoke pool, so periphery check fails first
      expect(() => createAcrossDepositCall({ request, quote, cowShedSdk, swapProxyAddress: TEST_SWAP_PROXY })).toThrow(
        'Spoke pool periphery address not found for chain',
      )
    })

    it('should set zero submission fees', () => {
      const request = makeRequest()
      const quote = makeQuote()
      createAcrossDepositCall({ request, quote, cowShedSdk, swapProxyAddress: TEST_SWAP_PROXY })

      const swapAndBridgeCall = mockEncodeFunction.mock.calls[2]
      const { submissionFees } = swapAndBridgeCall[2][0]

      expect(submissionFees.amount).toBe(0n)
      expect(submissionFees.recipient).toBe('0x0000000000000000000000000000000000000000')
    })

    it('should reject prefund below quoted amount (Across would revert on min check)', () => {
      const request = makeRequest()
      const quote = makeQuote()

      expect(() =>
        createAcrossDepositCall({
          request,
          quote,
          cowShedSdk,
          swapProxyAddress: TEST_SWAP_PROXY,
          prefundFromShedAmount: request.amount - 1n,
        }),
      ).toThrow('prefundFromShedAmount must be >= request.amount')
    })

    it('should encode larger prefund for integrator-provided surplus capture', () => {
      const request = makeRequest()
      const quote = makeQuote()
      const surplusPrefund = request.amount + 100333n
      createAcrossDepositCall({
        request,
        quote,
        cowShedSdk,
        swapProxyAddress: TEST_SWAP_PROXY,
        prefundFromShedAmount: surplusPrefund,
      })

      const transferCall = mockEncodeFunction.mock.calls[1]
      expect(transferCall[2]).toEqual([TEST_SWAP_PROXY, surplusPrefund])
    })

    it('should work with different decimal configurations (18→6)', () => {
      const request = makeRequest({
        sellTokenChainId: SupportedChainId.BNB,
        sellTokenAddress: '0x55d398326f99059fF775485246999027B3197955',
        sellTokenDecimals: 18,
        buyTokenChainId: SupportedChainId.MAINNET,
        buyTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        buyTokenDecimals: 6,
        amount: 1000000000000000000000n,
      })
      const quote = makeQuote({
        amountsAndCosts: {
          beforeFee: { sellAmount: 1000000000000000000000n, buyAmount: 1000000000n },
          afterFee: { sellAmount: 1000000000000000000000n, buyAmount: 900000000n },
          afterSlippage: { sellAmount: 1000000000000000000000n, buyAmount: 900000000n },
          costs: {
            bridgingFee: {
              feeBps: 1000,
              amountInSellCurrency: 100000000000000000000n,
              amountInBuyCurrency: 100000000n,
            },
          },
          slippageBps: 0,
        },
      })

      const result = createAcrossDepositCall({
        request,
        quote,
        cowShedSdk,
        swapProxyAddress: TEST_SWAP_PROXY,
      })

      expect(result).toHaveLength(2)

      const swapAndBridgeCall = mockEncodeFunction.mock.calls[2]
      const { depositData } = swapAndBridgeCall[2][0]

      expect(depositData.outputAmount).toBe(900000000n)
      expect(swapAndBridgeCall[2][0].swapTokenAmount).toBe(0n)
      expect(swapAndBridgeCall[2][0].minExpectedInputTokenAmount).toBe(1000000000000000000000n)
    })
  })
})

describe('addressToBytes32', () => {
  it('should left-pad an address to 32 bytes', () => {
    expect(addressToBytes32('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')).toBe(
      '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    )
  })

  it('should handle zero address', () => {
    expect(addressToBytes32('0x0000000000000000000000000000000000000000')).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )
  })
})
