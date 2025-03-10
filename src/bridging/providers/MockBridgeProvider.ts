/* eslint-disable @typescript-eslint/no-unused-vars */
import { Signer } from 'ethers'
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
} from '../types'
import { ChainInfo } from '../../common'
import { EvmCall } from '../../common/transaction'
import { TokenInfo } from '../../common/tokens'

const BRIDGING_ID = '123456789asdfg'
const MOCK_TX: EvmCall = {
  to: '0x0000000000000000000000000000000000000001',
  data: '0x0',
  value: '0x0',
  isDelegateCall: true,
}

// https://github.com/wevm/viem/blob/main/src/chains/definitions/mainnet.ts
const mainnet: ChainInfo = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrl: 'https://eth.merkle.io',
  blockExplorer: {
    name: 'Etherscan',
    url: 'https://etherscan.io',
  },
  isSupported: true,
  isTestnet: false,
  logoUrl: 'https://swap.cow.fi/assets/network-mainnet-logo-BJe1wK_m.svg',
  mainColor: '#627EEA',
}

//github.com/wevm/viem/blob/main/src/chains/definitions/optimism.ts
const optimism: ChainInfo = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrl: 'https://eth.merkle.io',
  blockExplorer: {
    name: 'Etherscan',
    url: 'https://etherscan.io',
  },
  isSupported: false,
  isTestnet: false,
  logoUrl: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png?v=040',
  mainColor: '#627EEA',
}

const sepolia: ChainInfo = {
  id: 11_155_111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrl: 'https://sepolia.drpc.org',
  blockExplorer: {
    name: 'Etherscan',
    url: 'https://sepolia.etherscan.io',
  },
  isSupported: true,
  isTestnet: true,
  logoUrl: 'https://swap.cow.fi/assets/network-sepolia-logo-k9KE4z50.svg',
  mainColor: '#627EEA',
}

export class MockBridgeProvider implements BridgeProvider<BridgeQuoteResult> {
  info: BridgeProviderInfo = {
    name: 'Mock Bridge Provider',
    logoUrl: 'https://github.com/cowprotocol/cow-sdk/blob/main/images/MockingCoW.webp',
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
      fee: {
        type: 'fixed',
        value: 0,
      },
      slippageBps: 0,
      buyAmount: '123456',
      fillTimeInSeconds: 128,
    }
  }

  async getUnsignedBridgeTx(_request: QuoteBridgeRequest, _quote: BridgeQuoteResult): Promise<EvmCall> {
    return MOCK_TX
  }
  async getSignedHook(_unsignedTx: EvmCall, _signer: Signer): Promise<BridgeHook> {
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
      provider: this.info,

      sellTokenChainId: 1,
      sellTokenAddress: '0x0000000000000000000000000000000000000001',
      sellTokenAmount: '123456',
      sellTokenDecimals: 18,

      buyTokenChainId: 1,
      buyTokenAddress: '0x0000000000000000000000000000000000000002',
      buyTokenDecimals: 18,

      minBuyAmount: '123456',

      recipient: '0x0000000000000000000000000000000000000001',
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
      status: BridgeStatus.INITIATED,
      fillTimeInSeconds: 67,
    }
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    return MOCK_TX
  }
  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    return MOCK_TX
  }
}
