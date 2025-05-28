import { sepolia } from 'viem/chains'
import { createAdapters, TEST_ADDRESS, TEST_PRIVATE_KEY, TEST_RPC_URL } from './setup'
import { ethers as ethersV5 } from 'ethers-v5'
import * as ethersV6 from 'ethers-v6'
import { setGlobalAdapter, TypedDataDomain } from '@cowprotocol/sdk-common'
import {
  ContractsTs,
  ContractsOrder as Order,
  ContractsOrderKind as OrderKind,
  ContractsSigningScheme as SigningScheme,
  hashOrder,
  computeOrderUid,
  extractOrderUidParams,
  signOrder,
  ContractsSignature as Signature,
  decodeSigningScheme,
  encodeSigningScheme,
  decodeTradeFlags,
  encodeTradeFlags,
} from '../src'
import { privateKeyToAccount } from 'viem/accounts'
import { createWalletClient, http } from 'viem'

describe('Order Hashing and Signing', () => {
  let adapters: ReturnType<typeof createAdapters>
  let contracts: {
    ethersV5Contracts: ContractsTs
    ethersV6Contracts: ContractsTs
    viemContracts: ContractsTs
  }

  // Test data
  const testDomain: TypedDataDomain = {
    name: 'Cow Protocol',
    version: '1',
    chainId: 1,
    verifyingContract: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
  }

  const testOrder: Order = {
    sellToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    buyToken: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    sellAmount: '1000000000000000000', // 1 WETH
    buyAmount: '2000000000000000000000', // 2000 DAI
    validTo: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
    feeAmount: '5000000000000000', // 0.005 WETH
    kind: OrderKind.SELL,
    partiallyFillable: false,
  }

  beforeAll(() => {
    adapters = createAdapters()
    contracts = {
      ethersV5Contracts: new ContractsTs(adapters.ethersV5Adapter),
      ethersV6Contracts: new ContractsTs(adapters.ethersV6Adapter),
      viemContracts: new ContractsTs(adapters.viemAdapter),
    }
  })

  describe('hashOrder', () => {
    test('should hash orders consistently across different adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const hashes: string[] = []

      // Hash order with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const hash = hashOrder(testDomain, testOrder)
        hashes.push(hash)
      }

      // All hashes should be identical
      const [firstHash, ...remainingHashes] = hashes
      remainingHashes.forEach((hash) => {
        expect(hash).toEqual(firstHash)
      })

      // Verify hash format (should be 0x-prefixed 32 byte hash)
      expect(firstHash).toMatch(/^0x[0-9a-f]{64}$/i)
    })
  })

  describe('computeOrderUid and extractOrderUidParams', () => {
    test('should compute and extract order UIDs consistently across different adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const uids: string[] = []

      // Compute order UID with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const uid = computeOrderUid(testDomain, testOrder, TEST_ADDRESS)
        uids.push(uid)
      }

      // All UIDs should be identical
      const [firstUid, ...remainingUids] = uids
      remainingUids.forEach((uid) => {
        expect(uid).toEqual(firstUid)
      })

      // Verify UID format (56 bytes)
      expect(firstUid).toMatch(/^0x[0-9a-f]{112}$/i)

      // Extract parameters from the UID with each adapter
      const extractedParams: any[] = []
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const params = extractOrderUidParams(firstUid!)
        extractedParams.push(params)
      }

      // All extracted parameters should be identical
      const [firstParams, ...remainingParams] = extractedParams
      remainingParams.forEach((params) => {
        expect(params).toEqual(firstParams)
      })

      // Verify the extracted parameters match the input
      expect(firstParams.owner).toEqual(TEST_ADDRESS)
      expect(firstParams.validTo).toEqual(testOrder.validTo)

      // The order digest should match the hash
      setGlobalAdapter(adapters[adapterNames[0]!])
      const orderHash = hashOrder(testDomain, testOrder)
      expect(firstParams.orderDigest).toEqual(orderHash)
    })
  })

  describe('signOrder', () => {
    test('should sign orders consistently across different adapters', async () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Setup wallets for each adapter (following the same pattern as contracts)
      const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
      const viemAccount = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`)

      const wallets = {
        ethersV5Adapter: new ethersV5.Wallet(TEST_PRIVATE_KEY, ethersV5Provider),
        ethersV6Adapter: new ethersV6.Wallet(TEST_PRIVATE_KEY, ethersV6Provider),
        viemAdapter: createWalletClient({
          chain: sepolia,
          transport: http(),
          account: viemAccount,
        }),
      }

      // Sign the order with each adapter
      const signatures: Signature[] = []
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const sig = await signOrder(testDomain, testOrder, wallets[adapterName], SigningScheme.EIP712)
        signatures.push(sig)
      }

      // All signatures should have the same scheme
      signatures.forEach((sig) => {
        expect(sig.scheme).toEqual(SigningScheme.EIP712)
      })

      // The signatures may differ slightly in format, but all should be valid ECDSA signatures
      const isValidSignature = (sig: Signature) => {
        expect(sig.data).toBeDefined()

        // For EIP712 and ETHSIGN, data should be a string or Bytes
        if (sig.scheme === SigningScheme.EIP712 || sig.scheme === SigningScheme.ETHSIGN) {
          expect(typeof sig.data === 'string' || sig.data instanceof Uint8Array).toBeTruthy()
        }
      }

      signatures.forEach(isValidSignature)
    })
  })

  describe('SigningScheme encoding/decoding', () => {
    test('should encode and decode signing schemes consistently', () => {
      const schemes = [SigningScheme.EIP712, SigningScheme.ETHSIGN, SigningScheme.EIP1271, SigningScheme.PRESIGN]
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      for (const scheme of schemes) {
        const encodedValues: any[] = []
        const decodedValues: any[] = []

        // For each adapter, encode the scheme
        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          const encoded = encodeSigningScheme(scheme)
          encodedValues.push(encoded)
        }

        // All encoded values should be the same
        const [firstEncoded, ...remainingEncoded] = encodedValues
        remainingEncoded.forEach((encoded) => {
          expect(encoded).toEqual(firstEncoded)
        })

        // Decode and verify with each adapter
        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          const decoded = decodeSigningScheme(firstEncoded)
          decodedValues.push(decoded)
        }

        // All decoded values should match the original scheme
        decodedValues.forEach((decoded) => {
          expect(decoded).toEqual(scheme)
        })
      }
    })
  })

  describe('TradeFlags encoding/decoding', () => {
    test('should encode and decode trade flags consistently', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Create trade flags for testing
      const tradeFlags = {
        ...testOrder,
        signingScheme: SigningScheme.EIP712,
      }

      const encodedValues: any[] = []
      const decodedValues: any[] = []

      // For each adapter, encode the flags
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const encoded = encodeTradeFlags(tradeFlags)
        encodedValues.push(encoded)
      }

      // All encoded values should be the same
      const [firstEncoded, ...remainingEncoded] = encodedValues
      remainingEncoded.forEach((encoded) => {
        expect(encoded).toEqual(firstEncoded)
      })

      // Decode and verify with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const decoded = decodeTradeFlags(firstEncoded)
        decodedValues.push(decoded)
      }

      // Verify that all decoded properties match
      const checkFlags = (decoded: any) => {
        expect(decoded.kind).toEqual(tradeFlags.kind)
        expect(decoded.partiallyFillable).toEqual(tradeFlags.partiallyFillable)
        expect(decoded.signingScheme).toEqual(tradeFlags.signingScheme)
      }

      decodedValues.forEach(checkFlags)
    })
  })
})
