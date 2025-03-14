/* eslint-disable @typescript-eslint/no-unused-vars */
import { Signer } from 'ethers'

import {
  BridgeDeposit,
  BridgeHook,
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  GetBuyTokensParams,
  QuoteBridgeRequest,
} from '../../types'

import { RAW_PROVIDERS_FILES_PATH } from '../../const'

import { ChainId, ChainInfo, TargetChainId } from '../../../chains'

import { acrossTokenMapping } from './const/tokens'
import { EvmCall, TokenInfo } from '../../../common'

import { mainnet } from '../../../chains/details/mainnet'
import { polygon } from '../../../chains/details/polygon'
import { arbitrumOne } from 'src/chains/details/arbitrum'
import { base } from '../../../chains/details/base'
import { optimism } from '../../../chains/details/optimism'

interface AcrossBridgeProviderOptions {
  getTokenInfos: (chainId: ChainId, addresses: string[]) => Promise<TokenInfo[]>
  apiBaseUrl?: string
}

export class AcrossBridgeProvider implements BridgeProvider<BridgeQuoteResult> {
  constructor(private options: AcrossBridgeProviderOptions) {}

  info: BridgeProviderInfo = {
    name: 'Across',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/across/across-logo.png`,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return [mainnet, polygon, arbitrumOne, base, optimism]
  }

  async getBuyTokens(param: GetBuyTokensParams): Promise<TokenInfo[]> {
    const { targetChainId } = param

    const chainConfig = acrossTokenMapping[targetChainId as TargetChainId]
    if (!chainConfig) {
      return []
    }

    const tokenAddresses = Object.values(chainConfig.tokens)
    return this.options.getTokenInfos(targetChainId, tokenAddresses)
  }

  async getIntermediateTokens(_request: QuoteBridgeRequest): Promise<string[]> {
    throw new Error('Not implemented')
  }

  async getQuote(_request: QuoteBridgeRequest): Promise<BridgeQuoteResult> {
    return {
      feeBps: 10,
      slippageBps: 0,
      buyAmount: '123456',
      fillTimeInSeconds: 128,
    }
  }

  async getUnsignedBridgeTx(_request: QuoteBridgeRequest, _quote: BridgeQuoteResult): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
  async getSignedHook(_unsignedTx: EvmCall, _signer: Signer): Promise<BridgeHook> {
    throw new Error('Not implemented')
  }
  async decodeBridgeHook(_hook: BridgeHook): Promise<BridgeDeposit> {
    throw new Error('Not implemented')
  }

  async getBridgingId(_orderUid: string, _settlementTx: string): Promise<string> {
    throw new Error('Not implemented')
  }

  getExplorerUrl(_bridgingId: string): string {
    throw new Error('Not implemented')
  }

  async getStatus(_bridgingId: string): Promise<BridgeStatusResult> {
    throw new Error('Not implemented')
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
}
