import { latest as latestAppData } from '@cowprotocol/app-data'
import {
  BridgeDeposit,
  BridgeHook,
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatus,
  BridgeStatusResult,
  BridgingDepositParams,
  QuoteBridgeRequest,
} from '../../types'

import { OrderKind } from '../../../order-book'
import { mainnet } from '../../../chains/details/mainnet'
import { optimism } from '../../../chains/details/optimism'
import { sepolia } from '../../../chains/details/sepolia'
import { EvmCall, TokenInfo } from '../../../common'
import { AdditionalTargetChainId, ChainId, ChainInfo, SupportedChainId, TargetChainId } from '../../../chains'
import { RAW_PROVIDERS_FILES_PATH } from '../../const'
import { Signer } from '@ethersproject/abstract-signer'
import { JsonRpcProvider } from '@ethersproject/providers'

const BRIDGING_PARAMS: BridgingDepositParams = {
  inputTokenAddress: '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  outputTokenAddress: '0x000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  inputAmount: 24023409n,
  outputAmount: 24020093n,
  owner: '0x0000000000000000000000002bfcacf7ff137289a2c4841ea90413ab51103032',
  quoteTimestamp: 1747223915,
  fillDeadline: 1747235809,
  recipient: '0x000000000000000000000000bbcf91605c18a9859c1d47abfeed5d2cca7097cf',
  sourceChainId: 1,
  destinationChainId: 8453,
  bridgingId: '2595561',
}
const MOCK_CALL: EvmCall = {
  to: '0x0000000000000000000000000000000000000001',
  data: '0x0',
  value: BigInt(0),
}

const BUY_TOKENS = [
  {
    chainId: SupportedChainId.MAINNET,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    logoUrl: 'https://swap.cow.fi/assets/network-mainnet-logo-BJe1wK_m.svg',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  {
    chainId: SupportedChainId.MAINNET,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    logoUrl: 'https://swap.cow.fi/assets/network-gnosis-chain-logo-Do_DEWQv.svg',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  {
    chainId: SupportedChainId.SEPOLIA,
    address: '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59',
    logoUrl: 'https://swap.cow.fi/assets/network-mainnet-logo-BJe1wK_m.svg',
    name: 'CoW Protocol Token',
    symbol: 'COW',
    decimals: 18,
  },
  {
    chainId: AdditionalTargetChainId.OPTIMISM,
    address: '0x4200000000000000000000000000000000000006',
    logoUrl: 'https://swap.cow.fi/assets/network-mainnet-logo-BJe1wK_m.svg',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
]

const INTERMEDIATE_TOKENS: Partial<Record<TargetChainId, TokenInfo[]>> = {
  [SupportedChainId.MAINNET]: [
    {
      address: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
      chainId: SupportedChainId.MAINNET,
      name: 'COW',
      symbol: 'COW',
      decimals: 18,
    },
  ],
  [AdditionalTargetChainId.OPTIMISM]: [
    {
      address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      chainId: AdditionalTargetChainId.OPTIMISM,
      name: 'Wrapped BTC ',
      symbol: 'WBTC',
      decimals: 8,
    },
  ],
  [SupportedChainId.SEPOLIA]: [
    {
      address: '0xB4F1737Af37711e9A5890D9510c9bB60e170CB0D',
      chainId: SupportedChainId.SEPOLIA,
      name: 'DAI (test)',
      symbol: 'DAI',
      decimals: 18,
    },
  ],
}

export class MockBridgeProvider implements BridgeProvider<BridgeQuoteResult> {
  info: BridgeProviderInfo = {
    name: 'Mock',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/mock/mock-logo.png`,
    dappId: 'mockProvider',
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return [mainnet, optimism, sepolia]
  }

  async getBuyTokens(targetChainId: TargetChainId): Promise<TokenInfo[]> {
    return BUY_TOKENS.filter((token) => token.chainId === targetChainId)
  }

  async getIntermediateTokens({ sellTokenChainId }: QuoteBridgeRequest): Promise<TokenInfo[]> {
    return INTERMEDIATE_TOKENS[sellTokenChainId] ?? []
  }

  async getQuote(_request: QuoteBridgeRequest): Promise<BridgeQuoteResult> {
    return {
      isSell: true,
      amountsAndCosts: {
        costs: {
          bridgingFee: {
            feeBps: 10,
            amountInSellCurrency: 123456n,
            amountInBuyCurrency: 123456n,
          },
        },
        beforeFee: {
          sellAmount: 123456n,
          buyAmount: 123456n,
        },
        afterFee: {
          sellAmount: 123456n,
          buyAmount: 123456n,
        },
        afterSlippage: {
          sellAmount: 123456n,
          buyAmount: 123456n,
        },
        slippageBps: 0,
      },
      quoteTimestamp: Date.now(),
      expectedFillTimeSeconds: 128,
      fees: {
        bridgeFee: 1n,
        destinationGasFee: 2n,
      },
      limits: {
        minDeposit: 1n,
        maxDeposit: 100_000n,
      },
    }
  }

  getGasLimitEstimationForHook(_request: QuoteBridgeRequest): number {
    return 110_000
  }

  async getUnsignedBridgeCall(_request: QuoteBridgeRequest, _quote: BridgeQuoteResult): Promise<EvmCall> {
    return MOCK_CALL
  }
  async getSignedHook(_chainId: SupportedChainId, _unsignedCall: EvmCall, _signer: Signer): Promise<BridgeHook> {
    return {
      recipient: '0x0000000000000000000000000000000000000001',
      postHook: {
        target: '0x0000000000000000000000000000000000000002',
        callData: '0x1',
        gasLimit: '0x2',
        dappId: 'MockBridgeProvider',
      },
    }
  }
  async decodeBridgeHook(_hook: latestAppData.CoWHook): Promise<BridgeDeposit> {
    return {
      kind: OrderKind.SELL,
      provider: this.info,
      account: '0x0000000000000000000000000000000000000001',
      sellTokenChainId: 1,
      sellTokenAddress: '0x0000000000000000000000000000000000000001',
      sellTokenAmount: '123456',
      sellTokenDecimals: 18,

      buyTokenChainId: 1,
      buyTokenAddress: '0x0000000000000000000000000000000000000002',
      buyTokenDecimals: 18,

      minBuyAmount: '123456',

      receiver: '0x0000000000000000000000000000000000000001',
      signer: '',
      appCode: 'MOCK',
    }
  }

  async getBridgingParams(
    _chainId: ChainId,
    _provider: JsonRpcProvider,
    _orderUid: string,
    _txHash: string,
  ): Promise<BridgingDepositParams> {
    return BRIDGING_PARAMS
  }

  getExplorerUrl(bridgingId: string): string {
    return 'https://www.google.com/search?q=' + bridgingId
  }

  async getStatus(_bridgingId: string): Promise<BridgeStatusResult> {
    return {
      status: BridgeStatus.IN_PROGRESS,
      fillTimeInSeconds: 67,
    }
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    return MOCK_CALL
  }
  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    return MOCK_CALL
  }
}
