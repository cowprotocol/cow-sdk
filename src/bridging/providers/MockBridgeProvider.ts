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
import { baseNativeCurrency } from '../../common'
import { ChainInfo } from '../../chains'
import { mainnet } from '../../chains/details/mainnet'
import { sepolia } from '../../chains/details/sepolia'
// import { baseNativeCurrency, ChainInfo, EthereumLogo, mainnet, sepolia } from '../../chains/details/sepolia'

import { EvmCall } from '../../common/types/ethereum'
import { TokenInfo } from '../../common/types/tokens'
import { OrderKind } from 'src/order-book'

const BRIDGING_ID = '123456789asdfg'
const MOCK_TX: EvmCall = {
  to: '0x0000000000000000000000000000000000000001',
  data: '0x0',
  value: BigInt(0),
}
const ethereumLogo = mainnet.logo.light

//See https://github.com/wevm/viem/blob/main/src/chains/definitions/optimism.ts
const optimism: ChainInfo = {
  id: 10,
  label: 'Optimism',
  logo: { light: ethereumLogo, dark: ethereumLogo },
  nativeCurrency: {
    ...baseNativeCurrency,
    chainId: 10,
    logoUrl:
      'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images/1/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png',
  },
  addressPrefix: 'op',
  isTestnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 4286263,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.optimism.io'],
    },
  },
  color: '#ff0420',
  website: {
    name: 'Optimism',
    url: 'https://optimism.io',
  },
  docs: {
    name: 'Optimism Docs',
    url: 'https://docs.optimism.io',
  },
  blockExplorer: {
    name: 'Etherscan',
    url: 'https://optimistic.etherscan.io',
  },
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
      feeBps: 10,
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
      type: OrderKind.SELL,
      provider: this.info,
      owner: '0x0000000000000000000000000000000000000001',
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
    return MOCK_TX
  }
  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    return MOCK_TX
  }
}
