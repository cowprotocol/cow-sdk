import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { createAdapters } from '../../../tests/setup'
import { QuoteBridgeRequest } from '../../types'
import { BUNGEE_APPROVE_AND_BRIDGE_V1_ABI } from './abi'
import { createBungeeDepositCall } from './createBungeeDepositCall'
import { BungeeBridge, BungeeQuoteWithBuildTx } from './types'
import { decodeAmountsBungeeTxData, toBridgeQuoteResult } from './util'
import { CCTP_V2_TX_DATA } from './testData'

function applyPctDiff(base: bigint, compare: bigint, target: bigint): bigint {
  return (target * compare) / base
}

describe('createBungeeDepositCall', () => {
  const adapters = createAdapters()

  beforeEach(() => {
    setGlobalAdapter(adapters.ethersV5Adapter)
  })

  it('encodes cctp-v2 calldata rewrite metadata for feeAmount as the proportional secondary field', async () => {
    const request: QuoteBridgeRequest = {
      kind: OrderKind.SELL,
      amount: 100000000n,
      owner: '0x664B591AB924c6bb2caCA533Ed702386934A11d6',
      sellTokenChainId: SupportedChainId.BASE,
      sellTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      sellTokenDecimals: 6,
      buyTokenChainId: SupportedChainId.MAINNET,
      buyTokenAddress: '0xA0b86991c6218b36c1d19d4a2e9Eb0cE3606eB48',
      buyTokenDecimals: 6,
      appCode: 'bungee',
      account: '0x664B591AB924c6bb2caCA533Ed702386934A11d6',
      signer: '0x664B591AB924c6bb2caCA533Ed702386934A11d6',
    }

    const quoteWithBuildTx: BungeeQuoteWithBuildTx = {
      bungeeQuote: {
        originChainId: SupportedChainId.BASE,
        destinationChainId: SupportedChainId.MAINNET,
        userAddress: '0x664B591AB924c6bb2caCA533Ed702386934A11d6',
        receiverAddress: '0x664B591AB924c6bb2caCA533Ed702386934A11d6',
        input: {
          token: {
            chainId: SupportedChainId.BASE,
            address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
            logoURI: '',
            icon: '',
          },
          amount: '100000000',
          priceInUsd: 1,
          valueInUsd: 100,
        },
        route: {
          quoteId: 'fd868dfdece0f3b1',
          quoteExpiry: 0,
          output: {
            token: {
              chainId: SupportedChainId.MAINNET,
              address: '0xA0b86991c6218b36c1d19d4a2e9Eb0cE3606eB48',
              name: 'USD Coin',
              symbol: 'USDC',
              decimals: 6,
              logoURI: '',
              icon: '',
            },
            amount: '98000000',
            priceInUsd: 1,
            valueInUsd: 98,
            minAmountOut: '98000000',
            effectiveReceivedInUsd: 98,
          },
          affiliateFee: null,
          approvalData: {
            spenderAddress: '0x3a23f943181408eac424116af7b7790c94cb97a5',
            amount: '100000000',
            tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            userAddress: '0x664B591AB924c6bb2caCA533Ed702386934A11d6',
          },
          gasFee: {
            gasToken: {
              chainId: SupportedChainId.BASE,
              address: '0x0000000000000000000000000000000000000000',
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              icon: '',
              logoURI: '',
              chainAgnosticId: null,
            },
            gasLimit: '0',
            gasPrice: '0',
            estimatedFee: '0',
            feeInUsd: 0,
          },
          slippage: 0,
          estimatedTime: 0,
          routeDetails: {
            name: 'Circle CCTP V2',
            logoURI: '',
            routeFee: {
              token: {
                chainId: SupportedChainId.BASE,
                address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                name: 'USD Coin',
                symbol: 'USDC',
                decimals: 6,
                logoURI: '',
                icon: '',
              },
              amount: '0',
              feeInUsd: 0,
              priceInUsd: 1,
            },
            dexDetails: null,
          },
          refuel: null,
        },
        routeBridge: BungeeBridge.CircleCCTPV2,
        quoteTimestamp: 0,
      },
      buildTx: {
        approvalData: {
          spenderAddress: '0x3a23f943181408eac424116af7b7790c94cb97a5',
          amount: '100000000',
          tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          userAddress: '0x664B591AB924c6bb2caCA533Ed702386934A11d6',
        },
        txData: {
          data: CCTP_V2_TX_DATA,
          to: '0x3a23f943181408eac424116af7b7790c94cb97a5',
          chainId: SupportedChainId.BASE,
          value: '0',
        },
        userOp: '',
      },
    }

    const quote = toBridgeQuoteResult(request, 0, quoteWithBuildTx)
    const call = await createBungeeDepositCall({ request, quote })
    const decoded = adapters.ethersV5Adapter.utils.decodeFunctionData(
      BUNGEE_APPROVE_AND_BRIDGE_V1_ABI,
      'approveAndBridge',
      call.data,
    ) as [string, { toString(): string }, { toString(): string }, string]

    expect(decoded[0]).toBe(request.sellTokenAddress)
    expect(decoded[1].toString()).toBe('100000000')
    expect(decoded[2].toString()).toBe('0')
    expect(decoded[3].startsWith(CCTP_V2_TX_DATA)).toBe(true)

    const modifyCalldataParams = `0x${decoded[3].slice(-192)}`
    const [inputAmountStartIndex, modifyOutputAmount, outputAmountStartIndex] = adapters.ethersV5Adapter.utils.decodeAbi(
      ['uint256', 'bool', 'uint256'],
      modifyCalldataParams,
    ) as [bigint, boolean, bigint]

    expect(inputAmountStartIndex).toBe(8n)
    expect(modifyOutputAmount).toBe(true)
    expect(outputAmountStartIndex).toBe(200n)
  })

  it('would lower feeAmount proportionally when the actual bridged amount is below the quote', () => {
    const result = decodeAmountsBungeeTxData(CCTP_V2_TX_DATA, BungeeBridge.CircleCCTPV2)

    const quotedAmount = result.inputAmountBigNumber
    const quotedFeeAmount = result.outputAmountBigNumber!
    const actualBridgedAmount = 90000000n
    const adjustedFeeAmount = applyPctDiff(quotedAmount, actualBridgedAmount, quotedFeeAmount)

    expect(adjustedFeeAmount).toBe(1800000n)
    expect(adjustedFeeAmount).toBeLessThan(quotedFeeAmount)
  })

  it('would raise feeAmount proportionally when the actual bridged amount is above the quote', () => {
    const result = decodeAmountsBungeeTxData(CCTP_V2_TX_DATA, BungeeBridge.CircleCCTPV2)

    const quotedAmount = result.inputAmountBigNumber
    const quotedFeeAmount = result.outputAmountBigNumber!
    const actualBridgedAmount = 110000000n
    const adjustedFeeAmount = applyPctDiff(quotedAmount, actualBridgedAmount, quotedFeeAmount)

    expect(adjustedFeeAmount).toBe(2200000n)
    expect(adjustedFeeAmount).toBeGreaterThan(quotedFeeAmount)
  })
})
