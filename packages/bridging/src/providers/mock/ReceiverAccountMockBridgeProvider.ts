import { ReceiverAccountBridgeProvider, BridgeQuoteResult, QuoteBridgeRequest } from '../../types'
import { BaseMockBridgeProvider } from './BaseMockBridgeProvider'

/**
 * Mock implementation of ReceiverAccountBridgeProvider for testing.
 * This provider simulates bridging by sending tokens to a specific receiver address.
 */
export class MockReceiverAccountBridgeProvider
  extends BaseMockBridgeProvider
  implements ReceiverAccountBridgeProvider<BridgeQuoteResult>
{
  type = 'ReceiverAccountBridgeProvider' as const

  // Mock receiver address that will be used for bridging
  private mockReceiverAddress = '0xBdC3EEE0000000000000000000000000DeAdBeeF'

  constructor() {
    super('ReceiverAccountBridgeProvider')
  }

  async getBridgeReceiverOverride(_quoteRequest: QuoteBridgeRequest, _quoteResult: BridgeQuoteResult): Promise<string> {
    return this.mockReceiverAddress
  }
}
