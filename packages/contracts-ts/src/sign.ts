import { Bytes, getGlobalAdapter, Signer, TypedDataDomain, TypedDataTypes } from '@cowprotocol/sdk-common'
import { CANCELLATIONS_TYPE_FIELDS, ORDER_TYPE_FIELDS, normalizeOrder } from './order'
import { EcdsaSigningScheme, SigningScheme, Order, EcdsaSignature } from './types'

/**
 * Value returned by a call to `isValidSignature` if the signature was verified
 * successfully. The value is defined in the EIP-1271 standard as:
 * bytes4(keccak256("isValidSignature(bytes32,bytes)"))
 */
export const EIP1271_MAGICVALUE = '0x1626ba7e'

/**
 * Marker value indicating a presignature is set.
 * const PRE_SIGNED = ethersV5.utils.id("GPv2Signing.Scheme.PreSign");
 */
export const PRE_SIGNED = '0xf59c009283ff87aa78203fc4d9c2df025ee851130fb69cc3e068941f6b5e2d6f'

/**
 * EIP-1271 signature data.
 */
export interface Eip1271SignatureData {
  /**
   * The verifying contract address.
   */
  verifier: string
  /**
   * The arbitrary signature data used for verification.
   */
  signature: Bytes
}

/**
 * EIP-1271 signature of an order.
 */
export interface Eip1271Signature {
  /**
   * The signing scheme used in the signature.
   */
  scheme: SigningScheme.EIP1271
  /**
   * The signature data.
   */
  data: Eip1271SignatureData
}

/**
 * Signature data for a pre-signed order.
 */
export interface PreSignSignature {
  /**
   * The signing scheme used in the signature.
   */
  scheme: SigningScheme.PRESIGN
  /**
   * The address of the signer.
   */
  data: string
}

async function ecdsaSignTypedData(
  scheme: EcdsaSigningScheme,
  owner: Signer,
  domain: TypedDataDomain,
  types: TypedDataTypes,
  data: Record<string, unknown>,
): Promise<string> {
  let signature: string | null = null
  const adapter = getGlobalAdapter()
  const signer = new adapter.Signer(owner)

  switch (scheme) {
    case SigningScheme.EIP712:
      signature = await signer.signTypedData(domain, types, data)
      break
    case SigningScheme.ETHSIGN:
      signature = await signer.signMessage(adapter.utils.arrayify(adapter.utils.hashTypedData(domain, types, data)))
      break
    default:
      throw new Error('invalid signing scheme')
  }

  // Passing the signature through split/join to normalize the `v` byte.
  // Some wallets do not pad it with `27`, which causes a signature failure
  // `splitSignature` pads it if needed, and `joinSignature` simply puts it back together
  return adapter.utils.joinSignature(adapter.utils.splitSignature(signature))
}

/**
 * Returns the signature for the specified order with the signing scheme encoded
 * into the signature.
 *
 * @param domain The domain to sign the order for. This is used by the smart
 * contract to ensure orders can't be replayed across different applications,
 * but also different deployments (as the contract chain ID and address are
 * mixed into to the domain value).
 * @param order The order to sign.
 * @param owner The owner for the order used to sign.
 * @param scheme The signing scheme to use. See {@link SigningScheme} for more
 * details.
 * @return Encoded signature including signing scheme for the order.
 */
export async function signOrder(
  domain: TypedDataDomain,
  order: Order,
  owner: Signer,
  scheme: EcdsaSigningScheme,
): Promise<EcdsaSignature> {
  return {
    scheme,
    data: await ecdsaSignTypedData(scheme, owner, domain, { Order: ORDER_TYPE_FIELDS }, normalizeOrder(order)),
  }
}

/**
 * Encodes the necessary data required for the Gnosis Protocol contracts to
 * verify an EIP-1271 signature.
 *
 * @param signature The EIP-1271 signature data to encode.
 */
export function encodeEip1271SignatureData({ verifier, signature }: Eip1271SignatureData): string {
  const adapter = getGlobalAdapter()
  return adapter.utils.solidityPack(['address', 'bytes'], [adapter.utils.getChecksumAddress(verifier), signature])
}

/**
 * Decodes a GPv2 EIP-1271-type signature into the actual EIP-1271 signature
 * and the verifier contract.
 *
 * @param signature The EIP-1271 signature data to decode.
 * @returns decodedSignature The decoded signature object, composed of an
 * EIP-1271 signature and a verifier.
 */
export function decodeEip1271SignatureData(signature: Bytes): Eip1271SignatureData {
  const adapter = getGlobalAdapter()
  //@ts-expect-error: bytes type is unknown
  const arrayifiedSignature = adapter.utils.arrayify(signature)
  const verifier = adapter.utils.getChecksumAddress(adapter.utils.hexlify(arrayifiedSignature.slice(0, 20)))
  return {
    verifier,
    signature: adapter.utils.hexlify(arrayifiedSignature.slice(20)),
  }
}

/**
 * Returns the signature for cancelling a single order with the specified
 * signing scheme.
 *
 * @param domain The domain to sign the cancellation.
 * @param orderUid The unique identifier of the order being cancelled.
 * @param owner The owner for the order used to sign.
 * @param scheme The signing scheme to use. See {@link SigningScheme} for more
 * details.
 * @return Encoded signature including signing scheme for the cancellation.
 */
export async function signOrderCancellation(
  domain: TypedDataDomain,
  orderUid: Bytes,
  owner: Signer,
  scheme: EcdsaSigningScheme,
): Promise<EcdsaSignature> {
  return signOrderCancellations(domain, [orderUid], owner, scheme)
}

/**
 * Returns the signature for cancelling multiple orders by UID with the
 * specified signing scheme.
 *
 * @param domain The domain to sign the cancellation.
 * @param orderUids The unique identifiers of the orders to cancel.
 * @param owner The owner for the order used to sign.
 * @param scheme The signing scheme to use. See {@link SigningScheme} for more
 * details.
 * @return Encoded signature including signing scheme for the cancellation.
 */
export async function signOrderCancellations(
  domain: TypedDataDomain,
  orderUids: Bytes[],
  owner: Signer,
  scheme: EcdsaSigningScheme,
): Promise<EcdsaSignature> {
  return {
    scheme,
    data: await ecdsaSignTypedData(
      scheme,
      owner,
      domain,
      { OrderCancellations: CANCELLATIONS_TYPE_FIELDS },
      { orderUids },
    ),
  }
}
