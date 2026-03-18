import {
  isEvmChain,
  isNonEvmChain,
  isBtcChain,
  isEvmChainInfo,
  isNonEvmChainInfo,
  EvmChains,
  NonEvmChains,
  SupportedChainId,
  mainnet,
  bitcoin,
  solana,
} from '@cowprotocol/sdk-config'

describe('isEvmChain', () => {
  describe('valid EVM chains', () => {
    it('should return true for Mainnet', () => {
      expect(isEvmChain(EvmChains.MAINNET)).toBe(true)
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

    it('should return false for non-EVM chain (Solana)', () => {
      expect(isEvmChain(SupportedChainId.SOLANA)).toBe(false)
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
      const chainId: NonEvmChains = NonEvmChains.BITCOIN
      expect(chainId).toBe(1000000000)
    })

    it('should return true for Solana', () => {
      expect(isNonEvmChain(SupportedChainId.SOLANA)).toBe(true)
    })

    it('should return true for any valid non-EVM chain ID', () => {
      const validNonEvmChainIds = Object.values(NonEvmChains).filter((v) => typeof v === 'number') as NonEvmChains[]
      validNonEvmChainIds.forEach((chainId) => {
        expect(isNonEvmChain(chainId)).toBe(true)
      })
    })
  })

  describe('invalid non-EVM chains', () => {
    it('should return false for EVM chain (Mainnet)', () => {
      expect(isNonEvmChain(EvmChains.MAINNET)).toBe(false)
    })

    it('should return false for unknown number', () => {
      expect(isNonEvmChain(99999)).toBe(false)
    })
  })
})

describe('isEvmChainInfo', () => {
  it('should return true for an EVM chain info (Mainnet)', () => {
    expect(isEvmChainInfo(mainnet)).toBe(true)
  })

  it('should return false for a non-EVM chain info (Bitcoin)', () => {
    expect(isEvmChainInfo(bitcoin)).toBe(false)
  })

  it('should return false for a non-EVM chain info (Solana)', () => {
    expect(isEvmChainInfo(solana)).toBe(false)
  })

  it('should narrow the type to EvmChainInfo', () => {
    if (isEvmChainInfo(mainnet)) {
      expect(mainnet.rpcUrls).toBeDefined()
      expect(mainnet.contracts).toBeDefined()
      expect(mainnet.nativeCurrency.address).toBeDefined()
    }
  })
})

describe('isNonEvmChainInfo', () => {
  it('should return true for a non-EVM chain info (Bitcoin)', () => {
    expect(isNonEvmChainInfo(bitcoin)).toBe(true)
  })

  it('should return true for a non-EVM chain info (Solana)', () => {
    expect(isNonEvmChainInfo(solana)).toBe(true)
  })

  it('should return false for an EVM chain info (Mainnet)', () => {
    expect(isNonEvmChainInfo(mainnet)).toBe(false)
  })

  it('should narrow the type to NonEvmChainInfo', () => {
    if (isNonEvmChainInfo(bitcoin)) {
      expect(bitcoin.id).toBe(NonEvmChains.BITCOIN)
    }
  })
})

describe('isBtcChain', () => {
  it('should return true for Bitcoin', () => {
    expect(isBtcChain(NonEvmChains.BITCOIN)).toBe(true)
  })

  it('should return false for EVM chain', () => {
    expect(isBtcChain(EvmChains.MAINNET)).toBe(false)
  })

  it('should return false for Solana', () => {
    expect(isBtcChain(SupportedChainId.SOLANA)).toBe(false)
  })

  it('should return false for invalid chain', () => {
    expect(isBtcChain(99999)).toBe(false)
  })
})
