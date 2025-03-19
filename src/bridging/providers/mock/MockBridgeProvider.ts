/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BridgeDeposit,
  BridgeHook,
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatus,
  BridgeStatusResult,
  GetBuyTokensParams,
  QuoteBridgeRequest,
} from '../../types'

import { OrderKind } from 'src/order-book'
import { mainnet } from 'src/chains/details/mainnet'
import { optimism } from 'src/chains/details/optimism'
import { sepolia } from 'src/chains/details/sepolia'
import { EvmCall, TokenInfo } from 'src/common'
import { ChainInfo, SupportedChainId } from '../../../chains'
import { RAW_PROVIDERS_FILES_PATH } from '../../const'
import { Signer } from '@ethersproject/abstract-signer'

const BRIDGING_ID = '123456789asdfg'
const MOCK_CALL: EvmCall = {
  to: '0x0000000000000000000000000000000000000001',
  data: '0x0',
  value: BigInt(0),
}

export class MockBridgeProvider implements BridgeProvider<BridgeQuoteResult> {
  info: BridgeProviderInfo = {
    name: 'Mock',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/mock/mock-logo.png`,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return [mainnet, optimism, sepolia]
  }

  async getBuyTokens(param: GetBuyTokensParams): Promise<TokenInfo[]> {
    const { targetChainId } = param
    return [
      {
        chainId: targetChainId,
        address: '0x0000000000000000000000000000000000000001',
        logoUrl: 'https://swap.cow.fi/assets/network-mainnet-logo-BJe1wK_m.svg',
        name: 'Mock token 1',
        symbol: 'MOCK1',
        decimals: 18,
      },
      {
        chainId: targetChainId,
        address: '0x0000000000000000000000000000000000000002',
        logoUrl: 'https://swap.cow.fi/assets/network-gnosis-chain-logo-Do_DEWQv.svg',
        name: 'Mock token 2',
        symbol: 'MOCK2',
        decimals: 18,
      },
      {
        chainId: targetChainId,
        address: '0x0000000000000000000000000000000000000003',
        logoUrl: 'https://swap.cow.fi/assets/network-mainnet-logo-BJe1wK_m.svg',
        name: 'Mock token 3',
        symbol: 'MOCK3',
        decimals: 18,
      },
    ]
  }

  async getIntermediateTokens(_request: QuoteBridgeRequest): Promise<string[]> {
    return ['0x0000000000000000000000000000000000000000']
  }

  async getQuote(_request: QuoteBridgeRequest): Promise<BridgeQuoteResult> {
    return {
      feeBps: 10,
      slippageBps: 0,
      buyAmount: 123456n,
      fillTimeInSeconds: 128,
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
  async decodeBridgeHook(_hook: BridgeHook): Promise<BridgeDeposit> {
    return {
      kind: OrderKind.SELL,
      provider: this.info,
      account: '0x0000000000000000000000000000000000000001',
      feeBps: 10,
      sellTokenChainId: 1,
      sellTokenAddress: '0x0000000000000000000000000000000000000001',
      sellTokenAmount: '123456',
      sellTokenDecimals: 18,

      buyTokenChainId: 1,
      buyTokenAddress: '0x0000000000000000000000000000000000000002',
      buyTokenDecimals: 18,

      minBuyAmount: '123456',

      recipient: '0x0000000000000000000000000000000000000001',
      signer: '',
      appCode: 'MOCK',
    }
  }

  async getBridgingId(_orderUid: string, _settlementTx: string): Promise<string> {
    return BRIDGING_ID
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
