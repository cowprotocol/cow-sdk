import { isEvmChain, isNonEvmChain, isBtcChain, EvmChains, NonEvmChains } from '@cowprotocol/sdk-config'

describe('isEvmChain', () => {
  describe('valid EVM chains', () => {
    it('should return true for Mainnet', () => {
      expect(isEvmChain(EvmChains.MAINNET)).toBe(true)
      // Type guard should work
      const chainId: EvmChains = EvmChains.MAINNET
      expect(chainId).toBe(1)
    })

    it('should return true for Sepolia', () => {
      expect(isEvmChain(EvmChains.SEPOLIA)).toBe(true)
    })

    it('should return true for Gnosis Chain', () => {
      expect(isEvmChain(EvmChains.GNOSIS_CHAIN)).toBe(true)
    })

    it('should return true for any valid EVM chain ID', () => {
      const validEvmChainIds = Object.values(EvmChains).filter((v) => typeof v === 'number') as EvmChains[]
      validEvmChainIds.forEach((chainId) => {
        expect(isEvmChain(chainId)).toBe(true)
      })
    })
  })

  describe('invalid EVM chains', () => {
    it('should return false for non-EVM chain (Bitcoin)', () => {
      expect(isEvmChain(NonEvmChains.BITCOIN)).toBe(false)
    })

    it('should return false for string chain ID', () => {
      expect(isEvmChain('bitcoin')).toBe(false)
    })

    it('should return false for invalid number', () => {
      expect(isEvmChain(99999)).toBe(false)
    })
  })
})

describe('isNonEvmChain', () => {
  describe('valid non-EVM chains', () => {
    it('should return true for Bitcoin', () => {
      expect(isNonEvmChain(NonEvmChains.BITCOIN)).toBe(true)
      // Type guard should work
      const chainId: NonEvmChains = NonEvmChains.BITCOIN
      expect(chainId).toBe('bitcoin')
    })

    it('should return true for any valid non-EVM chain ID', () => {
      const validNonEvmChainIds = Object.values(NonEvmChains) as NonEvmChains[]
      validNonEvmChainIds.forEach((chainId) => {
        expect(isNonEvmChain(chainId)).toBe(true)
      })
    })
  })

  describe('invalid non-EVM chains', () => {
    it('should return false for EVM chain (Mainnet)', () => {
      expect(isNonEvmChain(EvmChains.MAINNET)).toBe(false)
    })

    it('should return false for number chain ID', () => {
      expect(isNonEvmChain(1)).toBe(false)
    })

    it('should return false for invalid string', () => {
      expect(isNonEvmChain('invalid-chain')).toBe(false)
    })
  })
})

describe('isBtcChain', () => {
  it('should return true for Bitcoin', () => {
    expect(isBtcChain(NonEvmChains.BITCOIN)).toBe(true)
  })

  it('should return false for EVM chain', () => {
    expect(isBtcChain(EvmChains.MAINNET)).toBe(false)
  })

  it('should return false for invalid chain', () => {
    expect(isBtcChain('invalid')).toBe(false)
  })
})
