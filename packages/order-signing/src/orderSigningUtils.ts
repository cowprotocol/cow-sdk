import { type AddressPerChain, CowEnv, ProtocolOptions, SupportedChainId } from '@cowprotocol/sdk-config'
import { ORDER_TYPE_FIELDS, type ContractsOrder as Order, type OrderUidParams } from '@cowprotocol/sdk-contracts-ts'
import type { SigningResult, UnsignedOrder } from './types'
import { AbstractSigner, getGlobalAdapter, Signer, TypedDataDomain } from '@cowprotocol/sdk-common'
import { generateOrderId, getDomain, signOrder, signOrderCancellation, signOrderCancellations } from './utils'
import { BuyTokenDestination, SellTokenSource, SigningScheme } from '@cowprotocol/sdk-order-book'

const ECDSA_HEX_LENGTH = 65 * 2

export const ORDER_PRIMARY_TYPE = 'Order' as const

/**
 * The EIP-712 types used for signing a GPv2Order.Data struct. This is useful for when
 * signing orders using smart contracts, whereby this SDK cannot do the EIP-1271 signing for you.
 */
export const COW_EIP712_TYPES = {
  [ORDER_PRIMARY_TYPE]: [
    { name: 'sellToken', type: 'address' },
    { name: 'buyToken', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'sellAmount', type: 'uint256' },
    { name: 'buyAmount', type: 'uint256' },
    { name: 'validTo', type: 'uint32' },
    { name: 'appData', type: 'bytes32' },
    { name: 'feeAmount', type: 'uint256' },
    { name: 'kind', type: 'string' },
    { name: 'partiallyFillable', type: 'bool' },
    { name: 'sellTokenBalance', type: 'string' },
    { name: 'buyTokenBalance', type: 'string' },
  ],
}

/**
 * Utility class for signing order intents and cancellations.
 *
 * @remarks This class only supports `eth_sign` and wallet-native EIP-712 signing. For use of
 *          `presign` and `eip1271` {@link https://docs.cow.fi/ | see the docs}.
 * @example
 *
 * ```typescript
 * import { OrderSigningUtils, SupportedChainId, UnsignedOrder } from '@cowprotocol/cow-sdk'
 * import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
 * import { JsonRpcProvider, Wallet } from 'ethers'
 *
 * const provider = new JsonRpcProvider('YOUR_RPC_URL')
 * const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
 * const adapter = new EthersV6Adapter({ provider, signer: wallet })
 * const signer = adapter.signer
 *
 * // The adapter should be configured via CowSdk or setGlobalAdapter
 * setGlobalAdapter(adapter)
 *
 * async function main() {
 *     const orderToSign: UnsignedOrder = { ... }
 *     const orderSigningResult = await OrderSigningUtils.signOrder(orderToSign, chainId, signer)
 *
 *     const orderId = await orderBookApi.sendOrder({ ...orderToSign, ...orderSigningResult })
 *
 *     const order = await orderBookApi.getOrder(orderId)
 *
 *     const trades = await orderBookApi.getTrades({ orderId })
 *
 *     const orderCancellationSigningResult = await OrderSigningUtils.signOrderCancellations([orderId], chainId, signer)
 *
 *     const cancellationResult = await orderBookApi.sendSignedOrderCancellations({...orderCancellationSigningResult, orderUids: [orderId] })
 *
 *     console.log('Results: ', { orderId, order, trades, orderCancellationSigningResult, cancellationResult })
 * }
 * ```
 */
export class OrderSigningUtils {
  /**
   * Sign the order intent with the specified signer.
   *
   * @remarks If the API reports an error with the signature, it is likely to be due to an incorrectly
   *          specified `chainId`. Please ensure that the `chainId` is correct for the network you are
   *          using.
   * @param {UnsignedOrder} order The unsigned order intent to be placed.
   * @param {SupportedChainId} chainId The CoW Protocol `chainId` context that's being used.
   * @param {Signer} signer The signer who is placing the order intent.
   * @returns {Promise<SigningResult>} Encoded signature including signing scheme for the order.
   */
  static async signOrder(
    order: UnsignedOrder,
    chainId: SupportedChainId,
    signer: Signer,
    options?: ProtocolOptions,
  ): Promise<SigningResult> {
    return signOrder(order, chainId, signer, options)
  }

  /**
   * Sign a cancellation message of an order intent with the specified signer.
   * @param {string} orderUid The unique identifier of the order to cancel.
   * @param {SupportedChainId} chainId The CoW Protocol `chainid` context that's being used.
   * @param {Signer} signer The signer who initially placed the order intent.
   * @returns {Promise<SigningResult>} Encoded signature including signing scheme for the cancellation.
   */
  static async signOrderCancellation(
    orderUid: string,
    chainId: SupportedChainId,
    signer: Signer,
    options?: ProtocolOptions,
  ): Promise<SigningResult> {
    return signOrderCancellation(orderUid, chainId, signer, options)
  }

  /**
   * Sign a cancellation message of multiple order intents with the specified signer.
   * @param {string[]} orderUids An array of `orderUid` to cancel.
   * @param {SupportedChainId} chainId The CoW Protocol `chainId` context that's being used.
   * @param {Signer} signer The signer who initially placed the order intents.
   * @returns {Promise<SigningResult>} Encoded signature including signing scheme for the cancellation.
   */
  static async signOrderCancellations(
    orderUids: string[],
    chainId: SupportedChainId,
    signer: Signer,
    options?: ProtocolOptions,
  ): Promise<SigningResult> {
    return signOrderCancellations(orderUids, chainId, signer, options)
  }

  /**
   * Get the EIP-712 typed domain data being used for signing.
   * @param {SupportedChainId} chainId The CoW Protocol `chainId` context that's being used.
   * @return The EIP-712 typed domain data.
   * @see https://eips.ethereum.org/EIPS/eip-712
   */
  static async getDomain(chainId: SupportedChainId, options?: ProtocolOptions): Promise<TypedDataDomain> {
    return getDomain(chainId, options)
  }

  /**
   * Hashes the order intent and generate deterministic order ID.
   * @param {SupportedChainId} chainId The CoW Protocol `chainId` context that's being used.
   * @param {Order} order order to sign
   * @param {Pick<OrderUidParams, 'owner'>} params order unique identifier parameters.
   */
  static async generateOrderId(
    chainId: SupportedChainId,
    order: Order,
    params: Pick<OrderUidParams, 'owner'>,
    options?: ProtocolOptions,
  ): Promise<{ orderId: string; orderDigest: string }> {
    return generateOrderId(chainId, order, params, options)
  }

  /**
   * Get the domain separator hash for the EIP-712 typed domain data being used for signing.
   * @param chainId {SupportedChainId} chainId The CoW Protocol protocol `chainId` context that's being used.
   * @returns A string representation of the EIP-712 typed domain data hash.
   */
  static async getDomainSeparator(chainId: SupportedChainId, options?: ProtocolOptions): Promise<string> {
    const adapter = getGlobalAdapter()
    const types = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ]

    return adapter.utils.hashDomain(getDomain(chainId, options), types)
  }

  static getEIP712Types(): typeof COW_EIP712_TYPES {
    return COW_EIP712_TYPES
  }

  /**
   * Encodes an order and ECDSA signature for EIP-1271 smart contract signature verification.
   *
   * @remarks This method encodes the order data and ECDSA signature into a format suitable for
   *          EIP-1271 signature verification by smart contracts. The order struct is ABI-encoded
   *          as a tuple along with the ECDSA signature bytes. String fields in the order are
   *          hashed using keccak256 before encoding.
   *
   * @param {UnsignedOrder} orderToSign The unsigned order to encode for EIP-1271 verification.
   * @param {string} ecdsaSignature The ECDSA signature (typically 65 bytes hex-encoded) to include in the encoding.
   * @returns {string} The ABI-encoded order struct and signature, ready for EIP-1271 verification.
   *
   * @see https://eips.ethereum.org/EIPS/eip-1271
   *
   * @example
   * ```typescript
   * const orderToSign: UnsignedOrder = { ... }
   * const ecdsaSignature = '0x...' // 65 bytes signature from signing the order
   *
   * const eip1271Signature = OrderSigningUtils.getEip1271Signature(orderToSign, ecdsaSignature)
   * // Use eip1271Signature with a smart contract wallet that implements EIP-1271
   * ```
   */
  static getEip1271Signature(orderToSign: UnsignedOrder, ecdsaSignature: string): string {
    const adapter = getGlobalAdapter()
    const EIP712Types = COW_EIP712_TYPES[ORDER_PRIMARY_TYPE]

    const components = EIP712Types.map((component) => ({
      name: component.name,
      type: component.type === 'string' ? 'bytes32' : component.type,
    }))

    const values = Object.values(OrderSigningUtils.encodeUnsignedOrder(orderToSign))

    return adapter.utils.encodeAbi(
      [
        {
          components,
          type: 'tuple',
        },
        { type: 'bytes' },
      ],
      [values, ecdsaSignature],
    ) as string
  }

  static async getEip7702Signature(
    chainId: SupportedChainId,
    env: CowEnv,
    orderToSign: UnsignedOrder,
    signingScheme: SigningScheme,
    signer: AbstractSigner<unknown>,
    settlementContractOverride?: Partial<AddressPerChain>,
  ): Promise<{ signature: string; signingScheme: SigningScheme }> {
    const isEip1271 = signingScheme === SigningScheme.EIP1271

    const domain = await OrderSigningUtils.getDomain(chainId, {
      env,
      settlementContractOverride,
    })
    const rawSig = await signer.signTypedData(
      domain as unknown as Record<string, unknown>,
      { Order: ORDER_TYPE_FIELDS },
      orderToSign as unknown as Record<string, unknown>,
    )
    const hexLen = (rawSig ?? '').replace(/^0x/, '').length
    if (hexLen === ECDSA_HEX_LENGTH) {
      // Plain ECDSA from a 7702 delegate (e.g. Metamask Smart Account).
      // Respect the caller's explicit scheme: if they asked for EIP1271,
      // wrap via the standard `(order, sig)` ABI tuple. Otherwise eip712.
      if (isEip1271) {
        return {
          signature: OrderSigningUtils.getEip1271Signature(orderToSign, rawSig),
          signingScheme,
        }
      }
      return { signature: rawSig, signingScheme: SigningScheme.EIP712 }
    }
    // Wrapped bytes (ERC-7739 / ERC-7579 MA v2 / stacked) — forward to
    // CoW as eip1271 with `from = EOA`. CoW calls `isValidSignature`
    // on the owner; the EIP-7702 marker dispatches to the delegate
    // which handles unwrapping. No `(order, sig)` ABI tuple wrap.
    return { signature: rawSig, signingScheme: SigningScheme.EIP1271 }
  }

  static encodeUnsignedOrder(orderToSign: UnsignedOrder): Record<string, string> {
    const order: UnsignedOrder = {
      ...orderToSign,
      sellTokenBalance: orderToSign.sellTokenBalance ?? SellTokenSource.ERC20,
      buyTokenBalance: orderToSign.buyTokenBalance ?? BuyTokenDestination.ERC20,
    }

    const adapter = getGlobalAdapter()
    const EIP712Types = COW_EIP712_TYPES[ORDER_PRIMARY_TYPE]

    return EIP712Types.reduce<Record<string, string>>((acc, { name, type }) => {
      const value = (order as Record<string, unknown>)[name] as string

      acc[name] = type === 'string' ? String(adapter.utils.id(value)) : value

      return acc
    }, {})
  }
}
