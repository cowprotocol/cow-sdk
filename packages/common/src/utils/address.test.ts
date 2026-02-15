import { isEvmAddress, isBtcAddress, BtcAddressKey, EvmAddressKey } from './address'

describe('isEvmAddress', () => {
  describe('valid EVM addresses', () => {
    it('should return true for valid lowercase EVM address', () => {
      const address = '0x742d35cc6634c0532925a3b844bc9e7595f0bebd'
      expect(isEvmAddress(address)).toBe(true)
      // Type guard should work
      const evmKey: EvmAddressKey = address
      expect(evmKey).toBe(address)
    })

    it('should return true for valid uppercase EVM address', () => {
      const address = '0x742D35CC6634C0532925A3B844BC9E7595F0BEBD'
      expect(isEvmAddress(address)).toBe(true)
    })

    it('should return true for valid mixed case EVM address', () => {
      const address = '0x742d35Cc6634C0532925a3B844Bc9e7595f0bEbD'
      expect(isEvmAddress(address)).toBe(true)
    })

    it('should return true for zero address', () => {
      expect(isEvmAddress('0x0000000000000000000000000000000000000000')).toBe(true)
    })

    it('should return true for address with all f characters', () => {
      expect(isEvmAddress('0xffffffffffffffffffffffffffffffffffffffff')).toBe(true)
    })
  })

  describe('invalid EVM addresses', () => {
    it('should return false for address without 0x prefix', () => {
      expect(isEvmAddress('742d35cc6634c0532925a3b844bc9e7595f0bebd')).toBe(false)
    })

    it('should return false for address with wrong length (too short)', () => {
      expect(isEvmAddress('0x742d35cc6634c0532925a3b844bc9e7595f0be')).toBe(false)
    })

    it('should return false for address with wrong length (too long)', () => {
      expect(isEvmAddress('0x742d35cc6634c0532925a3b844bc9e7595f0bebd00')).toBe(false)
    })

    it('should return false for address with invalid hex characters', () => {
      expect(isEvmAddress('0x742d35cc6634c0532925a3b844bc9e7595f0bebg')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isEvmAddress('')).toBe(false)
    })

    it('should return false for non-string values', () => {
      expect(isEvmAddress(null as any)).toBe(false)
      expect(isEvmAddress(undefined as any)).toBe(false)
      expect(isEvmAddress(123 as any)).toBe(false)
      expect(isEvmAddress({} as any)).toBe(false)
    })

    it('should return false for BTC address (legacy)', () => {
      expect(isEvmAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(false)
    })

    it('should return false for BTC address (Bech32)', () => {
      expect(isEvmAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toBe(false)
    })
  })
})

describe('isBtcAddress', () => {
  describe('valid BTC addresses - Legacy (P2PKH)', () => {
    it('should return true for valid legacy address starting with 1', () => {
      const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      expect(isBtcAddress(address)).toBe(true)
      // Type guard should work
      const btcKey: BtcAddressKey = address
      expect(btcKey).toBe(address)
    })

    it('should return true for valid legacy address starting with 3 (P2SH)', () => {
      expect(isBtcAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true)
    })

    it('should return true for valid legacy address with minimum length', () => {
      expect(isBtcAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN')).toBe(true)
    })

    it('should return true for valid legacy address with maximum length', () => {
      expect(isBtcAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true)
    })
  })

  describe('valid BTC addresses - Bech32 (P2WPKH/P2WSH)', () => {
    it('should return true for valid Bech32 mainnet address (bc1)', () => {
      const address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
      expect(isBtcAddress(address)).toBe(true)
    })

    it('should return true for valid Bech32 mainnet address (uppercase)', () => {
      expect(isBtcAddress('BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4')).toBe(true)
    })

    it('should return true for valid Bech32 mainnet address (mixed case)', () => {
      expect(isBtcAddress('bc1QW508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toBe(true)
    })

    it('should return true for valid Bech32 testnet address (tb1)', () => {
      expect(isBtcAddress('tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx')).toBe(true)
    })

    it('should return true for longer Bech32 address (P2WSH)', () => {
      expect(
        isBtcAddress('bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3'),
      ).toBe(true)
    })
  })

  describe('invalid BTC addresses', () => {
    it('should return false for address that is too short', () => {
      expect(isBtcAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf')).toBe(false)
    })

    it('should return false for address that is too long', () => {
      expect(isBtcAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4extra')).toBe(false)
    })

    it('should return false for EVM address', () => {
      expect(isBtcAddress('0x742d35cc6634c0532925a3b844bc9e7595f0bebd')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isBtcAddress('')).toBe(false)
    })

    it('should return false for non-string values', () => {
      expect(isBtcAddress(null as any)).toBe(false)
      expect(isBtcAddress(undefined as any)).toBe(false)
      expect(isBtcAddress(123 as any)).toBe(false)
      expect(isBtcAddress({} as any)).toBe(false)
    })

    it('should return false for invalid legacy address format', () => {
      expect(isBtcAddress('0A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(false) // starts with 0
      expect(isBtcAddress('2A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(false) // starts with 2
    })

    it('should return false for invalid Bech32 address', () => {
      expect(isBtcAddress('ac1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toBe(false) // wrong prefix
      expect(isBtcAddress('bc0qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toBe(false) // wrong prefix
    })
  })

  describe('case sensitivity', () => {
    it('should preserve case for Bech32 addresses', () => {
      const lower = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
      const upper = 'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4'
      const mixed = 'bc1QW508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'

      expect(isBtcAddress(lower)).toBe(true)
      expect(isBtcAddress(upper)).toBe(true)
      expect(isBtcAddress(mixed)).toBe(true)

      // They should be considered different addresses
      expect(lower).not.toBe(upper)
      expect(lower).not.toBe(mixed)
    })
  })
})
