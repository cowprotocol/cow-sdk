import { InteractionLike, normalizeInteractions } from './interaction'
import { OrderBalance } from './order'
import { InteractionStage } from './settlement'
import { Abi, Address, BigIntish, Bytes, getGlobalAdapter, Provider } from '@cowprotocol/sdk-common'
import { Order } from './types'

/**
 * A generic method used to obfuscate the complexity of reading storage
 * of any StorageAccessible contract. That is, this method does the work of
 * 1. Encoding the function call on the reader
 * 2. Simulates delegatecall of storage read with encoded calldata
 * 3. Decodes the returned bytes from the storage read into expected return value.
 */
async function readStorage(
  baseAddress: Address,
  baseAbi: Abi,
  readerAddress: Address,
  readerAbi: Abi,
  provider: Provider,
  method: string,
  parameters: unknown[],
) {
  return getGlobalAdapter().utils.readStorage(
    baseAddress,
    baseAbi,
    readerAddress,
    readerAbi,
    provider,
    method,
    parameters,
  )
}

/**
 * A class for attaching the storage reader contract to a solver allow list for
 * providing additional storage reading methods.
 */
export class AllowListReader {
  constructor(
    public readonly allowListAddress: Address,
    public readonly allowListAbi: Abi,
    public readonly readerAddress: Address,
    public readonly readerAbi: Abi,
    public readonly provider: Provider,
  ) {}

  /**
   * Returns true if all the specified addresses are allowed solvers.
   */
  public async areSolvers(solvers: Bytes[]): Promise<string> {
    return String(
      await readStorage(
        this.allowListAddress,
        this.allowListAbi,
        this.readerAddress,
        this.readerAbi,
        this.provider,
        'areSolvers',
        [solvers],
      ),
    )
  }
}

/**
 * A class for attaching the storage reader contract to the GPv2Settlement contract
 * for providing additional storage reading methods.
 */
export class SettlementReader {
  constructor(
    public readonly settlementAddress: Address,
    public readonly settlementAbi: Abi,
    public readonly readerAddress: Address,
    public readonly readerAbi: Abi,
    public readonly provider: Provider,
  ) {}

  /**
   * Read and return filled amounts for a list of orders
   */
  public async filledAmountsForOrders(orderUids: Bytes[]): Promise<BigIntish[]> {
    return await readStorage(
      this.settlementAddress,
      this.settlementAbi,
      this.readerAddress,
      this.readerAbi,
      this.provider,
      'filledAmountsForOrders',
      [orderUids],
    )
  }
}

/**
 * A simulated trade.
 */
export type TradeSimulation = Pick<
  Order,
  'sellToken' | 'buyToken' | 'receiver' | 'sellAmount' | 'buyAmount' | 'sellTokenBalance' | 'buyTokenBalance'
> & {
  /**
   * The address of the owner of the trade. For an actual settlement, this would
   * usually this would be determinied by recovering an order signature.
   */
  owner: string
}

/**
 * Account balance changes in a trade simulation
 */
export interface TradeSimulationBalanceDelta {
  sellTokenDelta: BigIntish
  buyTokenDelta: BigIntish
}

/**
 * The result of a trade simulation.
 */
export interface TradeSimulationResult {
  gasUsed: BigIntish
  executedBuyAmount: BigIntish
  contractBalance: TradeSimulationBalanceDelta
  ownerBalance: TradeSimulationBalanceDelta
}

/**
 * Trade simulation storage reader contract allowing the simulation of trades.
 */
export class TradeSimulator {
  constructor(
    public readonly settlementAddress: Address,
    public readonly settlementAbi: Abi,
    public readonly simulatorAddress: Address,
    public readonly simulatorAbi: Abi,
    public readonly provider: Provider,
  ) {}

  /**
   * Simulates the single order settlement for an executed trade and a set of
   * interactions.
   */
  public async simulateTrade(
    trade: TradeSimulation,
    interactions: Partial<Record<InteractionStage, InteractionLike[]>>,
  ): Promise<TradeSimulationResult> {
    const adapter = getGlobalAdapter()
    const normalizedTrade = {
      ...trade,
      receiver: trade.receiver ?? adapter.ZERO_ADDRESS,
      sellTokenBalance: adapter.utils.id(trade.sellTokenBalance ?? OrderBalance.ERC20),
      buyTokenBalance: adapter.utils.id(trade.buyTokenBalance ?? OrderBalance.ERC20),
    }
    const normalizedInteractions = [
      normalizeInteractions(interactions[InteractionStage.PRE] ?? []),
      normalizeInteractions(interactions[InteractionStage.INTRA] ?? []),
      normalizeInteractions(interactions[InteractionStage.POST] ?? []),
    ]

    return await readStorage(
      this.settlementAddress,
      this.settlementAbi,
      this.simulatorAddress,
      this.simulatorAbi,
      this.provider,
      'simulateTrade',
      [normalizedTrade, normalizedInteractions],
    )
  }
}
