import { createAcrossDepositCall } from './createAcrossDepositCall'
import { Contract as WeirollContract } from '@weiroll/weiroll.js'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import { QuoteBridgeRequest } from '../../types'
import { AdditionalTargetChainId, SupportedChainId, TargetChainId } from '../../../chains/types'
import { CowShedSdk } from '../../../cow-shed'
import { ACROSS_MATH_CONTRACT_ADDRESSES, ACROSS_SPOOK_CONTRACT_ADDRESSES } from './const/contracts'
import { OrderKind } from '@cowprotocol/contracts'

const BRIDGE_REQUEST: QuoteBridgeRequest = {
  type: OrderKind.SELL,
  sellTokenChainId: SupportedChainId.MAINNET,
  sellTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  sellTokenDecimals: 6,
  buyTokenChainId: AdditionalTargetChainId.POLYGON,
  buyTokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  buyTokenDecimals: 6,
  amount: '10000000000',
  owner: '0x1234567890123456789012345678901234567890',
}

const ACROSS_QUOTE: AcrossQuoteResult = {
  buyAmount: '950000000000000000',
  feeBps: 20,
  slippageBps: 50,
  suggestedFees: {
    totalRelayFee: { pct: '100000000000000', total: '100000' },
    relayerCapitalFee: { pct: '50000000000000', total: '50000' },
    relayerGasFee: { pct: '50000000000000', total: '50000' },
    lpFee: { pct: '30000000000000', total: '30000' },
    timestamp: '1234567890',
    isAmountTooLow: false,
    quoteBlock: '12345',
    spokePoolAddress: '0xabcd',
    exclusiveRelayer: '0x0000000000000000000000000000000000000001',
    exclusivityDeadline: '0',
    expectedFillTimeSec: '300',
    fillDeadline: '1234567890',
    limits: {
      minDeposit: '1000000',
      maxDeposit: '1000000000000',
      maxDepositInstant: '100000000',
      maxDepositShortDelay: '500000000',
      recommendedDepositInstant: '50000000',
    },
  },
}

const COW_SHED_ACCOUNT = '0x0000000000000000000000000000000000000002'
const SIGNED_MULTICALL = {
  to: '0x1',
  data: '0x2',
  value: '0',
}

describe('createAcrossDepositCall', () => {
  let cowShedSdk: CowShedSdk

  beforeEach(() => {
    // mock CoW Shed SDK
    cowShedSdk = {
      getCowShedAccount: jest.fn().mockReturnValue(COW_SHED_ACCOUNT),
      signCalls: jest.fn().mockResolvedValue({
        cowShedAccount: COW_SHED_ACCOUNT,
        signedMulticall: SIGNED_MULTICALL,
        gasLimit: 1000000n,
      }),
      getCowShedHooks: jest.fn().mockReturnValue({
        address: '0xMockHooksAddress',
        // Add other hook properties as needed
      }),
    } as unknown as jest.Mocked<CowShedSdk>
  })

  it('should create correct deposit call for valid inputs', async () => {
    const mockWeirollContract = {
      address: '0xMockAddress',
      balanceOf: jest.fn(),
      approve: jest.fn(),
      depositV3: jest.fn(),
    }
    const mockMathContract = {
      multiplyAndSubtract: jest.fn(),
    }

    // Mock contract creation functions
    ;(WeirollContract.createContract as jest.Mock).mockImplementation((contract) => {
      if (contract.address === '0xSellTokenAddress') {
        return mockWeirollContract
      }
      if (contract.address === ACROSS_MATH_CONTRACT_ADDRESSES[1]) {
        return mockMathContract
      }
      if (contract.address === ACROSS_SPOOK_CONTRACT_ADDRESSES[1]) {
        return mockWeirollContract
      }
      return mockWeirollContract
    })

    cowShedSdk.getCowShedAccount = jest.fn().mockReturnValue('0xCowShedAccount')

    const depositCall = createAcrossDepositCall({
      request: bridgeRequest,
      quote: {
        ...acrossQuote,
        suggestedFees: {
          totalRelayFee: {
            pct: '1000000', // 0.1%
            amount: '500000000000000',
          },
          timestamp: '1234567890',
          fillDeadline: '1234567999',
          exclusivityDeadline: '1234567899',
          exclusiveRelayer: '0xRelayerAddress',
        },
      },
      cowShedSdk: cowShedSdk,
    })

    expect(depositCall).toBeDefined()
    expect(WeirollContract.createContract).toHaveBeenCalledTimes(4) // For spoke pool, math, balanceOf and approve
    expect(cowShedSdk.getCowShedAccount).toHaveBeenCalledWith(1, bridgeRequest.userAddress)
  })

  it('should throw error for invalid spoke pool address', () => {
    const invalidChainId = 999999 as TargetChainId
    const invalidRequest = {
      ...bridgeRequest,
      fromChainId: invalidChainId,
    }

    expect(() =>
      createAcrossDepositCall({
        request: invalidRequest,
        quote: {
          ...acrossQuote,
          fromChainId: invalidChainId,
        },
        cowShedSdk: cowShedSdk,
      })
    ).toThrow('Spoke pool address not found for chain: ' + invalidChainId)
  })

  it('should throw error for invalid math contract address', () => {
    // Temporarily modify ACROSS_MATH_CONTRACT_ADDRESSES to simulate missing math contract
    const originalMathAddresses = { ...ACROSS_MATH_CONTRACT_ADDRESSES }
    delete ACROSS_MATH_CONTRACT_ADDRESSES[1]

    expect(() =>
      createAcrossDepositCall({
        request: bridgeRequest,
        quote: acrossQuote,
        cowShedSdk: cowShedSdk,
      })
    ).toThrow('Math contract address not found for chain: 1')

    // Restore original addresses
    Object.assign(ACROSS_MATH_CONTRACT_ADDRESSES, originalMathAddresses)
  })

  it('should handle approval and balance checks correctly', () => {
    const mockWeirollContract = {
      address: '0xMockAddress',
      balanceOf: jest.fn(),
      approve: jest.fn(),
      depositV3: jest.fn(),
    }

    ;(WeirollContract.createContract as jest.Mock).mockReturnValue(mockWeirollContract)
    cowShedSdk.getCowShedAccount = jest.fn().mockReturnValue('0xCowShedAccount')

    createAcrossDepositCall({
      request: bridgeRequest,
      quote: {
        ...acrossQuote,
        suggestedFees: {
          totalRelayFee: {
            pct: '1000000',
            amount: '500000000000000',
          },
          timestamp: '1234567890',
          fillDeadline: '1234567999',
          exclusivityDeadline: '1234567899',
          exclusiveRelayer: '0xRelayerAddress',
        },
      },
      cowShedSdk: cowShedSdk,
    })

    expect(mockWeirollContract.balanceOf).toHaveBeenCalledWith('0xCowShedAccount')
    expect(mockWeirollContract.approve).toHaveBeenCalled()
  })
})
