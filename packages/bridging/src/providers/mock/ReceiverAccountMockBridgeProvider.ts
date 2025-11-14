import { ReceiverAccountBridgeProvider, BridgeQuoteResult, QuoteBridgeRequest } from '../../types'
import { BaseMockBridgeProvider } from './BaseMockBridgeProvider'
import { RAW_PROVIDERS_FILES_PATH } from '../../const'

const name = 'ReceiverAccountBridgeProvider'
const providerType = 'ReceiverAccountBridgeProvider' as const

/**
 * Mock implementation of ReceiverAccountBridgeProvider for testing.
 * This provider simulates bridging by sending tokens to a specific receiver address.
 */
export class MockReceiverAccountBridgeProvider
  extends BaseMockBridgeProvider
  implements ReceiverAccountBridgeProvider<BridgeQuoteResult>
{
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  type = providerType

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  info = {
    name,
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/mock/mock-logo.png`,
    dappId: 'dapp-id-' + name,
    website: `https://mock.com/${name}`,
    type: providerType,
  }

  // Mock receiver address that will be used for bridging (properly checksummed)
  private mockReceiverAddress = '0x9999999999999999999999999999999999999999'

  async getBridgeReceiverOverride(_quoteRequest: QuoteBridgeRequest, _quoteResult: BridgeQuoteResult): Promise<string> {
    return this.mockReceiverAddress
  }
}
