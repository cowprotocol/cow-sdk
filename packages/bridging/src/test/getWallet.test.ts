import { ethers } from 'ethers'
import { getPk, getRpcProvider, getWallet } from './getWallet'
import { SupportedChainId } from '@cowprotocol/sdk-config'

// Mock ethers to avoid actual network calls
jest.mock('ethers')

const mockGetNetwork = jest.fn()
const mockProvider = {
  getNetwork: mockGetNetwork,
} as unknown as ethers.providers.JsonRpcProvider

const mockWallet = {
  address: '0x1234567890123456789012345678901234567890',
  privateKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
} as unknown as ethers.Wallet

describe('getWallet utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.PRIVATE_KEY
    ;(ethers.providers.JsonRpcProvider as unknown as jest.Mock) = jest.fn().mockReturnValue(mockProvider)
    ;(ethers.Wallet as unknown as jest.Mock) = jest.fn().mockReturnValue(mockWallet)
  })

  describe('getPk', () => {
    it('should return private key when PRIVATE_KEY env var is set', () => {
      const testPk = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      process.env.PRIVATE_KEY = testPk

      const result = getPk()
      expect(result).toBe(testPk)
    })

    it('should return undefined when PRIVATE_KEY env var is not set', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const result = getPk()

      expect(result).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith('PRIVATE_KEY is not set')

      consoleSpy.mockRestore()
    })

    it('should return undefined when PRIVATE_KEY env var is empty string', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      process.env.PRIVATE_KEY = ''

      const result = getPk()

      expect(result).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith('PRIVATE_KEY is not set')

      consoleSpy.mockRestore()
    })
  })

  describe('getRpcProvider', () => {
    it('should create provider for valid chain ID', async () => {
      mockGetNetwork.mockResolvedValue({
        chainId: SupportedChainId.MAINNET,
        name: 'homestead',
      })

      const provider = await getRpcProvider(SupportedChainId.MAINNET)

      expect(ethers.providers.JsonRpcProvider).toHaveBeenCalledWith(expect.stringContaining('http'))
      expect(mockGetNetwork).toHaveBeenCalled()
      expect(provider).toBe(mockProvider)
    })

    it('should throw error when provider chain ID does not match requested chain ID', async () => {
      mockGetNetwork.mockResolvedValue({
        chainId: SupportedChainId.ARBITRUM_ONE,
        name: 'arbitrum',
      })

      await expect(getRpcProvider(SupportedChainId.MAINNET)).rejects.toThrow(
        `Provider is not connected to chain ${SupportedChainId.MAINNET}. Provider is connected to chain ${SupportedChainId.ARBITRUM_ONE} (arbitrum)`,
      )
    })

    it('should work with all supported chain IDs', async () => {
      const chainIds = [
        SupportedChainId.MAINNET,
        SupportedChainId.GNOSIS_CHAIN,
        SupportedChainId.ARBITRUM_ONE,
        SupportedChainId.BASE,
        SupportedChainId.SEPOLIA,
        SupportedChainId.POLYGON,
        SupportedChainId.AVALANCHE,
        SupportedChainId.LENS,
        SupportedChainId.BNB,
        SupportedChainId.LINEA,
        SupportedChainId.PLASMA,
      ]

      for (const chainId of chainIds) {
        mockGetNetwork.mockResolvedValue({
          chainId,
          name: `chain-${chainId}`,
        })

        const provider = await getRpcProvider(chainId)
        expect(provider).toBe(mockProvider)
      }
    })

    it('should handle network errors gracefully', async () => {
      mockGetNetwork.mockRejectedValue(new Error('Network error'))

      await expect(getRpcProvider(SupportedChainId.MAINNET)).rejects.toThrow('Network error')
    })
  })

  describe('getWallet', () => {
    beforeEach(() => {
      mockGetNetwork.mockResolvedValue({
        chainId: SupportedChainId.MAINNET,
        name: 'homestead',
      })
    })

    it('should return a wallet when private key is available', async () => {
      const testPk = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      process.env.PRIVATE_KEY = testPk

      const wallet = await getWallet(SupportedChainId.MAINNET)

      expect(wallet).toBe(mockWallet)
      expect(ethers.Wallet).toHaveBeenCalledWith(testPk, mockProvider)
    })

    it('should return null when private key is not available', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const wallet = await getWallet(SupportedChainId.MAINNET)

      expect(wallet).toBeNull()
      expect(ethers.Wallet).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should work with different chain IDs', async () => {
      const testPk = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      process.env.PRIVATE_KEY = testPk

      const chainIds = [SupportedChainId.GNOSIS_CHAIN, SupportedChainId.ARBITRUM_ONE, SupportedChainId.BASE]

      for (const chainId of chainIds) {
        mockGetNetwork.mockResolvedValue({
          chainId,
          name: `chain-${chainId}`,
        })

        const wallet = await getWallet(chainId)
        expect(wallet).toBe(mockWallet)
        expect(ethers.Wallet).toHaveBeenCalledWith(testPk, mockProvider)
      }
    })

    it('should propagate errors from getRpcProvider', async () => {
      const testPk = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      process.env.PRIVATE_KEY = testPk

      mockGetNetwork.mockResolvedValue({
        chainId: SupportedChainId.ARBITRUM_ONE,
        name: 'arbitrum',
      })

      await expect(getWallet(SupportedChainId.MAINNET)).rejects.toThrow(
        `Provider is not connected to chain ${SupportedChainId.MAINNET}`,
      )
    })
  })
})
