import {
  getTokenId,
  areAddressesEqual,
  areTokensEqual,
  isNativeToken,
} from './token'
import { getEvmAddressKey, getBtcAddressKey, isEvmAddress, isBtcAddress, BtcAddressKey, EvmAddressKey } from './address'

describe('getEvmAddressKey', () => {
  it('should normalize EVM address to lowercase', () => {
    const address = '0x742D35CC6634C0532925A3B844BC9E7595F0BEBD'
    const result = getEvmAddressKey(address)
    expect(result).toBe('0x742d35cc6634c0532925a3b844bc9e7595f0bebd')
    expect(result).toMatch(/^0x[a-f0-9]{40}$/)
  })

  it('should handle already lowercase address', () => {
    const address = '0x742d35cc6634c0532925a3b844bc9e7595f0bebd'
    const result = getEvmAddressKey(address)
    expect(result).toBe(address)
  })

  it('should handle mixed case address', () => {
    const address = '0x742d35Cc6634C0532925a3B844Bc9e7595f0bEbD'
    const result = getEvmAddressKey(address)
    expect(result).toBe('0x742d35cc6634c0532925a3b844bc9e7595f0bebd')
  })

  it('should return EvmAddressKey type', () => {
    const address = '0x742d35cc6634c0532925a3b844bc9e7595f0bebd'
    const result: EvmAddressKey = getEvmAddressKey(address)
    expect(result).toBe(address)
  })
})

describe('getBtcAddressKey', () => {
  it('should preserve legacy BTC address as-is', () => {
    const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    const result = getBtcAddressKey(address)
    expect(result).toBe(address)
    expect(result).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
  })

  it('should preserve Bech32 BTC address as-is (lowercase)', () => {
    const address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
    const result = getBtcAddressKey(address)
    expect(result).toBe(address)
  })

  it('should preserve Bech32 BTC address as-is (uppercase)', () => {
    const address = 'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4'
    const result = getBtcAddressKey(address)
    expect(result).toBe(address)
    expect(result).toBe('BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4')
  })

  it('should preserve Bech32 BTC address as-is (mixed case)', () => {
    const address = 'bc1QW508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
    const result = getBtcAddressKey(address)
    expect(result).toBe(address)
    expect(result).toBe('bc1QW508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')
  })

  it('should return BtcAddressKey type', () => {
    const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    const result: BtcAddressKey = getBtcAddressKey(address)
    expect(result).toBe(address)
  })
})

describe('getTokenAddressKey (deprecated)', () => {
  it('should work as alias for getEvmAddressKey', () => {
    const address = '0x742D35CC6634C0532925A3B844BC9E7595F0BEBD'
    const result = getEvmAddressKey(address)
    expect(result).toBe('0x742d35cc6634c0532925a3b844bc9e7595f0bebd')
    expect(result).toBe(getEvmAddressKey(address))
  })
})

describe('getTokenId', () => {
  describe('EVM addresses', () => {
    it('should generate token ID for EVM address', () => {
      const token = {
        chainId: 1,
        address: '0x742D35CC6634C0532925A3B844BC9E7595F0BEBD',
      }
      const result = getTokenId(token)
      expect(result).toBe('1:0x742d35cc6634c0532925a3b844bc9e7595f0bebd')
    })

    it('should normalize EVM address in token ID', () => {
      const token1 = {
        chainId: 1,
        address: '0x742D35CC6634C0532925A3B844BC9E7595F0BEBD',
      }
      const token2 = {
        chainId: 1,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f0bebd',
      }
      expect(getTokenId(token1)).toBe(getTokenId(token2))
    })
  })

  describe('BTC addresses', () => {
    it('should generate token ID for BTC legacy address', () => {
      const token = {
        chainId: 0, // Assuming BTC chain ID
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      }
      const result = getTokenId(token)
      expect(result).toBe('0:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
    })

    it('should generate token ID for BTC Bech32 address', () => {
      const token = {
        chainId: 0,
        address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      }
      const result = getTokenId(token)
      expect(result).toBe('0:bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')
    })

    it('should preserve case in BTC address token ID', () => {
      const token1 = {
        chainId: 0,
        address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      }
      const token2 = {
        chainId: 0,
        address: 'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4',
      }
      // Different cases should produce different token IDs
      expect(getTokenId(token1)).not.toBe(getTokenId(token2))
    })
  })

  describe('unknown address types', () => {
    it('should default to EVM format for unknown addresses', () => {
      const token = {
        chainId: 1,
        address: 'unknown-address-format',
      }
      const result = getTokenId(token)
      // Should normalize to lowercase (EVM behavior)
      expect(result).toBe('1:unknown-address-format')
    })
  })
})

describe('areAddressesEqual', () => {
  describe('EVM addresses', () => {
    it('should return true for same EVM address (case insensitive)', () => {
      expect(areAddressesEqual('0x742D35CC6634C0532925A3B844BC9E7595F0BEBD', '0x742d35cc6634c0532925a3b844bc9e7595f0bebd')).toBe(
        true,
      )
    })

    it('should return true for same EVM address (both lowercase)', () => {
      expect(
        areAddressesEqual('0x742d35cc6634c0532925a3b844bc9e7595f0bebd', '0x742d35cc6634c0532925a3b844bc9e7595f0bebd'),
      ).toBe(true)
    })

    it('should return false for different EVM addresses', () => {
      expect(
        areAddressesEqual('0x742d35cc6634c0532925a3b844bc9e7595f0bebd', '0x1111111111111111111111111111111111111111'),
      ).toBe(false)
    })
  })

  describe('BTC addresses', () => {
    it('should return true for same BTC legacy address', () => {
      expect(areAddressesEqual('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true)
    })

    it('should return true for same BTC Bech32 address (case preserved)', () => {
      expect(
        areAddressesEqual('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'),
      ).toBe(true)
    })

    it('should return false for BTC addresses with different case (case sensitive)', () => {
      expect(
        areAddressesEqual('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4'),
      ).toBe(false)
    })

    it('should return false for different BTC addresses', () => {
      expect(
        areAddressesEqual('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'),
      ).toBe(false)
    })
  })

  describe('mixed address types', () => {
    it('should return false when comparing EVM and BTC addresses', () => {
      expect(areAddressesEqual('0x742d35cc6634c0532925a3b844bc9e7595f0bebd', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(
        false,
      )
    })
  })

  describe('edge cases', () => {
    it('should return false for null values', () => {
      expect(areAddressesEqual(null, '0x742d35cc6634c0532925a3b844bc9e7595f0bebd')).toBe(false)
      expect(areAddressesEqual('0x742d35cc6634c0532925a3b844bc9e7595f0bebd', null)).toBe(false)
      expect(areAddressesEqual(null, null)).toBe(false)
    })

    it('should return false for undefined values', () => {
      expect(areAddressesEqual(undefined, '0x742d35cc6634c0532925a3b844bc9e7595f0bebd')).toBe(false)
      expect(areAddressesEqual('0x742d35cc6634c0532925a3b844bc9e7595f0bebd', undefined)).toBe(false)
      expect(areAddressesEqual(undefined, undefined)).toBe(false)
    })

    it('should return false for invalid addresses', () => {
      expect(areAddressesEqual('invalid-address', '0x742d35cc6634c0532925a3b844bc9e7595f0bebd')).toBe(false)
      expect(areAddressesEqual('0x742d35cc6634c0532925a3b844bc9e7595f0bebd', 'invalid-address')).toBe(false)
      expect(areAddressesEqual('invalid-address-1', 'invalid-address-2')).toBe(false)
    })
  })
})

describe('areTokensEqual', () => {
  describe('EVM tokens', () => {
    it('should return true for same token (case insensitive address)', () => {
      const token1 = {
        chainId: 1,
        address: '0x742D35CC6634C0532925A3B844BC9E7595F0BEBD',
      }
      const token2 = {
        chainId: 1,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f0bebd',
      }
      expect(areTokensEqual(token1, token2)).toBe(true)
    })

    it('should return false for different chain IDs', () => {
      const token1 = {
        chainId: 1,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f0bebd',
      }
      const token2 = {
        chainId: 137,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f0bebd',
      }
      expect(areTokensEqual(token1, token2)).toBe(false)
    })

    it('should return false for different addresses', () => {
      const token1 = {
        chainId: 1,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f0bebd',
      }
      const token2 = {
        chainId: 1,
        address: '0x1111111111111111111111111111111111111111',
      }
      expect(areTokensEqual(token1, token2)).toBe(false)
    })
  })

  describe('BTC tokens', () => {
    it('should return true for same BTC token', () => {
      const token1 = {
        chainId: 0,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      }
      const token2 = {
        chainId: 0,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      }
      expect(areTokensEqual(token1, token2)).toBe(true)
    })

    it('should return false for BTC tokens with different case (case sensitive)', () => {
      const token1 = {
        chainId: 0,
        address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      }
      const token2 = {
        chainId: 0,
        address: 'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4',
      }
      expect(areTokensEqual(token1, token2)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should return false for null values', () => {
      const token = {
        chainId: 1,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f0bebd',
      }
      expect(areTokensEqual(null, token)).toBe(false)
      expect(areTokensEqual(token, null)).toBe(false)
      expect(areTokensEqual(null, null)).toBe(false)
    })

    it('should return false for undefined values', () => {
      const token = {
        chainId: 1,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f0bebd',
      }
      expect(areTokensEqual(undefined, token)).toBe(false)
      expect(areTokensEqual(token, undefined)).toBe(false)
      expect(areTokensEqual(undefined, undefined)).toBe(false)
    })
  })
})

describe('type guards integration', () => {
  it('should work with isEvmAddress type guard', () => {
    const address = '0x742d35cc6634c0532925a3b844bc9e7595f0bebd'
    if (isEvmAddress(address)) {
      const evmKey: EvmAddressKey = address
      const result = getEvmAddressKey(evmKey)
      expect(result).toBe('0x742d35cc6634c0532925a3b844bc9e7595f0bebd')
    }
  })

  it('should work with isBtcAddress type guard', () => {
    const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    if (isBtcAddress(address)) {
      const btcKey: BtcAddressKey = address
      const result = getBtcAddressKey(btcKey)
      expect(result).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
    }
  })
})

describe('isNativeToken', () => {
  describe('EVM native tokens', () => {
    it('should return true for EVM native token on mainnet', () => {
      const token = {
        chainId: 1,
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // NATIVE_CURRENCY_ADDRESS
      }
      expect(isNativeToken(token)).toBe(true)
    })

    it('should return true for EVM native token with case-insensitive address', () => {
      const token = {
        chainId: 1,
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // lowercase NATIVE_CURRENCY_ADDRESS
      }
      expect(isNativeToken(token)).toBe(true)
    })

    it('should return true for EVM native token on other EVM chains', () => {
      const token = {
        chainId: 137, // Polygon
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      }
      expect(isNativeToken(token)).toBe(true)
    })

    it('should return false for non-native token on EVM chain', () => {
      const token = {
        chainId: 1,
        address: '0x742d35cc6634c0532925a3b844bc9e7595f0bebd', // Some ERC20 token
      }
      expect(isNativeToken(token)).toBe(false)
    })

    it('should return false for wrapped native token on EVM chain', () => {
      const token = {
        chainId: 1,
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      }
      expect(isNativeToken(token)).toBe(false)
    })
  })

  describe('non-EVM native tokens (BTC)', () => {
    it('should return true for BTC native token with empty address', () => {
      const token = {
        chainId: 'bitcoin' as const,
        address: '', // Empty address for native BTC
      }
      expect(isNativeToken(token)).toBe(true)
    })

    it('should return false for BTC token with non-empty address', () => {
      const token = {
        chainId: 'bitcoin' as const,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // BTC address
      }
      expect(isNativeToken(token)).toBe(false)
    })

    it('should return false for BTC token with any address value', () => {
      const token = {
        chainId: 'bitcoin' as const,
        address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', // Bech32 BTC address
      }
      expect(isNativeToken(token)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should return false for unknown chain ID', () => {
      const token = {
        chainId: 99999, // Unknown chain
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      }
      expect(isNativeToken(token)).toBe(false)
    })

    it('should return false for invalid chain ID', () => {
      const token = {
        chainId: 'unknown-chain' as any,
        address: '',
      }
      expect(isNativeToken(token)).toBe(false)
    })

    it('should handle EVM chain with missing chain info gracefully', () => {
      const token = {
        chainId: 99999, // Non-existent EVM chain
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      }
      expect(isNativeToken(token)).toBe(false)
    })
  })
})
