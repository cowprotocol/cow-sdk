// Typechecked against the built `dist`, not `src`: the bundler flattens every module into one
// declaration file per entry, and that flattening is what breaks nested namespaces. A plain `tsc`
// over `src` passes even when the published types do not.
import { OrderBookApi, OrderStatus as EvmOrderStatus } from '../dist/index'
import {
  CompetitionOrderStatus,
  Order,
  OrderStatus,
  SolanaOrderBookApi,
  SolanaOrderCreation,
} from '../dist/solana'

const evmApi: OrderBookApi = new OrderBookApi()
const solanaApi: SolanaOrderBookApi = new SolanaOrderBookApi()

// The enum must survive as a value *and* as a qualified type name.
const status: CompetitionOrderStatus = { type: CompetitionOrderStatus.type.EXPIRED }
const byStatus: Record<CompetitionOrderStatus.type, number> = {
  open: 1,
  scheduled: 2,
  active: 3,
  solved: 4,
  executing: 5,
  traded: 6,
  cancelled: 7,
  expired: 8,
}

// Solana-only fields the EVM order type has no place for.
declare const order: Order
const accounts: [string, number | undefined] = [order.orderPda, order.lastValidBlockHeight]

// Same name, different members, both reachable.
const solanaStatus: OrderStatus = OrderStatus.EXPIRED
const evmStatus: EvmOrderStatus = EvmOrderStatus.PRESIGNATURE_PENDING

const creation: SolanaOrderCreation = { partiallySignedTx: 'base64' }

export const checked = [evmApi, solanaApi, status, byStatus, accounts, solanaStatus, evmStatus, creation]
