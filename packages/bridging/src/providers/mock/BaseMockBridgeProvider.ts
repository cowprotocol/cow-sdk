import {
  BridgeQuoteResult,
  BridgeStatusResult,
  BridgingDepositParams,
  BuyTokensParams,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
  BridgeProvider,
} from '../../types'
import {
  ChainId,
  ChainInfo,
  EvmCall,
  mainnet,
  optimism,
  sepolia,
  SupportedChainId,
  TokenInfo,
} from '@cowprotocol/sdk-config'
import { BRIDGING_PARAMS, BUY_TOKENS, INTERMEDIATE_TOKENS, MOCK_CALL, QUOTE, STATUS } from './mockData'
import { EnrichedOrder } from '@cowprotocol/sdk-order-book'
import { RAW_PROVIDERS_FILES_PATH } from '../../const'

const name = 'BaseMockBridgeProvider'
const providerType = 'HookBridgeProvider' as const

export abstract class BaseMockBridgeProvider implements BridgeProvider<BridgeQuoteResult> {
  type = providerType

  info = {
    name,
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/mock/mock-logo.webp`,
    dappId: 'dapp-id-' + name,
    website: `https://mock.com/${name}`,
    type: providerType,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return [mainnet, optimism, sepolia]
  }

  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    return {
      tokens: BUY_TOKENS.filter((token) => token.chainId === params.buyChainId),
      isRouteAvailable: true,
    }
  }

  async getIntermediateTokens({ sellTokenChainId }: QuoteBridgeRequest): Promise<TokenInfo[]> {
    return INTERMEDIATE_TOKENS[sellTokenChainId] ?? []
  }

  async getQuote(_request: QuoteBridgeRequest): Promise<BridgeQuoteResult> {
    return QUOTE
  }

  async getBridgingParams(
    _chainId: ChainId,
    _order: EnrichedOrder,
    _txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult }> {
    return {
      params: BRIDGING_PARAMS,
      status: await this.getStatus(BRIDGING_PARAMS.bridgingId, BRIDGING_PARAMS.sourceChainId as SupportedChainId),
    }
  }

  getExplorerUrl(bridgingId: string): string {
    return 'https://www.google.com/search?q=' + bridgingId
  }

  async getStatus(_bridgingId: string, _originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    return STATUS
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    return MOCK_CALL
  }

  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    return MOCK_CALL
  }
}
