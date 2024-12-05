import type { SupportedChainId } from '../common'
import type { Signer } from '@ethersproject/abstract-signer'
import type { Order, TypedDataDomain, OrderUidParams } from '@cowprotocol/contracts'
import type { SigningResult, UnsignedOrder } from './types'

const getSignUtils = () => import('./utils')
const ethersUtils = () => import('ethers/lib/utils')

/**
 * Utility class for signing order intents and cancellations.
 *
 * @remarks This class only supports `eth_sign` and wallet-native EIP-712 signing. For use of
 *          `presign` and `eip1271` {@link https://docs.cow.fi/ | see the docs}.
 * @example
 *
 * ```typescript
 * import { OrderSigningUtils, SupportedChainId, UnsignedOrder } from '@cowprotocol/cow-sdk'
 * import { Web3Provider } from '@ethersproject/providers'
 *
 * const account = 'YOUR_WALLET_ADDRESS'
 * const chainId = 100 // Gnosis chain
 * const provider = new Web3Provider(window.ethereum)
 * const signer = provider.getSigner()
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
  static async signOrder(order: UnsignedOrder, chainId: SupportedChainId, signer: Signer): Promise<SigningResult> {
    const { signOrder } = await getSignUtils()
    return signOrder(order, chainId, signer)
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
    signer: Signer
  ): Promise<SigningResult> {
    const { signOrderCancellation } = await getSignUtils()
    return signOrderCancellation(orderUid, chainId, signer)
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
    signer: Signer
  ): Promise<SigningResult> {
    const { signOrderCancellations } = await getSignUtils()
    return signOrderCancellations(orderUids, chainId, signer)
  }

  /**
   * Get the EIP-712 typed domain data being used for signing.
   * @param {SupportedChainId} chainId The CoW Protocol `chainId` context that's being used.
   * @return The EIP-712 typed domain data.
   * @see https://eips.ethereum.org/EIPS/eip-712
   */
  static async getDomain(chainId: SupportedChainId): Promise<TypedDataDomain> {
    const { getDomain } = await getSignUtils()
    return getDomain(chainId)
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
    params: Pick<OrderUidParams, 'owner'>
  ): Promise<{ orderId: string; orderDigest: string }> {
    const { generateOrderId } = await getSignUtils()
    return generateOrderId(chainId, order, params)
  }

  /**
   * Get the domain separator hash for the EIP-712 typed domain data being used for signing.
   * @param chainId {SupportedChainId} chainId The CoW Protocol protocol `chainId` context that's being used.
   * @returns A string representation of the EIP-712 typed domain data hash.
   */
  static async getDomainSeparator(chainId: SupportedChainId): Promise<string> {
    const { getDomain } = await getSignUtils()
    const { _TypedDataEncoder } = await ethersUtils()
    return _TypedDataEncoder.hashDomain(getDomain(chainId))
  }

  /**
   * Get the EIP-712 types used for signing a GPv2Order.Data struct. This is useful for when
   * signing orders using smart contracts, whereby this SDK cannot do the EIP-1271 signing for you.
   * @returns The EIP-712 types used for signing.
   */
  static getEIP712Types(): Record<string, unknown> {
    return {
      Order: [
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
  }
}
