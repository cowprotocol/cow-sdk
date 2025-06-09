import { sepolia } from 'viem/chains'
import { createAdapters, TEST_ADDRESS, TEST_PRIVATE_KEY, TEST_RPC_URL } from './setup'
import { ethers as ethersV5 } from 'ethers-v5'
import * as ethersV6 from 'ethers-v6'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  ContractsTs,
  ContractsOrder as Order,
  ContractsOrderKind as OrderKind,
  ContractsSigningScheme as SigningScheme,
  SettlementEncoder,
  InteractionStage,
  Prices,
  TradeExecution,
} from '../src'
import { privateKeyToAccount } from 'viem/accounts'
import { createWalletClient, http } from 'viem'

describe('SettlementEncoder', () => {
  let adapters: ReturnType<typeof createAdapters>
  let contracts: {
    ethersV5Contracts: ContractsTs
    ethersV6Contracts: ContractsTs
    viemContracts: ContractsTs
  }

  // Test data
  const testDomain = {
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

  const testInteraction = {
    target: '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // Example CoW Swap contract
    callData: '0x12345678',
  }

  const testPrices: Prices = {
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': BigInt('1000000000000000000'), // 1 ETH
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': BigInt('500000000000000'), // 0.0005 ETH (2000 DAI per ETH)
  }

  const tradeExecution: TradeExecution = {
    executedAmount: '1000000000000000000', // 1 WETH
  }

  beforeAll(() => {
    adapters = createAdapters()
    contracts = {
      ethersV5Contracts: new ContractsTs(adapters.ethersV5Adapter),
      ethersV6Contracts: new ContractsTs(adapters.ethersV6Adapter),
      viemContracts: new ContractsTs(adapters.viemAdapter),
    }
  })

  describe('settlement encoding consistency', () => {
    test('should consistently encode settlements across different adapters', async () => {
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

      // Create encoders for each adapter
      const encoders: Record<string, SettlementEncoder> = {}
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        encoders[adapterName] = new SettlementEncoder(testDomain)
      }

      // Add the same interactions to each encoder
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        encoders[adapterName]!.encodeInteraction(testInteraction, InteractionStage.PRE)
      }

      // Add the same trades to each encoder
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        await encoders[adapterName]!.signEncodeTrade(
          testOrder,
          wallets[adapterName],
          SigningScheme.EIP712,
          tradeExecution,
        )
      }

      // Get the encoded settlements
      const settlements: any[] = []
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const settlement = encoders[adapterName]!.encodedSettlement(testPrices)
        settlements.push(settlement)
      }

      // Compare the token addresses
      const [firstSettlement, ...remainingSettlements] = settlements
      remainingSettlements.forEach((settlement) => {
        expect(settlement[0]).toEqual(firstSettlement[0])
      })

      // Compare the clearing prices
      remainingSettlements.forEach((settlement) => {
        expect(settlement[1]).toEqual(firstSettlement[1])
      })

      // Compare the encoded trades
      // Note: We can't directly compare signature data which may differ by adapter,
      // so we compare the trade structure without the signature field
      const compareTrades = (trades1: any[], trades2: any[]) => {
        expect(trades1.length).toEqual(trades2.length)
        for (let i = 0; i < trades1.length; i++) {
          const trade1 = { ...trades1[i] }
          const trade2 = { ...trades2[i] }
          // Don't compare signature directly
          delete trade1.signature
          delete trade2.signature
          expect(trade1).toEqual(trade2)
        }
      }

      remainingSettlements.forEach((settlement) => {
        compareTrades(firstSettlement[2], settlement[2])
      })

      // Compare the interactions
      const compareInteractions = (interactions1: any[], interactions2: any[]) => {
        expect(interactions1.length).toEqual(interactions2.length)
        for (let i = 0; i < interactions1.length; i++) {
          expect(interactions1[i]).toEqual(interactions2[i])
        }
      }

      // Compare all interaction stages
      remainingSettlements.forEach((settlement) => {
        for (let i = 0; i < 3; i++) {
          compareInteractions(firstSettlement[3][i]!, settlement[3][i]!)
        }
      })
    })
  })

  describe('encodedSetup', () => {
    test('should consistently encode setup interactions across different adapters', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Test multiple interactions
      const interactions = [
        {
          target: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
          callData: '0x12345678',
        },
        {
          target: '0x1234567890123456789012345678901234567890',
          callData: '0x87654321',
          value: '1000000000000000',
        },
      ]

      // Encode setup with each adapter
      const setups: any[] = []
      for (const adapterName of adapterNames) {
        setGlobalAdapter(adapters[adapterName])
        const setup = SettlementEncoder.encodedSetup(...interactions)
        setups.push(setup)
      }

      // Compare results - all should be identical
      const [firstSetup, ...remainingSetups] = setups
      remainingSetups.forEach((setup) => {
        expect(JSON.stringify(setup)).toEqual(JSON.stringify(firstSetup))
      })

      // Verify structure - token arrays should be empty
      expect(firstSetup[0]).toEqual([])

      // Prices should be empty
      expect(firstSetup[1]).toEqual([])

      // Trades should be empty
      expect(firstSetup[2]).toEqual([])

      // Compare interactions - they should be in the INTRA stage (index 1)
      expect(firstSetup[3][0]).toEqual([])
      expect(firstSetup[3][2]).toEqual([])

      // The INTRA interactions should match our input
      expect(firstSetup[3][1].length).toEqual(interactions.length)

      // Verify each interaction was encoded correctly
      for (let i = 0; i < interactions.length; i++) {
        expect(firstSetup[3][1][i]!.target).toEqual(interactions[i]!.target)
        expect(firstSetup[3][1][i]!.callData).toEqual(interactions[i]!.callData)
      }
    })
  })

  describe('clearingPrices', () => {
    test('should correctly extract clearing prices', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>
      const testTokens = [
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      ]

      // Create an encoder and manually set tokens (using first adapter)
      setGlobalAdapter(adapters[adapterNames[0]!])
      const encoder = new SettlementEncoder(testDomain)

      // Add orders that use these tokens
      encoder.encodeTrade(
        testOrder,
        {
          scheme: SigningScheme.PRESIGN,
          data: TEST_ADDRESS,
        },
        tradeExecution,
      )

      // Get clearing prices
      const prices = encoder.clearingPrices(testPrices)

      // Verify the prices are in the correct order
      expect(prices.length).toEqual(testTokens.length)
      expect(prices[0]).toEqual(testPrices[testTokens[0]!])
      expect(prices[1]).toEqual(testPrices[testTokens[1]!])
    })

    test('should throw when missing prices', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Create an encoder with incomplete price data
      setGlobalAdapter(adapters[adapterNames[0]!])
      const encoder = new SettlementEncoder(testDomain)

      // Add an order that uses WETH and DAI
      encoder.encodeTrade(
        testOrder,
        {
          scheme: SigningScheme.PRESIGN,
          data: TEST_ADDRESS,
        },
        tradeExecution,
      )

      // Try to get clearing prices with incomplete data
      const incompletePrices = {
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': '1000000000000000000', // Only WETH, missing DAI
      }

      // Should throw an error about missing price
      expect(() => encoder.clearingPrices(incompletePrices)).toThrow(/missing price for token/)
    })
  })

  describe('encodeOrderRefunds', () => {
    test('should correctly encode order refunds', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      // Create realistic order UIDs (using first adapter)
      setGlobalAdapter(adapters[adapterNames[0]!])
      const key = (1).toString(16).padStart(2, '0')
      const orderUids = [
        contracts.ethersV5Contracts.packOrderUidParams({
          orderDigest: `0x${key}${'42'.repeat(31)}`,
          owner: `0x${'01'.repeat(20)}`,
          validTo: 0,
        }),
        contracts.ethersV5Contracts.packOrderUidParams({
          orderDigest: `0x${key}${'40'.repeat(31)}`,
          owner: `0x${'02'.repeat(20)}`,
          validTo: 0,
        }),
      ]

      // Create encoder with verifying contract set in domain
      const encoder = new SettlementEncoder(testDomain)

      // Encode order refunds
      encoder.encodeOrderRefunds({
        filledAmounts: [orderUids[0]],
        preSignatures: [orderUids[1]],
      })

      // Verify the order refunds were encoded
      const interactions = encoder.encodedOrderRefunds

      // Should have 2 interactions (one for filledAmounts, one for preSignatures)
      expect(interactions.length).toBe(2)

      // Each interaction should target the settlement contract
      expect(interactions[0]!.target).toBe(testDomain.verifyingContract)
      expect(interactions[1]!.target).toBe(testDomain.verifyingContract)

      // callData should be non-empty for both
      expect(interactions[0]!.callData).not.toBe('0x')
      expect(interactions[1]!.callData).not.toBe('0x')
    })

    test('should throw with invalid order UIDs', () => {
      const adapterNames = Object.keys(adapters) as Array<keyof typeof adapters>

      setGlobalAdapter(adapters[adapterNames[0]!])
      const encoder = new SettlementEncoder(testDomain)

      // Create invalid order UID (wrong length)
      const invalidOrderUid = '0x1234567890'

      // Should throw error about invalid order UID
      expect(() =>
        encoder.encodeOrderRefunds({
          filledAmounts: [invalidOrderUid],
        }),
      ).toThrow(/invalid order UIDs/)
    })
  })
})
