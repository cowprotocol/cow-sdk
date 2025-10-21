import { cowAppDataLatestScheme as latestAppData } from '@cowprotocol/sdk-app-data'
import { BridgeDeposit, BridgeHook, HookBridgeProvider, BridgeQuoteResult, QuoteBridgeRequest } from '../../types'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../../const'
import { EvmCall, SupportedChainId } from '@cowprotocol/sdk-config'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { MOCK_CALL } from './mockData'
import { BaseMockBridgeProvider } from './BaseMockBridgeProvider'

export class MockHookBridgeProvider extends BaseMockBridgeProvider implements HookBridgeProvider<BridgeQuoteResult> {
  type = 'HookBridgeProvider' as const

  constructor() {
    super('MockHookBridgeProvider')
  }

  async getGasLimitEstimationForHook(_request: QuoteBridgeRequest): Promise<number> {
    return 110_000
  }

  async getUnsignedBridgeCall(_request: QuoteBridgeRequest, _quote: BridgeQuoteResult): Promise<EvmCall> {
    return MOCK_CALL
  }

  async getSignedHook(_chainId: SupportedChainId, _unsignedCall: EvmCall): Promise<BridgeHook> {
    return {
      recipient: '0x0000000000000000000000000000000000000001',
      postHook: {
        target: '0x0000000000000000000000000000000000000002',
        callData: '0x1',
        gasLimit: '0x2',
        dappId: HOOK_DAPP_BRIDGE_PROVIDER_PREFIX,
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
}
