import { AdditionalTargetChainId, SupportedChainId } from '../../../chains'
import { AcrossApi } from './AcrossApi'
import { DepositStatusResponse } from './types'
describe('AcrossApi: Shape of API response', () => {
  let api: AcrossApi

  beforeEach(() => {
    // Use the real API (not mocked)
    api = new AcrossApi()
  })

  it('getSuggestedFees', async () => {
    // Attempt to make a REAL API call. The API implementation will assert the result shape matches the expected object
    //  Example: https://app.across.to/api/suggested-fees?token=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1&originChainId=42161&destinationChainId=8453&amount=2389939424141418&recipient=0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3
    const result = await api.getSuggestedFees({
      token: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      originChainId: SupportedChainId.ARBITRUM_ONE,
      destinationChainId: SupportedChainId.BASE,
      amount: 2389939424141418n,
      recipient: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
    })

    expect(result).toBeDefined()
  })

  it('getAvailableRoutes', async () => {
    // Attempt to make a REAL API call. The API implementation will assert the result shape matches the expected object
    const result = await api.getAvailableRoutes({
      originChainId: SupportedChainId.ARBITRUM_ONE.toString(),
      originToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // weth

      destinationChainId: SupportedChainId.BASE.toString(),
      destinationToken: '0x4200000000000000000000000000000000000006', // weth
    })

    expect(result).toBeDefined()
  })

  it('getDepositStatus', async () => {
    // Attempt to make a REAL API call. The API implementation will assert the result shape matches the expected object
    const result: DepositStatusResponse = await api.getDepositStatus({
      originChainId: AdditionalTargetChainId.POLYGON.toString(),
      depositId: '1349975',
    })

    expect(result).toBeDefined()
    expect(result.status).toBe('filled')
    expect(result.depositTxHash).toBe('0x784f3cf234ffc960d087c5c02b166d838f7a170b337a349a49b54be837fd8152')
    expect(result.fillTx).toBe('0x788835d45d1ad5bc339990b23d2e09756ca1b4c98a6246be3505fb1baaf573e6')
    expect(result.destinationChainId).toBe(8453)
    expect(result.depositRefundTxHash).toBeNull()
    expect(result.pagination).toBeDefined()
    expect(result.pagination?.currentIndex).toBe(0)
    expect(result.pagination?.maxIndex).toBe(1)
  })
})
