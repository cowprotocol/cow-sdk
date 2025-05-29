import { BigIntish, Bytes, SignatureLike } from '@cowprotocol/sdk-common'
import { Eip1271Signature, PreSignSignature } from './sign'
import { TradeExecution } from './settlement'
import { HashLike, NormalizedOrder, OrderBalance, Timestamp } from './order'

/**
 * The signing scheme used to sign the order.
 */
export enum SigningScheme {
  /**
   * The EIP-712 typed data signing scheme. This is the preferred scheme as it
   * provides more infomation to wallets performing the signature on the data
   * being signed.
   *
   * <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-domainseparator>
   */
  EIP712 = 0b00,
  /**
   * Message signed using eth_sign RPC call.
   */
  ETHSIGN = 0b01,
  /**
   * Smart contract signatures as defined in EIP-1271.
   *
   * <https://eips.ethereum.org/EIPS/eip-1271>
   */
  EIP1271 = 0b10,
  /**
   * Pre-signed order.
   */
  PRESIGN = 0b11,
}

export type EcdsaSigningScheme = SigningScheme.EIP712 | SigningScheme.ETHSIGN

/**
 * The signature of an order.
 */
export type Signature = EcdsaSignature | Eip1271Signature | PreSignSignature

/**
 * ECDSA signature of an order.
 */
export interface EcdsaSignature {
  /**
   * The signing scheme used in the signature.
   */
  scheme: EcdsaSigningScheme
  /**
   * The ECDSA signature.
   */
  data: SignatureLike
}

/**
 * Trade parameters used in a settlement.
 */
export type Trade = TradeExecution &
  Omit<
    NormalizedOrder,
    'sellToken' | 'buyToken' | 'kind' | 'partiallyFillable' | 'sellTokenBalance' | 'buyTokenBalance'
  > & {
    /**
     * The index of the sell token in the settlement.
     */
    sellTokenIndex: BigIntish
    /**
     * The index of the buy token in the settlement.
     */
    buyTokenIndex: BigIntish
    /**
     * Encoded order flags.
     */
    flags: BigIntish
    /**
     * Signature data.
     */
    signature: Bytes
  }

/**
 * Gnosis Protocol v2 order data.
 */
export interface Order {
  /**
   * Sell token address.
   */
  sellToken: string
  /**
   * Buy token address.
   */
  buyToken: string
  /**
   * An optional address to receive the proceeds of the trade instead of the
   * owner (i.e. the order signer).
   */
  receiver?: string
  /**
   * The order sell amount.
   *
   * For fill or kill sell orders, this amount represents the exact sell amount
   * that will be executed in the trade. For fill or kill buy orders, this
   * amount represents the maximum sell amount that can be executed. For partial
   * fill orders, this represents a component of the limit price fraction.
   */
  sellAmount: BigIntish
  /**
   * The order buy amount.
   *
   * For fill or kill sell orders, this amount represents the minimum buy amount
   * that can be executed in the trade. For fill or kill buy orders, this amount
   * represents the exact buy amount that will be executed. For partial fill
   * orders, this represents a component of the limit price fraction.
   */
  buyAmount: BigIntish
  /**
   * The timestamp this order is valid until
   */
  validTo: Timestamp
  /**
   * Arbitrary application specific data that can be added to an order. This can
   * also be used to ensure uniqueness between two orders with otherwise the
   * exact same parameters.
   */
  appData: HashLike
  /**
   * Fee to give to the protocol.
   */
  feeAmount: BigIntish
  /**
   * The order kind.
   */
  kind: OrderKind
  /**
   * Specifies whether or not the order is partially fillable.
   */
  partiallyFillable: boolean
  /**
   * Specifies how the sell token balance will be withdrawn. It can either be
   * taken using ERC20 token allowances made directly to the Vault relayer
   * (default) or using Balancer Vault internal or external balances.
   */
  sellTokenBalance?: OrderBalance
  /**
   * Specifies how the buy token balance will be paid. It can either be paid
   * directly in ERC20 tokens (default) in Balancer Vault internal balances.
   */
  buyTokenBalance?: OrderBalance
}

/**
 * Gnosis Protocol v2 order cancellation data.
 */
export interface OrderCancellations {
  /**
   * The unique identifier of the order to be cancelled.
   */
  orderUids: Bytes[]
}

/**
 * Order kind.
 */
export enum OrderKind {
  /**
   * A sell order.
   */
  SELL = 'sell',
  /**
   * A buy order.
   */
  BUY = 'buy',
}
