import { createAdapters, TEST_ADDRESS } from './setup'

describe('Adapter Setup', () => {
  let adapters: ReturnType<typeof createAdapters>

  beforeAll(() => {
    adapters = createAdapters()
  })

  // Close connections specifically for each adapter
  afterAll(async () => {
    // For ethers v5
    try {
      const ethersV5Wallet = (adapters.ethersV5Adapter as any)._wallet || (adapters.ethersV5Adapter as any).wallet
      const ethersV5Provider = ethersV5Wallet?.provider

      if (ethersV5Provider) {
        // Try different ways to close the connection
        if (typeof ethersV5Provider.disconnect === 'function') {
          ethersV5Provider.disconnect()
        }
        if (typeof ethersV5Provider.destroy === 'function') {
          ethersV5Provider.destroy()
        }
        // Force the provider to remove all listeners
        if (typeof ethersV5Provider.removeAllListeners === 'function') {
          ethersV5Provider.removeAllListeners()
        }
      }
    } catch (e) {
      console.error('Error closing ethersV5 provider:', e)
    }

    // For ethers v6
    try {
      const ethersV6Wallet = (adapters.ethersV6Adapter as any)._wallet || (adapters.ethersV6Adapter as any).wallet
      const ethersV6Provider = ethersV6Wallet?.provider

      if (ethersV6Provider) {
        // Try to close any open connections
        if (typeof ethersV6Provider.destroy === 'function') {
          await ethersV6Provider.destroy()
        }
        // Some ethers v6 providers have a different method name
        if (typeof ethersV6Provider.disconnect === 'function') {
          await ethersV6Provider.disconnect()
        }

        // If there's a specific connection property, try to close it directly
        if (ethersV6Provider.connection) {
          if (typeof ethersV6Provider.connection.close === 'function') {
            await ethersV6Provider.connection.close()
          }
        }

        // Make sure no listeners remain
        if (typeof ethersV6Provider.removeAllListeners === 'function') {
          ethersV6Provider.removeAllListeners()
        }
      }
    } catch (e) {
      console.error('Error closing ethersV6 provider:', e)
    }

    // For viem
    try {
      // Access the client or transport directly
      const viemClient = (adapters.viemAdapter as any)._client || (adapters.viemAdapter as any).client
      const viemTransport = (adapters.viemAdapter as any)._transport || (adapters.viemAdapter as any).transport

      // Close the client if it exists
      if (viemClient && typeof viemClient.destroy === 'function') {
        await viemClient.destroy()
      }

      // Close the transport if it exists
      if (viemTransport && typeof viemTransport.destroy === 'function') {
        await viemTransport.destroy()
      }
    } catch (e) {
      console.error('Error closing viem adapter:', e)
    }

    // Give some time for connections to fully close
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }, 10000) // 10 second timeout for cleanup

  test('adapters should be created without errors', () => {
    expect(adapters.ethersV5Adapter).toBeDefined()
    expect(adapters.ethersV6Adapter).toBeDefined()
    expect(adapters.viemAdapter).toBeDefined()
  })

  describe('Provider tests', () => {
    test('all adapters should have valid providers with the same chain ID', async () => {
      const adapterEntries = [
        ['ethersV5Adapter', adapters.ethersV5Adapter],
        ['ethersV6Adapter', adapters.ethersV6Adapter],
        ['viemAdapter', adapters.viemAdapter],
      ] as const

      // Get chain IDs from all adapters
      const results = await Promise.all(
        adapterEntries.map(async ([name, adapter]) => {
          const chainId = await adapter.getChainId()
          return { name, chainId }
        }),
      )

      // Verify all chain IDs are valid
      for (const result of results) {
        expect(result.chainId).toBeGreaterThan(0)
        expect(typeof result.chainId).toBe('number')
      }

      // Verify all chain IDs are the same
      const firstChainId = results[0]?.chainId
      for (let i = 1; i < results.length; i++) {
        expect(results[i]?.chainId).toBe(firstChainId)
      }
    })
  })

  describe('Signer tests', () => {
    test('all adapters should have valid signers with the same correct address', async () => {
      const adapterEntries = [
        ['ethersV5Adapter', adapters.ethersV5Adapter],
        ['ethersV6Adapter', adapters.ethersV6Adapter],
        ['viemAdapter', adapters.viemAdapter],
      ] as const

      // Get addresses from all adapters
      const results = await Promise.all(
        adapterEntries.map(async ([name, adapter]) => {
          const address = await adapter.getAddress()
          return { name, address }
        }),
      )

      // Verify all addresses are correct
      for (const result of results) {
        expect(result.address.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase())
      }

      // Additional verification that all adapters return the same address
      const firstAddress = results[0]?.address.toLowerCase()
      for (let i = 1; i < results.length; i++) {
        expect(results[i]?.address.toLowerCase()).toBe(firstAddress)
      }
    })

    test('all adapters should be able to sign messages with the same signature', async () => {
      const adapterEntries = [
        ['ethersV5Adapter', adapters.ethersV5Adapter],
        ['ethersV6Adapter', adapters.ethersV6Adapter],
        ['viemAdapter', adapters.viemAdapter],
      ] as const

      const testMessage = 'Test message'

      // Get signatures from all adapters
      const results = await Promise.all(
        adapterEntries.map(async ([name, adapter]) => {
          const signature = await adapter.signMessage(testMessage)
          return { name, signature }
        }),
      )

      // Verify all signatures are in the correct format
      for (const result of results) {
        expect(result.signature).toBeTruthy()
        expect(result.signature.startsWith('0x')).toBe(true)
        expect(result.signature.length).toBeGreaterThan(65) // Signatures should be at least 65 bytes
      }

      // Additional verification that all adapters return the same signature
      const firstSignature = results[0]?.signature.toLowerCase()
      for (let i = 1; i < results.length; i++) {
        expect(results[i]?.signature.toLowerCase()).toBe(firstSignature)
      }
    })
  })
})
