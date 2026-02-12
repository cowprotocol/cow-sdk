import { ethers } from 'ethers'
import { getPk, getRpcProvider, getWallet } from './getWallet'
import { SupportedEvmChainId } from '@cowprotocol/sdk-config'

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
        chainId: SupportedEvmChainId.MAINNET,
        name: 'homestead',
      })

      const provider = await getRpcProvider(SupportedEvmChainId.MAINNET)

      expect(ethers.providers.JsonRpcProvider).toHaveBeenCalledWith(expect.stringContaining('http'))
      expect(mockGetNetwork).toHaveBeenCalled()
      expect(provider).toBe(mockProvider)
    })

    it('should throw error when provider chain ID does not match requested chain ID', async () => {
      mockGetNetwork.mockResolvedValue({
        chainId: SupportedEvmChainId.ARBITRUM_ONE,
        name: 'arbitrum',
      })

      await expect(getRpcProvider(SupportedEvmChainId.MAINNET)).rejects.toThrow(
        `Provider is not connected to chain ${SupportedEvmChainId.MAINNET}. Provider is connected to chain ${SupportedEvmChainId.ARBITRUM_ONE} (arbitrum)`,
      )
    })

    it('should work with all supported chain IDs', async () => {
      const chainIds = [
        SupportedEvmChainId.MAINNET,
        SupportedEvmChainId.GNOSIS_CHAIN,
        SupportedEvmChainId.ARBITRUM_ONE,
        SupportedEvmChainId.BASE,
        SupportedEvmChainId.SEPOLIA,
        SupportedEvmChainId.POLYGON,
        SupportedEvmChainId.AVALANCHE,
        SupportedEvmChainId.LENS,
        SupportedEvmChainId.BNB,
        SupportedEvmChainId.LINEA,
        SupportedEvmChainId.PLASMA,
        SupportedEvmChainId.INK,
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

      await expect(getRpcProvider(SupportedEvmChainId.MAINNET)).rejects.toThrow('Network error')
    })
  })

  describe('getWallet', () => {
    beforeEach(() => {
      mockGetNetwork.mockResolvedValue({
        chainId: SupportedEvmChainId.MAINNET,
        name: 'homestead',
      })
    })

    it('should return a wallet when private key is available', async () => {
      const testPk = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      process.env.PRIVATE_KEY = testPk

      const wallet = await getWallet(SupportedEvmChainId.MAINNET)

      expect(wallet).toBe(mockWallet)
      expect(ethers.Wallet).toHaveBeenCalledWith(testPk, mockProvider)
    })

    it('should return null when private key is not available', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const wallet = await getWallet(SupportedEvmChainId.MAINNET)

      expect(wallet).toBeNull()
      expect(ethers.Wallet).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should work with different chain IDs', async () => {
      const testPk = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      process.env.PRIVATE_KEY = testPk

      const chainIds = [SupportedEvmChainId.GNOSIS_CHAIN, SupportedEvmChainId.ARBITRUM_ONE, SupportedEvmChainId.BASE]

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
        chainId: SupportedEvmChainId.ARBITRUM_ONE,
        name: 'arbitrum',
      })

      await expect(getWallet(SupportedEvmChainId.MAINNET)).rejects.toThrow(
        `Provider is not connected to chain ${SupportedEvmChainId.MAINNET}`,
      )
    })
  })
})
