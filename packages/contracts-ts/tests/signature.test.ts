import { createAdapters } from './setup'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  ContractsTs,
  InteractionLike,
  normalizeInteraction,
  normalizeInteractions,
  Eip1271SignatureData,
  encodeEip1271SignatureData,
  decodeEip1271SignatureData,
  EIP1271_MAGICVALUE,
} from '../src'
//@ts-ignore
import { log } from 'console'

describe('Interactions and EIP-1271 Signatures', () => {
  let adapters: ReturnType<typeof createAdapters>
  let contracts: {
    ethersV5Contracts: ContractsTs
    ethersV6Contracts: ContractsTs
    viemContracts: ContractsTs
  }

  beforeAll(() => {
    adapters = createAdapters()
    contracts = {
      ethersV5Contracts: new ContractsTs(adapters.ethersV5Adapter),
      ethersV6Contracts: new ContractsTs(adapters.ethersV6Adapter),
      viemContracts: new ContractsTs(adapters.viemAdapter),
    }
  })

  describe('normalizeInteraction', () => {
    test('should normalize interactions consistently across different adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Test cases
      const testCases: InteractionLike[] = [
        {
          target: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
        },
        {
          target: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
          callData: '0x12345678',
        },
        {
          target: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
          value: '1000000000000000000',
        },
        {
          target: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
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
          target: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
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
        expect(firstNormalized[i]!.target).toEqual(interactions[i]!.target)
        expect(firstNormalized[i]!.callData).toEqual(interactions[i]!.callData || '0x')
        expect(firstNormalized[i]!.value).toEqual(interactions[i]!.value || 0)
      }
    })
  })

  describe('EIP-1271 signature encoding/decoding', () => {
    test('should encode and decode EIP-1271 signatures consistently', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Test signature data
      const signatureData: Eip1271SignatureData = {
        verifier: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
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
          verifier: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
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

    test('should handle different verifier address formats', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Test with addresses in different formats (lowercase, uppercase, mixed)
      const verifiers = [
        '0x9008d19f58aabd9ed0d60971565aa8510560ab41', // lowercase
        '0x9008D19F58AABD9ED0D60971565AA8510560AB41', // uppercase
        '0x9008D19f58AAbD9eD0D60971565AA8510560ab41', // mixed
      ]

      for (const verifier of verifiers) {
        const testData: Eip1271SignatureData = {
          verifier,
          signature: '0x1234',
        }

        const encodedResults: string[] = []
        const decodedResults: Eip1271SignatureData[] = []

        // Encode and decode with each adapter
        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          const encoded = encodeEip1271SignatureData(testData)
          const decoded = decodeEip1271SignatureData(encoded)
          encodedResults.push(encoded)
          decodedResults.push(decoded)
        }

        // All encoded results should be identical
        const [firstEncoded, ...remainingEncoded] = encodedResults
        remainingEncoded.forEach((encoded) => {
          expect(encoded).toEqual(firstEncoded)
        })

        // All decoded verifiers should be consistent (lowercase comparison)
        decodedResults.forEach((decoded) => {
          expect(decoded.verifier.toLowerCase()).toEqual(verifier.toLowerCase())
        })
      }
    })

    test('EIP1271_MAGICVALUE should be consistent with the standard', () => {
      // The EIP-1271 magic value should be 0x1626ba7e
      expect(EIP1271_MAGICVALUE).toEqual('0x1626ba7e')
    })
  })
})
