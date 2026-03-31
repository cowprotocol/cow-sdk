jest.mock('@cowprotocol/sdk-common', () => {
  const original = jest.requireActual('@cowprotocol/sdk-common')

  return {
    ...original,
    ContractFactory: {
      createSettlementContract: jest.fn().mockReturnValue({ address: 'mock-settlement-contract' }),
    },
  }
})

import { getSettlementContract } from './getSettlementContract'
import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  SupportedChainId,
} from '@cowprotocol/sdk-config'
import { ContractFactory } from '@cowprotocol/sdk-common'

const chainId = SupportedChainId.MAINNET
const mockSigner = {} as any

describe('getSettlementContract', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should use default production address when no options provided', () => {
    getSettlementContract(chainId, mockSigner)

    expect(ContractFactory.createSettlementContract).toHaveBeenCalledWith(
      COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
      mockSigner,
    )
  })

  it('should use staging address when env is "staging"', () => {
    getSettlementContract(chainId, mockSigner, { env: 'staging' })

    expect(ContractFactory.createSettlementContract).toHaveBeenCalledWith(
      COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[chainId],
      mockSigner,
    )
  })

  it('should use settlementContractOverride address when provided', () => {
    const customAddress = '0x1111111111111111111111111111111111111111'

    getSettlementContract(chainId, mockSigner, {
      settlementContractOverride: { [chainId]: customAddress },
    })

    expect(ContractFactory.createSettlementContract).toHaveBeenCalledWith(customAddress, mockSigner)
  })

  it('should prioritize settlementContractOverride over staging env', () => {
    const customAddress = '0x1111111111111111111111111111111111111111'

    getSettlementContract(chainId, mockSigner, {
      env: 'staging',
      settlementContractOverride: { [chainId]: customAddress },
    })

    expect(ContractFactory.createSettlementContract).toHaveBeenCalledWith(customAddress, mockSigner)
  })

  it('should fall back to prod address when override is for a different chain', () => {
    const customAddress = '0x1111111111111111111111111111111111111111'

    getSettlementContract(chainId, mockSigner, {
      settlementContractOverride: { [SupportedChainId.GNOSIS_CHAIN]: customAddress },
    })

    expect(ContractFactory.createSettlementContract).toHaveBeenCalledWith(
      COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
      mockSigner,
    )
  })
})
