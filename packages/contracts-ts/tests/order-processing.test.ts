import { createAdapters, TEST_ADDRESS } from './setup'
import { setGlobalAdapter, TypedDataDomain } from '@cowprotocol/sdk-common'
import {
  ContractsTs,
  ContractsOrder as Order,
  ContractsOrderKind as OrderKind,
  OrderBalance,
  normalizeOrder,
  timestamp,
  hashify,
  normalizeBuyTokenBalance,
  packOrderUidParams,
  extractOrderUidParams,
  decodeOrder,
  TokenRegistry,
  ContractsTrade as Trade,
} from '../src'
import { getAddress } from 'viem'

describe('Order Processing Functions', () => {
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
    sellToken: getAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'), // WETH
    buyToken: getAddress('0x6b175474e89094c44da98b954eedeac495271d0f'), // DAI
    sellAmount: '1000000000000000000', // 1 WETH
    buyAmount: '2000000000000000000000', // 2000 DAI
    validTo: (Math.floor(Date.now() / 1000) + 3600) as number, // 1 hour from now
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

  describe('normalizeOrder', () => {
    test('should normalize orders consistently across different adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const normalizedOrders: any[] = []

      // Normalize with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const normalized = normalizeOrder(testOrder)
        normalizedOrders.push(normalized)
      }

      // All normalized orders should be identical
      const [firstNormalized, ...remainingNormalized] = normalizedOrders
      remainingNormalized.forEach((normalized) => {
        expect(normalized).toEqual(firstNormalized)
      })

      // Check specific properties
      expect(firstNormalized.receiver).toEqual('0x0000000000000000000000000000000000000000')
      expect(firstNormalized.sellTokenBalance).toEqual(OrderBalance.ERC20)
      expect(firstNormalized.buyTokenBalance).toEqual(OrderBalance.ERC20)
      expect(firstNormalized.validTo).toEqual(testOrder.validTo)

      // When we provide a receiver, it should be preserved
      const orderWithReceiver = { ...testOrder, receiver: TEST_ADDRESS }

      setGlobalAdapter(adapters[adapterNames[0]!!])
      const normalizedWithReceiver = normalizeOrder(orderWithReceiver)
      expect(normalizedWithReceiver.receiver).toEqual(TEST_ADDRESS)

      // Test error case - receiver cannot be zero address
      setGlobalAdapter(adapters[adapterNames[0]!!])
      const orderWithZeroReceiver = { ...testOrder, receiver: '0x0000000000000000000000000000000000000000' }
      expect(() => normalizeOrder(orderWithZeroReceiver)).toThrow(/receiver cannot be address\(0\)/)
    })

    test('should handle different balance types correctly', () => {
      const orderVariations = [
        { ...testOrder }, // Default
        { ...testOrder, sellTokenBalance: OrderBalance.ERC20 },
        { ...testOrder, sellTokenBalance: OrderBalance.EXTERNAL },
        { ...testOrder, sellTokenBalance: OrderBalance.INTERNAL },
        { ...testOrder, buyTokenBalance: OrderBalance.ERC20 },
        { ...testOrder, buyTokenBalance: OrderBalance.INTERNAL },
        { ...testOrder, buyTokenBalance: OrderBalance.EXTERNAL }, // Should be normalized to ERC20
      ]

      for (const order of orderVariations) {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
        setGlobalAdapter(adapters[adapterNames[0]!!])
        const normalized = normalizeOrder(order)

        // Sell token balance should match what was provided or default to ERC20
        expect(normalized.sellTokenBalance).toEqual(order.sellTokenBalance || OrderBalance.ERC20)

        // Buy token balance handling is special - EXTERNAL gets converted to ERC20
        if (order.buyTokenBalance === OrderBalance.EXTERNAL) {
          expect(normalized.buyTokenBalance).toEqual(OrderBalance.ERC20)
        } else {
          expect(normalized.buyTokenBalance).toEqual(order.buyTokenBalance || OrderBalance.ERC20)
        }
      }
    })
  })

  describe('timestamp', () => {
    test('should convert various timestamp formats consistently', () => {
      const testCases = [
        { input: 1609459200, expected: 1609459200 }, // Unix timestamp (seconds)
        { input: new Date('2021-01-01T00:00:00Z'), expected: 1609459200 }, // Date object
      ]

      for (const { input, expected } of testCases) {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
        const results: number[] = []

        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          const result = timestamp(input)
          results.push(result)
        }

        // All results should be identical and match expected
        results.forEach((result) => {
          expect(result).toEqual(expected)
        })
      }
    })
  })

  describe('hashify', () => {
    test('should convert app data to 32-byte hash consistently', () => {
      const testCases = [
        { input: 123, expected: '0x000000000000000000000000000000000000000000000000000000000000007b' }, // Number
        { input: '0xabcd', expected: '0x000000000000000000000000000000000000000000000000000000000000abcd' }, // Short hex
        {
          input: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
          expected: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
        }, // Full 32-byte hash
      ]

      for (const { input, expected } of testCases) {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
        const results: string[] = []

        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          const result = hashify(input)
          results.push(result)
        }

        // All results should be identical and match expected
        results.forEach((result) => {
          expect(result).toEqual(expected)
        })
      }
    })
  })

  describe('normalizeBuyTokenBalance', () => {
    test('should normalize buy token balance types correctly', () => {
      const testCases = [
        { input: undefined, expected: OrderBalance.ERC20 },
        { input: OrderBalance.ERC20, expected: OrderBalance.ERC20 },
        { input: OrderBalance.EXTERNAL, expected: OrderBalance.ERC20 }, // EXTERNAL normalized to ERC20 for buy
        { input: OrderBalance.INTERNAL, expected: OrderBalance.INTERNAL },
      ]

      for (const { input, expected } of testCases) {
        const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
        const results: OrderBalance[] = []

        for (const adapterName of adapterNames) {
          setGlobalAdapter(adapters[adapterName])
          const result = normalizeBuyTokenBalance(input)
          results.push(result)
        }

        // All results should be identical and match expected
        results.forEach((result) => {
          expect(result).toEqual(expected)
        })
      }
    })

    test('should throw on invalid balance type', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      setGlobalAdapter(adapters[adapterNames[0]!])
      expect(() => normalizeBuyTokenBalance('invalid' as any)).toThrow(/invalid order balance/)
    })
  })

  describe('OrderUid packing and extraction', () => {
    test('should pack and extract order UIDs consistently', () => {
      const params = {
        orderDigest: '0x1234567890123456789012345678901234567890123456789012345678901234',
        owner: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
        validTo: 1609459200, // Unix timestamp
      }

      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const packedUIDs: string[] = []

      // Pack with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const packed = packOrderUidParams(params)
        packedUIDs.push(packed)
      }

      // All packed UIDs should be identical
      const [firstPacked, ...remainingPacked] = packedUIDs
      remainingPacked.forEach((packed) => {
        expect(packed).toEqual(firstPacked)
      })

      // Extract with each adapter
      const extractedParams: any[] = []
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const extracted = extractOrderUidParams(firstPacked!)
        extractedParams.push(extracted)
      }

      // All extracted params should be identical and match input
      extractedParams.forEach((extracted) => {
        expect(extracted).toEqual(params)
      })

      // Test error case - invalid UID length
      setGlobalAdapter(adapters[adapterNames[0]!])
      expect(() => extractOrderUidParams('0x1234')).toThrow(/invalid order UID length/)
    })
  })

  describe('decodeOrder', () => {
    test('should decode trade data back into an order consistently', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // First create a token registry and encode a trade
      setGlobalAdapter(adapters[adapterNames[0]!])
      const tokenRegistry = new TokenRegistry()

      // Add tokens to the registry
      const sellTokenIndex = tokenRegistry.index(testOrder.sellToken)
      const buyTokenIndex = tokenRegistry.index(testOrder.buyToken)

      // Create mock trade data
      const trade = {
        sellTokenIndex,
        buyTokenIndex,
        receiver: testOrder.receiver || '0x0000000000000000000000000000000000000000',
        sellAmount: testOrder.sellAmount,
        buyAmount: testOrder.buyAmount,
        validTo: testOrder.validTo.valueOf(),
        appData: testOrder.appData,
        feeAmount: testOrder.feeAmount,
        flags: 0, // Encode as a sell order, not partially fillable, ERC20 balances
        executedAmount: '0',
        signature: '0x',
      } as Trade

      // Decode with each adapter
      const decodedOrders: any[] = []
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const decoded = decodeOrder(trade, tokenRegistry.addresses)
        decodedOrders.push(decoded)
      }

      // All decoded orders should be identical
      const [firstDecoded, ...remainingDecoded] = decodedOrders
      remainingDecoded.forEach((decoded) => {
        expect(decoded).toEqual(firstDecoded)
      })

      // Decoded order should match original order
      // (ignoring receiver which is added by the contract if not provided)
      expect(firstDecoded.sellToken).toEqual(testOrder.sellToken)
      expect(firstDecoded.buyToken).toEqual(testOrder.buyToken)
      expect(firstDecoded.sellAmount).toEqual(testOrder.sellAmount)
      expect(firstDecoded.buyAmount).toEqual(testOrder.buyAmount)
      expect(firstDecoded.validTo).toEqual(testOrder.validTo)
      expect(firstDecoded.appData).toEqual(testOrder.appData)
      expect(firstDecoded.feeAmount).toEqual(testOrder.feeAmount)
      expect(firstDecoded.kind).toEqual(testOrder.kind)
      expect(firstDecoded.partiallyFillable).toEqual(testOrder.partiallyFillable)

      // Test error case - invalid token indices
      const invalidTrade = {
        ...trade,
        sellTokenIndex: 99, // Index that doesn't exist
      }

      setGlobalAdapter(adapters[adapterNames[0]!])
      expect(() => decodeOrder(invalidTrade, tokenRegistry.addresses)).toThrow(/Invalid trade/)
    })
  })

  describe('TokenRegistry', () => {
    test('should track tokens consistently across different adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const registries: TokenRegistry[] = []

      // Create registries with each adapter
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const registry = new TokenRegistry()
        registries.push(registry)
      }

      // Add some tokens
      const tokens = [
        getAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'), // WETH
        getAddress('0x6b175474e89094c44da98b954eedeac495271d0f'), // DAI
        getAddress('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'), // USDC
      ]

      // Add tokens and get indices for all registries
      const allIndices: number[][] = []
      for (const registry of registries) {
        const indices = tokens.map((token) => registry.index(token))
        allIndices.push(indices)
      }

      // All indices should be sequential starting from 0
      allIndices.forEach((indices) => {
        expect(indices).toEqual([0, 1, 2])
      })

      // Adding same token again should return the same index
      registries.forEach((registry) => {
        expect(registry.index(tokens[0]!)).toEqual(0)
      })

      // Token addresses should be stored in all registries
      registries.forEach((registry) => {
        expect(registry.addresses).toEqual(tokens)
      })

      // Test that case normalization works
      const mixedCaseToken = '0xC02aaA39b223FE8D0A0e5C4F27ead9083C756Cc2' // WETH with mixed case
      registries.forEach((registry) => {
        expect(registry.index(mixedCaseToken)).toEqual(0) // Should map to same index as lowercase
      })
    })
  })
})
