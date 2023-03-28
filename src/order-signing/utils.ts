import type {
  Order as OrderFromContract,
  Signature,
  TypedDataDomain,
  EcdsaSigningScheme as EcdsaSigningSchemeContract,
} from '@cowprotocol/contracts'
import {
  domain as domainGp,
  EcdsaSignature,
  IntChainIdTypedDataV4Signer,
  SigningScheme,
  signOrder as signOrderGp,
  signOrderCancellation as signOrderCancellationGp,
  TypedDataVersionedSigner,
} from '@cowprotocol/contracts'
import type { Signer } from 'ethers'
import type { SigningResult, SignOrderParams, SingOrderCancellationParams, UnsignedOrder } from './types'

import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from '../common/consts'
import { CowError, SupportedChainId } from '../common'
import { EcdsaSigningScheme } from '../order-book'

// For error codes, see:
// - https://eth.wiki/json-rpc/json-rpc-error-codes-improvement-proposal
// - https://www.jsonrpc.org/specification#error_object
const METAMASK_SIGNATURE_ERROR_CODE = -32603
const METHOD_NOT_FOUND_ERROR_CODE = -32601
// Added the following because of 1Inch walet who doesn't send the error code
// So we will check the actual error text
const METHOD_NOT_FOUND_ERROR_MSG_REGEX = /Method not found/i
const V4_ERROR_MSG_REGEX = /eth_signTypedData_v4 does not exist/i
const V3_ERROR_MSG_REGEX = /eth_signTypedData_v3 does not exist/i
const RPC_REQUEST_FAILED_REGEX = /RPC request failed/i
const METAMASK_STRING_CHAINID_REGEX = /provided chainid .* must match the active chainid/i

const mapSigningSchema: Record<EcdsaSigningScheme, EcdsaSigningSchemeContract> = {
  [EcdsaSigningScheme.EIP712]: SigningScheme.EIP712,
  [EcdsaSigningScheme.ETHSIGN]: SigningScheme.ETHSIGN,
}

interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

function isProviderRpcError(error: unknown): error is ProviderRpcError {
  return (error as ProviderRpcError).code !== undefined || (error as ProviderRpcError).message !== undefined
}

async function _signOrder(params: SignOrderParams): Promise<Signature> {
  const { chainId, signer, order, signingScheme } = params

  const domain = getDomain(chainId)

  return signOrderGp(domain, order as OrderFromContract, signer, mapSigningSchema[signingScheme])
}

async function _signOrderCancellation(params: SingOrderCancellationParams): Promise<Signature> {
  const { chainId, signer, signingScheme, orderId } = params

  const domain = getDomain(chainId)

  return signOrderCancellationGp(domain, orderId, signer, mapSigningSchema[signingScheme])
}

async function _signPayload(
  payload: Pick<SignOrderParams, 'order' & 'chainId'> | Pick<SingOrderCancellationParams, 'chainId' & 'orderId'>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signFn: (params: any) => Promise<Signature>,
  signer: Signer,
  signingMethod: 'default' | 'v4' | 'int_v4' | 'v3' | 'eth_sign' = 'v4'
): Promise<SigningResult> {
  const signingScheme: EcdsaSigningScheme =
    signingMethod === 'eth_sign' ? EcdsaSigningScheme.ETHSIGN : EcdsaSigningScheme.EIP712
  let signature: Signature | null = null

  let _signer
  try {
    switch (signingMethod) {
      case 'default':
      case 'v3':
        _signer = new TypedDataVersionedSigner(signer)
        break
      case 'int_v4':
        _signer = new IntChainIdTypedDataV4Signer(signer)
        break
      default:
        _signer = signer
    }
  } catch (e) {
    console.error('Wallet not supported:', e)
    throw new CowError('Wallet not supported')
  }

  try {
    signature = (await signFn({ ...payload, signer: _signer, signingScheme })) as EcdsaSignature // Only ECDSA signing supported for now
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (!isProviderRpcError(e)) {
      // Some other error signing. Let it bubble up.
      console.error(e)
      throw e
    }

    const regexErrorCheck = [METHOD_NOT_FOUND_ERROR_MSG_REGEX, RPC_REQUEST_FAILED_REGEX].some((regex) =>
      // for example 1Inch error doesn't have e.message so we will check the output of toString()
      [e.message, e.toString()].some((msg) => regex.test(msg))
    )

    if (e.code === METHOD_NOT_FOUND_ERROR_CODE || regexErrorCheck) {
      // Maybe the wallet returns the proper error code? We can only hope 🤞
      // OR it failed with a generic message, there's no error code set, and we also hope it'll work
      // with other methods...
      switch (signingMethod) {
        case 'v4':
          return _signPayload(payload, signFn, signer, 'default')
        case 'default':
          return _signPayload(payload, signFn, signer, 'v3')
        case 'v3':
          return _signPayload(payload, signFn, signer, 'eth_sign')
        default:
          throw e
      }
    } else if (METAMASK_STRING_CHAINID_REGEX.test(e.message)) {
      // Metamask now enforces chainId to be an integer
      return _signPayload(payload, signFn, signer, 'int_v4')
    } else if (e.code === METAMASK_SIGNATURE_ERROR_CODE) {
      // We tried to sign order the nice way.
      // That works fine for regular MM addresses. Does not work for Hardware wallets, though.
      // See https://github.com/MetaMask/metamask-extension/issues/10240#issuecomment-810552020
      // So, when that specific error occurs, we know this is a problem with MM + HW.
      // Then, we fallback to ETHSIGN.
      return _signPayload(payload, signFn, signer, 'eth_sign')
    } else if (V4_ERROR_MSG_REGEX.test(e.message)) {
      // Failed with `v4`, and the wallet does not set the proper error code
      return _signPayload(payload, signFn, signer, 'v3')
    } else if (V3_ERROR_MSG_REGEX.test(e.message)) {
      // Failed with `v3`, and the wallet does not set the proper error code
      return _signPayload(payload, signFn, signer, 'eth_sign')
    } else {
      // Some other error signing. Let it bubble up.
      console.error(e)
      throw e
    }
  }

  const data: unknown = signature?.data

  return { signature: data?.toString() || '', signingScheme }
}

/**
 * Returns the signature for the specified order with the signing scheme encoded
 * into the signature.
 * @export
 * @param {UnsignedOrder} order The order to sign.
 * @param {SupportedChainId} chainId The chain Id
 * @param {Signer} signer The owner for the order used to sign.
 * @return {*} Encoded signature including signing scheme for the order.
 */
export async function signOrder(
  order: UnsignedOrder,
  chainId: SupportedChainId,
  signer: Signer
): Promise<SigningResult> {
  return _signPayload({ order, chainId }, _signOrder, signer)
}

/**
 * Returns the signature for the Order Cancellation with the signing scheme encoded
 * into the signature.
 *
 * @export
 * @param {string} orderId The unique identifier of the order being cancelled.
 * @param {SupportedChainId} chainId The chain Id
 * @param {Signer} signer The owner for the order used to sign.
 * @return {*} Encoded signature including signing scheme for the order.
 */
export async function signOrderCancellation(
  orderId: string,
  chainId: SupportedChainId,
  signer: Signer
): Promise<SigningResult> {
  return _signPayload({ orderId, chainId }, _signOrderCancellation, signer)
}

export function getDomain(chainId: SupportedChainId): TypedDataDomain {
  // Get settlement contract address
  const settlementContract = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId]

  if (!settlementContract) {
    throw new CowError('Unsupported network. Settlement contract is not deployed')
  }

  return domainGp(chainId, settlementContract)
}
