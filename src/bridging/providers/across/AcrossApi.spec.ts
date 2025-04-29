import { AdditionalTargetChainId, SupportedChainId } from '../../../chains'
import { AcrossApi } from './AcrossApi'
import { DepositStatusResponse } from './types'
describe('AcrossApi: Shape of API response', () => {
  let api: AcrossApi

  beforeEach(() => {
    // Use the real API (not mocked)
    api = new AcrossApi()
  })

  it('getSuggestedFees from ARBITRUM_ONE to BASE', async () => {
    // Attempt to make a REAL API call. The API implementation will assert the result shape matches the expected object
    //  Example: https://app.across.to/api/suggested-fees?token=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1&originChainId=42161&destinationChainId=8453&amount=2389939424141418&recipient=0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3
    const result = await api.getSuggestedFees({
      token: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // weth
      originChainId: SupportedChainId.ARBITRUM_ONE,
      destinationChainId: SupportedChainId.BASE,
      amount: 2389939424141418n,
      recipient: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
    })

    expect(result).toBeDefined()
  })

  it('getSuggestedFees from MAINNET to POLYGON', async () => {
    // Attempt to make a REAL API call. The API implementation will assert the result shape matches the expected object
    //  Example: https://app.across.to/api/suggested-fees?token=0x82aF49447D8a07e3bd95BD0d56f35241523fBab1&originChainId=42161&destinationChainId=8453&amount=2389939424141418&recipient=0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3
    const result = await api.getSuggestedFees({
      token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // weth
      originChainId: SupportedChainId.MAINNET,
      destinationChainId: SupportedChainId.POLYGON,
      amount: 1000000000000000000n,
      recipient: '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3',
    })

    expect(result).toBeDefined()
  })

  it('getAvailableRoutes from ARBITRUM_ONE to BASE', async () => {
    // Attempt to make a REAL API call. The API implementation will assert the result shape matches the expected object
    const result = await api.getAvailableRoutes({
      originChainId: SupportedChainId.ARBITRUM_ONE.toString(),
      originToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // weth

      destinationChainId: SupportedChainId.BASE.toString(),
      destinationToken: '0x4200000000000000000000000000000000000006', // weth
    })

    expect(result).toBeDefined()
  })

  it('getAvailableRoutes from POLYGON to ARBITRUM_ONE', async () => {
    // Attempt to make a REAL API call. The API implementation will assert the result shape matches the expected object
    const result = await api.getAvailableRoutes({
      originChainId: SupportedChainId.POLYGON.toString(),
      originToken: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // wpol

      destinationChainId: SupportedChainId.ARBITRUM_ONE.toString(),
      destinationToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // weth
    })

    expect(result).toBeDefined()
  })

  it('getDepositStatus', async () => {
    // Attempt to make a REAL API call. The API implementation will assert the result shape matches the expected object
    const result: DepositStatusResponse = await api.getDepositStatus({
      originChainId: AdditionalTargetChainId.OPTIMISM.toString(),
      depositId: '1349975',
    })

    expect(result).toBeDefined()
    expect(result.status).toBe('filled')
    expect(result.depositTxHash).toBe('0x2bb3be895fd9be20522562cd62b52ae8d58eb00b31548c2caa7fcb557708f4cf')
    expect(result.fillTx).toBe('0xee2087bfb253c4d50e2ee8ddbae14a625540534569b9e54ea31a7cb13584a3ef')
    expect(result.destinationChainId).toBe(8453)
    expect(result.depositRefundTxHash).toBeNull()
    expect(result.pagination).toBeDefined()
    expect(result.pagination?.currentIndex).toBe(0)
  })
})
