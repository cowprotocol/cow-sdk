import { SupportedChainId } from '../../../chains'
import { AcrossApi } from './AcrossApi'

describe('AcrossApi: Shape of API response', () => {
  let api: AcrossApi

  beforeEach(() => {
    // Use the real API (not mocked)
    api = new AcrossApi()
  })

  describe('getAvailableRoutes', () => {
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
  })
})
