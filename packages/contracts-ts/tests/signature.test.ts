import { createAdapters } from './setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  InteractionLike,
  normalizeInteraction,
  normalizeInteractions,
  Eip1271SignatureData,
  encodeEip1271SignatureData,
  decodeEip1271SignatureData,
  EIP1271_MAGICVALUE,
} from '../src'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'

describe('Interactions and EIP-1271 Signatures', () => {
  let adapters: ReturnType<typeof createAdapters>

  beforeAll(() => {
    adapters = createAdapters()
  })

  describe('normalizeInteraction', () => {
    test('should normalize interactions consistently across different adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Test cases
      const testCases: InteractionLike[] = [
        {
          target: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET],
        },
        {
          target: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET],
          callData: '0x12345678',
        },
        {
          target: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET],
          value: '1000000000000000000',
        },
        {
          target: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET],
          callData: '0x12345678',
          value: '1000000000000000000',
        },
      ]

      for (const testCase of testCases) {
        const normalizedResults: any[] = []

        // Normalize with each adapter
        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          const normalized = normalizeInteraction(testCase)
          normalizedResults.push(normalized)
        }

        // All normalized interactions should be identical
        const [firstNormalized, ...remainingNormalized] = normalizedResults
        remainingNormalized.forEach((normalized) => {
          expect(normalized).toEqual(firstNormalized)
        })

        // Verify defaults were applied
        expect(firstNormalized.target).toEqual(testCase.target)
        expect(firstNormalized.callData).toEqual(testCase.callData || '0x')
        expect(firstNormalized.value).toEqual(testCase.value || 0)
      }
    })
  })

  describe('normalizeInteractions', () => {
    test('should normalize multiple interactions consistently', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Test batch of interactions
      const interactions: InteractionLike[] = [
        {
          target: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET],
        },
        {
          target: '0x1234567890123456789012345678901234567890',
          callData: '0x12345678',
        },
        {
          target: '0xabcdef0123456789abcdef0123456789abcdef01',
          value: '1000000000000000000',
        },
      ]

      const normalizedResults: any[] = []

      // Normalize batch with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const normalized = normalizeInteractions(interactions)
        normalizedResults.push(normalized)
      }

      // All normalized interactions should be identical
      const [firstNormalized, ...remainingNormalized] = normalizedResults
      remainingNormalized.forEach((normalized) => {
        expect(normalized).toEqual(firstNormalized)
      })

      // Verify length and content
      expect(firstNormalized.length).toEqual(interactions.length)

      for (let i = 0; i < interactions.length; i++) {
        expect(firstNormalized[i]?.target).toEqual(interactions[i]?.target)
        expect(firstNormalized[i]?.callData).toEqual(interactions[i]?.callData || '0x')
        expect(firstNormalized[i]?.value).toEqual(interactions[i]?.value || 0)
      }
    })
  })

  describe('EIP-1271 signature encoding/decoding', () => {
    test('should encode and decode EIP-1271 signatures consistently', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Test signature data
      const signatureData: Eip1271SignatureData = {
        verifier: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET],
        signature:
          '0x29a674dfc87f8c78fc2bfbcbe8ffdd435091a6a84bc7761db72a45da453d73ac41c5ce28eceb34be73fddc12a5d04af6e736405e41b613aeefeed3db8122420c1b',
      }

      const encodedResults: string[] = []
      const decodedResults: Eip1271SignatureData[] = []

      // Encode with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const encoded = encodeEip1271SignatureData(signatureData)
        encodedResults.push(encoded)
      }

      // All encoded signatures should be identical
      const [firstEncoded, ...remainingEncoded] = encodedResults
      remainingEncoded.forEach((encoded) => {
        expect(encoded).toEqual(firstEncoded)
      })

      // Decode with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const decoded = decodeEip1271SignatureData(firstEncoded)
        decodedResults.push(decoded)
      }

      // All decoded signatures should be identical and match input
      decodedResults.forEach((decoded) => {
        expect(decoded).toEqual(signatureData)
      })

      // Test with different signature lengths
      const signatures = [
        '0x', // Empty
        '0x1234', // Short
        '0x' + '1234'.repeat(32), // Long
      ]

      for (const signature of signatures) {
        const testData: Eip1271SignatureData = {
          verifier: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET],
          signature,
        }

        // Encode and decode with each adapter and verify consistency
        const encodeResults: string[] = []
        const decodeResults: Eip1271SignatureData[] = []

        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          const encoded = encodeEip1271SignatureData(testData)
          const decoded = decodeEip1271SignatureData(encoded)
          encodeResults.push(encoded)
          decodeResults.push(decoded)
        }

        // All encoded results should be identical
        const [firstEncode, ...remainingEncode] = encodeResults
        remainingEncode.forEach((encoded) => {
          expect(encoded).toEqual(firstEncode)
        })

        // All decoded results should be identical and match input
        decodeResults.forEach((decoded) => {
          expect(decoded.verifier).toEqual(testData.verifier)
          expect(decoded.signature).toEqual(testData.signature)
        })
      }
    })

    test('EIP1271_MAGICVALUE should be consistent with the standard', () => {
      // The EIP-1271 magic value should be 0x1626ba7e
      expect(EIP1271_MAGICVALUE).toEqual('0x1626ba7e')
    })
  })
})
