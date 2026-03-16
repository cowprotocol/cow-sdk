import { getOrderTypedData } from './getOrderTypedData'
import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  SupportedChainId,
} from '@cowprotocol/sdk-config'
import { UnsignedOrder } from '@cowprotocol/sdk-order-signing'
import { OrderKind } from '@cowprotocol/sdk-order-book'
import { createAdapters } from '../tests/setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

const orderToSign: UnsignedOrder = {
  sellToken: '0xaaa0000000000000000000000000000000000001',
  buyToken: '0xbbb0000000000000000000000000000000000002',
  receiver: '0xccc0000000000000000000000000000000000003',
  sellAmount: '1000000000000000000',
  buyAmount: '2000000000000000000',
  validTo: 1700000000,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  feeAmount: '0',
  kind: OrderKind.SELL,
  partiallyFillable: false,
}

describe('getOrderTypedData', () => {
  const chainId = SupportedChainId.MAINNET

  beforeAll(() => {
    setGlobalAdapter(createAdapters().ethersV5Adapter)
  })

  it('should return domain with default production settlement contract address', async () => {
    const result = await getOrderTypedData(chainId, orderToSign)

    expect(result.domain.verifyingContract).toBe(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId])
  })

  it('should use staging address when env is "staging"', async () => {
    const result = await getOrderTypedData(chainId, orderToSign, { env: 'staging' })

    expect(result.domain.verifyingContract).toBe(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[chainId])
  })

  it('should use settlementContractOverride when provided', async () => {
    const customAddress = '0x1111111111111111111111111111111111111111'

    const result = await getOrderTypedData(chainId, orderToSign, {
      settlementContractOverride: { [chainId]: customAddress },
    })

    expect(result.domain.verifyingContract).toBe(customAddress)
  })

  it('should prioritize settlementContractOverride over staging env', async () => {
    const customAddress = '0x1111111111111111111111111111111111111111'

    const result = await getOrderTypedData(chainId, orderToSign, {
      env: 'staging',
      settlementContractOverride: { [chainId]: customAddress },
    })

    expect(result.domain.verifyingContract).toBe(customAddress)
  })

  it('should include correct chainId in domain', async () => {
    const result = await getOrderTypedData(chainId, orderToSign)

    expect(result.domain.chainId).toBe(chainId)
  })

  it('should include the order as message', async () => {
    const result = await getOrderTypedData(chainId, orderToSign)

    expect(result.message).toBe(orderToSign)
  })
})
