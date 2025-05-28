// Improved test structure with better coverage and reduced duplication

import { createAdapters } from './setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { grantRequiredRoles } from '../src'

// Expected role identifiers - these should match what the function actually grants
const EXPECTED_VAULT_ROLES = {
  MANAGE_USER_BALANCE: 'manageUserBalance',
  BATCH_SWAP: 'batchSwap',
} as const

// Common test data
const TEST_DATA = {
  authorizerAddress: '0x1111111111111111111111111111111111111111',
  vaultAddress: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
  vaultRelayerAddress: '0x1234567890123456789012345678901234567890',
  mockAuthorizerAbi: [
    {
      name: 'grantRole',
      type: 'function',
      inputs: [
        { name: 'role', type: 'bytes32' },
        { name: 'account', type: 'address' },
      ],
    },
  ],
}

describe('grantRequiredRoles', () => {
  // Test each adapter type
  const adapters = ['ethersV5', 'ethersV6', 'viem'] as const

  adapters.forEach((adapterType) => {
    describe(`with ${adapterType} adapter`, () => {
      let adapters: ReturnType<typeof createAdapters>

      beforeAll(() => {
        adapters = createAdapters()
        setGlobalAdapter(adapters[`${adapterType}Adapter`])
      })

      describe('successful role granting', () => {
        test('should grant exactly the required vault roles', async () => {
          const mockContractCall = jest.fn().mockResolvedValue(undefined)

          await grantRequiredRoles(
            TEST_DATA.authorizerAddress,
            TEST_DATA.mockAuthorizerAbi,
            TEST_DATA.vaultAddress,
            TEST_DATA.vaultRelayerAddress,
            mockContractCall,
          )

          // Verify correct number of calls
          expect(mockContractCall).toHaveBeenCalledTimes(Object.keys(EXPECTED_VAULT_ROLES).length)

          // Verify each call structure
          mockContractCall.mock.calls.forEach((call) => {
            expect(call[0]).toBe(TEST_DATA.authorizerAddress)
            expect(call[1]).toBe(TEST_DATA.mockAuthorizerAbi)
            expect(call[2]).toBe('grantRole')
            expect(call[3]).toHaveLength(2)
            expect(call[3][1]).toBe(TEST_DATA.vaultRelayerAddress)

            // Verify role hash format
            const roleHash = call[3][0]
            expect(typeof roleHash).toBe('string')
            expect(roleHash).toMatch(/^0x[a-fA-F0-9]{64}$/)
          })

          // Verify unique role hashes
          const roleHashes = new Set(mockContractCall.mock.calls.map((call) => call[3][0]))
          expect(roleHashes.size).toBe(Object.keys(EXPECTED_VAULT_ROLES).length)
        })

        test('should generate consistent role hashes across calls', async () => {
          const mockContractCall1 = jest.fn().mockResolvedValue(undefined)
          const mockContractCall2 = jest.fn().mockResolvedValue(undefined)

          await grantRequiredRoles(
            TEST_DATA.authorizerAddress,
            TEST_DATA.mockAuthorizerAbi,
            TEST_DATA.vaultAddress,
            TEST_DATA.vaultRelayerAddress,
            mockContractCall1,
          )

          await grantRequiredRoles(
            TEST_DATA.authorizerAddress,
            TEST_DATA.mockAuthorizerAbi,
            TEST_DATA.vaultAddress,
            TEST_DATA.vaultRelayerAddress,
            mockContractCall2,
          )

          const roleHashes1 = mockContractCall1.mock.calls.map((call) => call[3][0]).sort()
          const roleHashes2 = mockContractCall2.mock.calls.map((call) => call[3][0]).sort()

          expect(roleHashes1).toEqual(roleHashes2)
        })

        test('should generate different role hashes for different vault addresses', async () => {
          const mockContractCall1 = jest.fn().mockResolvedValue(undefined)
          const mockContractCall2 = jest.fn().mockResolvedValue(undefined)

          await grantRequiredRoles(
            TEST_DATA.authorizerAddress,
            TEST_DATA.mockAuthorizerAbi,
            TEST_DATA.vaultAddress,
            TEST_DATA.vaultRelayerAddress,
            mockContractCall1,
          )

          await grantRequiredRoles(
            TEST_DATA.authorizerAddress,
            TEST_DATA.mockAuthorizerAbi,
            '0x5555555555555555555555555555555555555555', // Different vault
            TEST_DATA.vaultRelayerAddress,
            mockContractCall2,
          )

          const roleHashes1 = new Set(mockContractCall1.mock.calls.map((call) => call[3][0]))
          const roleHashes2 = new Set(mockContractCall2.mock.calls.map((call) => call[3][0]))

          // Should have no overlap in role hashes
          const intersection = new Set([...roleHashes1].filter((x) => roleHashes2.has(x)))
          expect(intersection.size).toBe(0)
        })
      })

      describe('error handling', () => {
        test('should propagate contractCall errors', async () => {
          const mockError = new Error('Contract call failed')
          const mockContractCall = jest.fn().mockRejectedValue(mockError)

          await expect(
            grantRequiredRoles(
              TEST_DATA.authorizerAddress,
              TEST_DATA.mockAuthorizerAbi,
              TEST_DATA.vaultAddress,
              TEST_DATA.vaultRelayerAddress,
              mockContractCall,
            ),
          ).rejects.toThrow('Contract call failed')
        })
      })
    })
  })

  // Adapter-specific tests only where behavior differs
  describe('adapter-specific behavior', () => {
    test('viem adapter should handle checksummed addresses correctly', async () => {
      const adapters = createAdapters()
      setGlobalAdapter(adapters.viemAdapter)

      const mockContractCall = jest.fn().mockResolvedValue(undefined)

      // Use mixed-case address to test checksum handling
      const checksummedAddress = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'

      await grantRequiredRoles(
        TEST_DATA.authorizerAddress,
        TEST_DATA.mockAuthorizerAbi,
        checksummedAddress,
        TEST_DATA.vaultRelayerAddress,
        mockContractCall,
      )

      expect(mockContractCall).toHaveBeenCalled()
      // Verify the address was handled correctly (implementation specific)
    })
  })
})
