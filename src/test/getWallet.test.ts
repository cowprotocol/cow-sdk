import { SupportedChainId } from '../chains'
import { getWallet } from './getWallet'

describe('getWallet', () => {
  it('should return a wallet', async () => {
    const wallet = await getWallet(SupportedChainId.MAINNET)
    expect(wallet).toBeDefined()
  })
})
