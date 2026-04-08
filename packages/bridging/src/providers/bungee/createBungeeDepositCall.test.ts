import { createBungeeDepositCall } from './createBungeeDepositCall'
import { BungeeQuoteResult } from './BungeeBridgeProvider'
import { QuoteBridgeRequest } from '../../types'
import { BungeeBridge, BungeeBuildTx, BungeeQuote } from './types'
import { BungeeApproveAndBridgeV1Addresses } from './const/contracts'
import { ETH_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { createAdapters } from '../../../tests/setup'

/** routeId (4 bytes) + Across `bridgeERC20To` selector + first arg uint256 (amount) */
function minimalAcrossBridgeCalldata(amount: bigint): string {
  const routeId = '00000001'
  const selector = 'cc54d224'
  const amountHex = amount.toString(16).padStart(64, '0')
  return `0x${routeId}${selector}${amountHex}`
}

/** routeId + CCTP `bridgeERC20To` selector + first arg uint256 */
function minimalCctpBridgeCalldata(amount: bigint): string {
  const routeId = '00000002'
  const selector = 'b7dfe9d0'
  const amountHex = amount.toString(16).padStart(64, '0')
  return `0x${routeId}${selector}${amountHex}`
}

const adapters = createAdapters()
const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

adapterNames.forEach((adapterName) => {
  describe(`createBungeeDepositCall with ${adapterName}`, () => {
    let mockEncodeFunction: jest.Mock
    let mockEncodeAbi: jest.Mock

    const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    const bridgeInputAmount = 1000000n

    const baseBungeeDepositRequest: QuoteBridgeRequest = {
      kind: OrderKind.SELL,
      sellTokenChainId: SupportedChainId.MAINNET,
      sellTokenAddress: tokenAddress,
      sellTokenDecimals: 6,
      buyTokenChainId: SupportedChainId.POLYGON,
      buyTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      buyTokenDecimals: 6,
      amount: bridgeInputAmount,
      account: '0x1234567890123456789012345678901234567890',
      appCode: 'test',
      signer: '0xa43ccc40ff785560dab6cb0f13b399d050073e8a54114621362f69444e1421ca',
    }

    function makeRequest(overrides: Partial<QuoteBridgeRequest> = {}): QuoteBridgeRequest {
      return { ...baseBungeeDepositRequest, ...overrides }
    }

    function makeQuote(txData: string, bridge: BungeeBridge = BungeeBridge.Across): BungeeQuoteResult {
      const bungeeQuote: BungeeQuote = {
        originChainId: 1,
        destinationChainId: 137,
        userAddress: '0x123',
        receiverAddress: '0x789',
        input: {
          token: {
            chainId: 1,
            address: tokenAddress,
            name: 'USDC',
            symbol: 'USDC',
            decimals: 6,
            logoURI: '',
            icon: '',
          },
          amount: bridgeInputAmount.toString(),
          priceInUsd: 1,
          valueInUsd: 1,
        },
        route: {
          affiliateFee: null,
          quoteId: '1',
          quoteExpiry: 1234567890,
          output: {
            token: {
              chainId: 137,
              address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
              name: 'USDC',
              symbol: 'USDC',
              decimals: 6,
              logoURI: '',
              icon: '',
            },
            amount: '1000000',
            priceInUsd: 1,
            valueInUsd: 1,
            minAmountOut: '999000',
            effectiveReceivedInUsd: 1,
          },
          approvalData: {
            spenderAddress: '0x123',
            amount: bridgeInputAmount.toString(),
            tokenAddress: tokenAddress,
            userAddress: '0x123',
          },
          gasFee: {
            gasToken: {
              chainId: 1,
              address: ETH_ADDRESS,
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
                address: tokenAddress,
                name: 'USDC',
                symbol: 'USDC',
                decimals: 6,
                logoURI: '',
                icon: '',
              },
              amount: '1000',
              feeInUsd: 1,
              priceInUsd: 1,
            },
            dexDetails: null,
          },
          refuel: null,
        },
        routeBridge: bridge,
        quoteTimestamp: 1234567890,
      }

      const buildTx: BungeeBuildTx = {
        approvalData: bungeeQuote.route.approvalData,
        txData: {
          data: txData,
          to: '0xGateway',
          chainId: 1,
          value: '0',
        },
        userOp: '',
      }

      return {
        isSell: true,
        amountsAndCosts: {
          beforeFee: { sellAmount: bridgeInputAmount, buyAmount: 1000000n },
          afterFee: { sellAmount: bridgeInputAmount, buyAmount: 1000000n },
          afterSlippage: { sellAmount: bridgeInputAmount, buyAmount: 1000000n },
          costs: {
            bridgingFee: { feeBps: 1, amountInSellCurrency: 1000n, amountInBuyCurrency: 1n },
          },
          slippageBps: 0,
        },
        quoteTimestamp: 1234567890,
        expectedFillTimeSeconds: 300,
        id: '1',
        fees: { bridgeFee: 1000n, destinationGasFee: 0n },
        limits: { minDeposit: 0n, maxDeposit: 0n },
        bungeeQuote,
        buildTx,
      }
    }

    beforeEach(() => {
      jest.clearAllMocks()
      const adapter = adapters[adapterName]
      mockEncodeFunction = jest.fn().mockReturnValue('0xencodedApproveAndBridge')
      mockEncodeAbi = jest.fn().mockReturnValue('0xcafebabe')
      adapter.utils.encodeFunction = mockEncodeFunction as any
      adapter.utils.encodeAbi = mockEncodeAbi as any
      setGlobalAdapter(adapter)
    })

    it('returns an EvmCall to BungeeApproveAndBridgeV1 with approveAndBridge calldata', async () => {
      const innerData = minimalAcrossBridgeCalldata(bridgeInputAmount)
      const request = makeRequest()
      const quote = makeQuote(innerData)

      const result = await createBungeeDepositCall({ request, quote })

      expect(result.to).toBe(BungeeApproveAndBridgeV1Addresses[SupportedChainId.MAINNET])
      expect(result.data).toBe('0xencodedApproveAndBridge')
      expect(result.value).toBe(0n)

      expect(mockEncodeAbi).toHaveBeenCalledWith(['uint256', 'bool', 'uint256'], [8, false, 0])

      const expectedFullData = '0x' + innerData.slice(2) + 'cafebabe'
      expect(mockEncodeFunction).toHaveBeenCalledWith(
        expect.any(Array),
        'approveAndBridge',
        [tokenAddress, bridgeInputAmount.toString(), 0n, expectedFullData],
      )
    })

    it('works for CCTP route and selector mapping', async () => {
      const innerData = minimalCctpBridgeCalldata(bridgeInputAmount)
      const request = makeRequest()
      const quote = makeQuote(innerData, BungeeBridge.CircleCCTP)

      await createBungeeDepositCall({ request, quote })

      expect(mockEncodeAbi).toHaveBeenCalledWith(['uint256', 'bool', 'uint256'], [8, false, 0])
    })

    it('sets call value to input amount when sell token is native ETH placeholder', async () => {
      const innerData = minimalAcrossBridgeCalldata(bridgeInputAmount)
      const request = makeRequest({ sellTokenAddress: ETH_ADDRESS })
      const quote = makeQuote(innerData)

      const result = await createBungeeDepositCall({ request, quote })

      expect(result.value).toBe(bridgeInputAmount)
    })

    it('throws when calldata uses an unknown function for the bridge', async () => {
      const badData = '0x00000001deadbeef' + '0'.repeat(64)
      const request = makeRequest()
      const quote = makeQuote(badData)

      await expect(createBungeeDepositCall({ request, quote })).rejects.toThrow(
        'createBungeeDepositCall() no params for function [0xdeadbeef]',
      )
    })

    it('throws when BungeeApproveAndBridgeV1 is not deployed on the sell chain', async () => {
      const innerData = minimalAcrossBridgeCalldata(bridgeInputAmount)
      const request = makeRequest({ sellTokenChainId: SupportedChainId.BNB })
      const quote = makeQuote(innerData)

      await expect(createBungeeDepositCall({ request, quote })).rejects.toThrow('BungeeApproveAndBridgeV1 not found')
    })
  })
})
