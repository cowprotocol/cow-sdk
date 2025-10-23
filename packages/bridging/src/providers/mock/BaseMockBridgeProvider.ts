import {
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  BridgingDepositParams,
  BuyTokensParams,
  GetProviderBuyTokens,
  QuoteBridgeRequest,
  BridgeProvider,
} from '../../types'
import { RAW_PROVIDERS_FILES_PATH } from '../../const'
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

export abstract class BaseMockBridgeProvider implements Omit<BridgeProvider<BridgeQuoteResult>, 'type'> {
  info: BridgeProviderInfo

  constructor(name: string) {
    this.info = {
      name,
      logoUrl: `${RAW_PROVIDERS_FILES_PATH}/mock/mock-logo.png`,
      dappId: 'dapp-id-' + name,
      website: `https://mock.com/${name}`,
    }
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
    _orderUid: string,
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
