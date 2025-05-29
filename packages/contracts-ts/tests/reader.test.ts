import { createAdapters, TEST_ADDRESS, TEST_RPC_URL } from './setup'
import { ethers as ethersV5 } from 'ethers-v5'
import * as ethersV6 from 'ethers-v6'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import {
  AllowListReader,
  SettlementReader,
  TradeSimulator,
  TradeSimulation,
  TradeSimulationResult,
  InteractionStage,
  OrderBalance,
} from '../src'

describe('Reader Classes and Storage Functions', () => {
  let adapters: ReturnType<typeof createAdapters>

  // Mock contract addresses and ABIs
  const mockAllowListAddress = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
  const mockSettlementAddress = '0x9008D19f58AAbD9eD0D60971565AA8510560ab42'
  const mockReaderAddress = '0x9008D19f58AAbD9eD0D60971565AA8510560ab43'
  const mockSimulatorAddress = '0x9008D19f58AAbD9eD0D60971565AA8510560ab44'

  // Simple mock ABIs
  const mockAllowListAbi = ['function areSolvers(bytes[] calldata orderUids) external view returns (bool)']
  const mockSettlementAbi = [
    'function filledAmountsForOrders(bytes[] calldata orderUids) external view returns (uint256[])',
  ]
  const mockReaderAbi = [
    'function areSolvers(bytes[] calldata orderUids) external view returns (bool)',
    'function filledAmountsForOrders(bytes[] calldata orderUids) external view returns (uint256[])',
  ]
  const mockSimulatorAbi = ['function simulateTrade(tuple trade, tuple[3] interactions) external view returns (tuple)']

  // Test data
  const testOrderUids = [
    '0x' + '01'.repeat(56), // Valid 56-byte order UID
    '0x' + '02'.repeat(56), // Another valid order UID
  ]

  const testSolvers = ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222']

  const testTradeSimulation: TradeSimulation = {
    sellToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    buyToken: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    receiver: TEST_ADDRESS,
    sellAmount: '1000000000000000000', // 1 WETH
    buyAmount: '2000000000000000000000', // 2000 DAI
    sellTokenBalance: OrderBalance.ERC20,
    buyTokenBalance: OrderBalance.ERC20,
    owner: TEST_ADDRESS,
  }

  beforeAll(() => {
    adapters = createAdapters()
  })

  describe('AllowListReader', () => {
    test('should construct AllowListReader consistently across different adapters', () => {
      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const ethersV5Reader = new AllowListReader(
        mockAllowListAddress,
        mockAllowListAbi,
        mockReaderAddress,
        mockReaderAbi,
        ethersV5Provider,
      )

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
      const ethersV6Reader = new AllowListReader(
        mockAllowListAddress,
        mockAllowListAbi,
        mockReaderAddress,
        mockReaderAbi,
        ethersV6Provider,
      )

      setGlobalAdapter(adapters.viemAdapter)
      const viemProvider = createPublicClient({
        chain: sepolia,
        transport: http(TEST_RPC_URL),
      })
      const viemReader = new AllowListReader(
        mockAllowListAddress,
        mockAllowListAbi,
        mockReaderAddress,
        mockReaderAbi,
        viemProvider,
      )

      // All should have the same properties
      expect(ethersV5Reader.allowListAddress).toBe(mockAllowListAddress)
      expect(ethersV5Reader.readerAddress).toBe(mockReaderAddress)
      expect(ethersV6Reader.allowListAddress).toBe(mockAllowListAddress)
      expect(ethersV6Reader.readerAddress).toBe(mockReaderAddress)
      expect(viemReader.allowListAddress).toBe(mockAllowListAddress)
      expect(viemReader.readerAddress).toBe(mockReaderAddress)

      // ABIs should be identical
      expect(ethersV5Reader.allowListAbi).toEqual(mockAllowListAbi)
      expect(ethersV6Reader.allowListAbi).toEqual(mockAllowListAbi)
      expect(viemReader.allowListAbi).toEqual(mockAllowListAbi)
    })

    test('should handle areSolvers method consistently across adapters', async () => {
      // Mock the readStorage function to return a consistent result
      const mockReadStorage = jest.fn().mockResolvedValue(true)

      // Mock the adapter's utils.readStorage method
      const originalReadStorage = adapters.ethersV5Adapter.utils.readStorage
      adapters.ethersV5Adapter.utils.readStorage = mockReadStorage
      adapters.ethersV6Adapter.utils.readStorage = mockReadStorage
      adapters.viemAdapter.utils.readStorage = mockReadStorage
      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const ethersV5Reader = new AllowListReader(
        mockAllowListAddress,
        mockAllowListAbi,
        mockReaderAddress,
        mockReaderAbi,
        ethersV5Provider,
      )

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
      const ethersV6Reader = new AllowListReader(
        mockAllowListAddress,
        mockAllowListAbi,
        mockReaderAddress,
        mockReaderAbi,
        ethersV6Provider,
      )

      setGlobalAdapter(adapters.viemAdapter)
      const viemProvider = createPublicClient({
        chain: sepolia,
        transport: http(TEST_RPC_URL),
      })
      const viemReader = new AllowListReader(
        mockAllowListAddress,
        mockAllowListAbi,
        mockReaderAddress,
        mockReaderAbi,
        viemProvider,
      )

      // Call areSolvers with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Result = await ethersV5Reader.areSolvers(testSolvers)

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Result = await ethersV6Reader.areSolvers(testSolvers)

      setGlobalAdapter(adapters.viemAdapter)
      const viemResult = await viemReader.areSolvers(testSolvers)

      // Results should be consistent
      expect(ethersV5Result).toBe('true')
      expect(ethersV6Result).toBe('true')
      expect(viemResult).toBe('true')

      // Verify readStorage was called correctly
      expect(mockReadStorage).toHaveBeenCalledTimes(3)
      expect(mockReadStorage).toHaveBeenCalledWith(
        mockAllowListAddress,
        mockAllowListAbi,
        mockReaderAddress,
        mockReaderAbi,
        expect.any(Object), // provider
        'areSolvers',
        [testSolvers],
      )
    })
  })

  describe('SettlementReader', () => {
    test('should construct SettlementReader consistently across different adapters', () => {
      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const ethersV5Reader = new SettlementReader(
        mockSettlementAddress,
        mockSettlementAbi,
        mockReaderAddress,
        mockReaderAbi,
        ethersV5Provider,
      )

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
      const ethersV6Reader = new SettlementReader(
        mockSettlementAddress,
        mockSettlementAbi,
        mockReaderAddress,
        mockReaderAbi,
        ethersV6Provider,
      )

      setGlobalAdapter(adapters.viemAdapter)
      const viemProvider = createPublicClient({
        chain: sepolia,
        transport: http(TEST_RPC_URL),
      })
      const viemReader = new SettlementReader(
        mockSettlementAddress,
        mockSettlementAbi,
        mockReaderAddress,
        mockReaderAbi,
        viemProvider,
      )

      // All should have the same properties
      expect(ethersV5Reader.settlementAddress).toBe(mockSettlementAddress)
      expect(ethersV5Reader.readerAddress).toBe(mockReaderAddress)
      expect(ethersV6Reader.settlementAddress).toBe(mockSettlementAddress)
      expect(ethersV6Reader.readerAddress).toBe(mockReaderAddress)
      expect(viemReader.settlementAddress).toBe(mockSettlementAddress)
      expect(viemReader.readerAddress).toBe(mockReaderAddress)
    })

    test('should handle filledAmountsForOrders method consistently across adapters', async () => {
      const mockFilledAmounts = ['500000000000000000', '750000000000000000'] // 0.5 and 0.75 ETH
      const mockReadStorage = jest.fn().mockResolvedValue(mockFilledAmounts)

      // Mock the adapter's utils.readStorage method
      const originalReadStorage = adapters.ethersV5Adapter.utils.readStorage
      adapters.ethersV5Adapter.utils.readStorage = mockReadStorage
      adapters.ethersV6Adapter.utils.readStorage = mockReadStorage
      adapters.viemAdapter.utils.readStorage = mockReadStorage

      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const ethersV5Reader = new SettlementReader(
        mockSettlementAddress,
        mockSettlementAbi,
        mockReaderAddress,
        mockReaderAbi,
        ethersV5Provider,
      )

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
      const ethersV6Reader = new SettlementReader(
        mockSettlementAddress,
        mockSettlementAbi,
        mockReaderAddress,
        mockReaderAbi,
        ethersV6Provider,
      )

      setGlobalAdapter(adapters.viemAdapter)
      const viemProvider = createPublicClient({
        chain: sepolia,
        transport: http(TEST_RPC_URL),
      })
      const viemReader = new SettlementReader(
        mockSettlementAddress,
        mockSettlementAbi,
        mockReaderAddress,
        mockReaderAbi,
        viemProvider,
      )

      // Call filledAmountsForOrders with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Result = await ethersV5Reader.filledAmountsForOrders(testOrderUids)

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Result = await ethersV6Reader.filledAmountsForOrders(testOrderUids)

      setGlobalAdapter(adapters.viemAdapter)
      const viemResult = await viemReader.filledAmountsForOrders(testOrderUids)

      // Results should be consistent
      expect(ethersV5Result).toEqual(mockFilledAmounts)
      expect(ethersV6Result).toEqual(mockFilledAmounts)
      expect(viemResult).toEqual(mockFilledAmounts)

      // Verify readStorage was called correctly
      expect(mockReadStorage).toHaveBeenCalledTimes(3)
      expect(mockReadStorage).toHaveBeenCalledWith(
        mockSettlementAddress,
        mockSettlementAbi,
        mockReaderAddress,
        mockReaderAbi,
        expect.any(Object), // provider
        'filledAmountsForOrders',
        [testOrderUids],
      )
    })
  })

  describe('TradeSimulator', () => {
    test('should construct TradeSimulator consistently across different adapters', () => {
      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const ethersV5Simulator = new TradeSimulator(
        mockSettlementAddress,
        mockSettlementAbi,
        mockSimulatorAddress,
        mockSimulatorAbi,
        ethersV5Provider,
      )

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
      const ethersV6Simulator = new TradeSimulator(
        mockSettlementAddress,
        mockSettlementAbi,
        mockSimulatorAddress,
        mockSimulatorAbi,
        ethersV6Provider,
      )

      setGlobalAdapter(adapters.viemAdapter)
      const viemProvider = createPublicClient({
        chain: sepolia,
        transport: http(TEST_RPC_URL),
      })
      const viemSimulator = new TradeSimulator(
        mockSettlementAddress,
        mockSettlementAbi,
        mockSimulatorAddress,
        mockSimulatorAbi,
        viemProvider,
      )

      // All should have the same properties
      expect(ethersV5Simulator.settlementAddress).toBe(mockSettlementAddress)
      expect(ethersV5Simulator.simulatorAddress).toBe(mockSimulatorAddress)
      expect(ethersV6Simulator.settlementAddress).toBe(mockSettlementAddress)
      expect(ethersV6Simulator.simulatorAddress).toBe(mockSimulatorAddress)
      expect(viemSimulator.settlementAddress).toBe(mockSettlementAddress)
      expect(viemSimulator.simulatorAddress).toBe(mockSimulatorAddress)
    })

    test('should simulate trade consistently across different adapters', async () => {
      const mockSimulationResult: TradeSimulationResult = {
        gasUsed: '21000',
        executedBuyAmount: '1980000000000000000000', // 1980 DAI (after slippage)
        contractBalance: {
          sellTokenDelta: '1000000000000000000',
          buyTokenDelta: '-1980000000000000000000',
        },
        ownerBalance: {
          sellTokenDelta: '-1000000000000000000',
          buyTokenDelta: '1980000000000000000000',
        },
      }

      const mockReadStorage = jest.fn().mockResolvedValue(mockSimulationResult)

      // Mock the adapter's utils.readStorage method
      const originalReadStorage = adapters.ethersV5Adapter.utils.readStorage
      adapters.ethersV5Adapter.utils.readStorage = mockReadStorage
      adapters.ethersV6Adapter.utils.readStorage = mockReadStorage
      adapters.viemAdapter.utils.readStorage = mockReadStorage

      // Mock adapter ZERO_ADDRESS and utils.id
      const mockZeroAddress = '0x0000000000000000000000000000000000000000'
      adapters.ethersV5Adapter.ZERO_ADDRESS = mockZeroAddress
      adapters.ethersV6Adapter.ZERO_ADDRESS = mockZeroAddress
      adapters.viemAdapter.ZERO_ADDRESS = mockZeroAddress

      const mockId = jest.fn().mockReturnValue('mocked_id_value')
      adapters.ethersV5Adapter.utils.id = mockId
      adapters.ethersV6Adapter.utils.id = mockId
      adapters.viemAdapter.utils.id = mockId

      const testInteractions = {
        [InteractionStage.PRE]: [{ target: '0x1111111111111111111111111111111111111111', callData: '0x1234' }],
        [InteractionStage.INTRA]: [{ target: '0x2222222222222222222222222222222222222222', callData: '0x5678' }],
        [InteractionStage.POST]: [{ target: '0x3333333333333333333333333333333333333333', callData: '0x9abc' }],
      }

      // Test with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const ethersV5Simulator = new TradeSimulator(
        mockSettlementAddress,
        mockSettlementAbi,
        mockSimulatorAddress,
        mockSimulatorAbi,
        ethersV5Provider,
      )

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Provider = new ethersV6.JsonRpcProvider(TEST_RPC_URL)
      const ethersV6Simulator = new TradeSimulator(
        mockSettlementAddress,
        mockSettlementAbi,
        mockSimulatorAddress,
        mockSimulatorAbi,
        ethersV6Provider,
      )

      setGlobalAdapter(adapters.viemAdapter)
      const viemProvider = createPublicClient({
        chain: sepolia,
        transport: http(TEST_RPC_URL),
      })
      const viemSimulator = new TradeSimulator(
        mockSettlementAddress,
        mockSettlementAbi,
        mockSimulatorAddress,
        mockSimulatorAbi,
        viemProvider,
      )

      // Call simulateTrade with each adapter
      setGlobalAdapter(adapters.ethersV5Adapter)
      const ethersV5Result = await ethersV5Simulator.simulateTrade(testTradeSimulation, testInteractions)

      setGlobalAdapter(adapters.ethersV6Adapter)
      const ethersV6Result = await ethersV6Simulator.simulateTrade(testTradeSimulation, testInteractions)

      setGlobalAdapter(adapters.viemAdapter)
      const viemResult = await viemSimulator.simulateTrade(testTradeSimulation, testInteractions)

      // Results should be consistent
      expect(ethersV5Result).toEqual(mockSimulationResult)
      expect(ethersV6Result).toEqual(mockSimulationResult)
      expect(viemResult).toEqual(mockSimulationResult)

      // Verify readStorage was called correctly
      expect(mockReadStorage).toHaveBeenCalledTimes(3)

      // Verify the normalized trade structure
      const expectedNormalizedTrade = {
        ...testTradeSimulation,
        receiver: testTradeSimulation.receiver, // Should use provided receiver
        sellTokenBalance: 'mocked_id_value',
        buyTokenBalance: 'mocked_id_value',
      }

      expect(mockReadStorage).toHaveBeenCalledWith(
        mockSettlementAddress,
        mockSettlementAbi,
        mockSimulatorAddress,
        mockSimulatorAbi,
        expect.any(Object), // provider
        'simulateTrade',
        [expectedNormalizedTrade, expect.any(Array)], // normalized interactions
      )
    })

    test('should handle trade simulation with default values', async () => {
      const mockSimulationResult: TradeSimulationResult = {
        gasUsed: '21000',
        executedBuyAmount: '2000000000000000000000',
        contractBalance: {
          sellTokenDelta: '0',
          buyTokenDelta: '0',
        },
        ownerBalance: {
          sellTokenDelta: '0',
          buyTokenDelta: '0',
        },
      }

      const mockReadStorage = jest.fn().mockResolvedValue(mockSimulationResult)
      adapters.ethersV5Adapter.utils.readStorage = mockReadStorage

      const mockZeroAddress = '0x0000000000000000000000000000000000000000'
      adapters.ethersV5Adapter.ZERO_ADDRESS = mockZeroAddress

      const mockId = jest.fn().mockReturnValue('default_balance_id')
      adapters.ethersV5Adapter.utils.id = mockId

      setGlobalAdapter(adapters.ethersV5Adapter)
      const provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const simulator = new TradeSimulator(
        mockSettlementAddress,
        mockSettlementAbi,
        mockSimulatorAddress,
        mockSimulatorAbi,
        provider,
      )

      // Test with minimal trade simulation (no receiver, no token balances)
      const minimalTrade: TradeSimulation = {
        sellToken: testTradeSimulation.sellToken,
        buyToken: testTradeSimulation.buyToken,
        sellAmount: testTradeSimulation.sellAmount,
        buyAmount: testTradeSimulation.buyAmount,
        owner: testTradeSimulation.owner,
        // receiver, sellTokenBalance, buyTokenBalance are undefined
      } as TradeSimulation

      const result = await simulator.simulateTrade(minimalTrade, {})

      // Should use default values
      expect(result).toEqual(mockSimulationResult)

      // Verify the normalized trade uses defaults
      const expectedNormalizedTrade = {
        ...minimalTrade,
        receiver: mockZeroAddress, // Should use ZERO_ADDRESS as default
        sellTokenBalance: 'default_balance_id', // Should use ERC20 default
        buyTokenBalance: 'default_balance_id', // Should use ERC20 default
      }

      expect(mockReadStorage).toHaveBeenCalledWith(
        mockSettlementAddress,
        mockSettlementAbi,
        mockSimulatorAddress,
        mockSimulatorAbi,
        provider,
        'simulateTrade',
        [expectedNormalizedTrade, [[], [], []]], // empty interactions for all stages
      )
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty order UIDs arrays', async () => {
      const mockReadStorage = jest.fn().mockResolvedValue([])
      adapters.ethersV5Adapter.utils.readStorage = mockReadStorage

      setGlobalAdapter(adapters.ethersV5Adapter)
      const provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const reader = new SettlementReader(
        mockSettlementAddress,
        mockSettlementAbi,
        mockReaderAddress,
        mockReaderAbi,
        provider,
      )

      const result = await reader.filledAmountsForOrders([])
      expect(result).toEqual([])
    })

    test('should handle empty solvers arrays', async () => {
      const mockReadStorage = jest.fn().mockResolvedValue(false)
      adapters.ethersV5Adapter.utils.readStorage = mockReadStorage

      setGlobalAdapter(adapters.ethersV5Adapter)
      const provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const reader = new AllowListReader(
        mockAllowListAddress,
        mockAllowListAbi,
        mockReaderAddress,
        mockReaderAbi,
        provider,
      )

      const result = await reader.areSolvers([])
      expect(result).toBe('false')
    })

    test('should handle interactions with missing stages', async () => {
      const mockSimulationResult: TradeSimulationResult = {
        gasUsed: '21000',
        executedBuyAmount: '2000000000000000000000',
        contractBalance: { sellTokenDelta: '0', buyTokenDelta: '0' },
        ownerBalance: { sellTokenDelta: '0', buyTokenDelta: '0' },
      }

      const mockReadStorage = jest.fn().mockResolvedValue(mockSimulationResult)
      adapters.ethersV5Adapter.utils.readStorage = mockReadStorage
      adapters.ethersV5Adapter.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
      adapters.ethersV5Adapter.utils.id = jest.fn().mockReturnValue('balance_id')

      setGlobalAdapter(adapters.ethersV5Adapter)
      const provider = new ethersV5.providers.JsonRpcProvider(TEST_RPC_URL)
      const simulator = new TradeSimulator(
        mockSettlementAddress,
        mockSettlementAbi,
        mockSimulatorAddress,
        mockSimulatorAbi,
        provider,
      )

      // Test with partial interactions (only PRE stage)
      const partialInteractions = {
        [InteractionStage.PRE]: [{ target: '0x1111111111111111111111111111111111111111', callData: '0x1234' }],
        // INTRA and POST stages are missing
      }

      const result = await simulator.simulateTrade(testTradeSimulation, partialInteractions)
      expect(result).toEqual(mockSimulationResult)
    })
  })
})
