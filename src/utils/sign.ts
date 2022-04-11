import {
  domain as domainGp,
  signOrder as signOrderGp,
  signOrderCancellation as signOrderCancellationGp,
  EcdsaSignature,
  Order,
  OrderCancellation as OrderCancellationGp,
  Signature,
  TypedDataV3Signer,
  IntChainIdTypedDataV4Signer,
  SigningScheme,
} from '@gnosis.pm/gp-v2-contracts'
import log from 'loglevel'

import { SupportedChainId as ChainId } from '../constants/chains'
import { GP_SETTLEMENT_CONTRACT_ADDRESS } from '../constants'
import { TypedDataDomain, Signer } from '@ethersproject/abstract-signer'
import { CowError } from './common'

// For error codes, see:
// - https://eth.wiki/json-rpc/json-rpc-error-codes-improvement-proposal
// - https://www.jsonrpc.org/specification#error_object
const METAMASK_SIGNATURE_ERROR_CODE = -32603
const METHOD_NOT_FOUND_ERROR_CODE = -32601
const V4_ERROR_MSG_REGEX = /eth_signTypedData_v4 does not exist/i
const V3_ERROR_MSG_REGEX = /eth_signTypedData_v3 does not exist/i
const RPC_REQUEST_FAILED_REGEX = /RPC request failed/i
const METAMASK_STRING_CHAINID_REGEX = /provided chainid .* must match the active chainid/i

export type UnsignedOrder = Omit<Order, 'receiver'> & { receiver: string }

export interface SignOrderParams {
  chainId: ChainId
  signer: Signer
  order: UnsignedOrder
  signingScheme: SigningScheme
}

// posted to /api/v1/orders on Order creation
// serializable, so no BigNumbers
//  See https://protocol-rinkeby.dev.gnosisdev.com/api/
export interface OrderCreation extends UnsignedOrder {
  signingScheme: SigningScheme // signed method

  // Signature is used for:
  //  - Signature: EIP-712,ETHSIGN
  //  - Owner address: for PRESIGN
  signature: string // 65 bytes encoded as hex without `0x` prefix. r + s + v from the spec
}

export interface SingOrderCancellationParams {
  chainId: ChainId
  signer: Signer
  orderId: string
  signingScheme: SigningScheme
}

export interface OrderCancellation extends OrderCancellationGp {
  signature: string
  signingScheme: SigningScheme
}

export type SigningSchemeValue = 'eip712' | 'ethsign' | 'eip1271' | 'presign'

interface SchemaInfo {
  libraryValue: number
  apiValue: SigningSchemeValue
}
const mapSigningSchema: Map<SigningScheme, SchemaInfo> = new Map([
  [SigningScheme.EIP712, { libraryValue: 0, apiValue: 'eip712' }],
  [SigningScheme.ETHSIGN, { libraryValue: 1, apiValue: 'ethsign' }],
  [SigningScheme.EIP1271, { libraryValue: 2, apiValue: 'eip1271' }],
  [SigningScheme.PRESIGN, { libraryValue: 3, apiValue: 'presign' }],
])

function _getSigningSchemeInfo(ecdaSigningScheme: SigningScheme): SchemaInfo {
  const value = mapSigningSchema.get(ecdaSigningScheme)
  if (value === undefined) {
    throw new CowError('Unknown schema ' + ecdaSigningScheme)
  }

  return value
}

interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

function isProviderRpcError(error: unknown): error is ProviderRpcError {
  return (error as ProviderRpcError).code !== undefined || (error as ProviderRpcError).message !== undefined
}

export function getSigningSchemeApiValue(ecdaSigningScheme: SigningScheme): string {
  return _getSigningSchemeInfo(ecdaSigningScheme).apiValue
}

export function getSigningSchemeLibValue(ecdaSigningScheme: SigningScheme): number {
  return _getSigningSchemeInfo(ecdaSigningScheme).libraryValue
}

function _getDomain(chainId: ChainId): TypedDataDomain {
  // Get settlement contract address
  const settlementContract = GP_SETTLEMENT_CONTRACT_ADDRESS[chainId]

  if (!settlementContract) {
    throw new CowError('Unsupported network. Settlement contract is not deployed')
  }

  return domainGp(chainId, settlementContract)
}

async function _signOrder(params: SignOrderParams): Promise<Signature> {
  const { chainId, signer, order, signingScheme } = params

  const domain = _getDomain(chainId)

  return signOrderGp(domain, order, signer, getSigningSchemeLibValue(signingScheme))
}

async function _signOrderCancellation(params: SingOrderCancellationParams): Promise<Signature> {
  const { chainId, signer, signingScheme, orderId } = params

  const domain = _getDomain(chainId)

  return signOrderCancellationGp(domain, orderId, signer, getSigningSchemeLibValue(signingScheme))
}

export type SigningResult = { signature: string; signingScheme: SigningScheme }

async function _signPayload(
  payload: any,
  signFn: typeof _signOrder | typeof _signOrderCancellation,
  signer: Signer,
  signingMethod: 'v4' | 'int_v4' | 'v3' | 'eth_sign' = 'v4'
): Promise<SigningResult> {
  const signingScheme = signingMethod === 'eth_sign' ? SigningScheme.ETHSIGN : SigningScheme.EIP712
  let signature: Signature | null = null

  let _signer
  try {
    switch (signingMethod) {
      case 'v3':
        _signer = new TypedDataV3Signer(signer)
        break
      case 'int_v4':
        _signer = new IntChainIdTypedDataV4Signer(signer)
        break
      default:
        _signer = signer
    }
  } catch (e) {
    log.error('Wallet not supported:', e)
    throw new CowError('Wallet not supported')
  }

  try {
    signature = (await signFn({ ...payload, signer: _signer, signingScheme })) as EcdsaSignature // Only ECDSA signing supported for now
  } catch (e) {
    if (!isProviderRpcError(e)) {
      // Some other error signing. Let it bubble up.
      log.error(e)
      throw e
    }

    if (e.code === METHOD_NOT_FOUND_ERROR_CODE || RPC_REQUEST_FAILED_REGEX.test(e.message)) {
      // Maybe the wallet returns the proper error code? We can only hope 🤞
      // OR it failed with a generic message, there's no error code set, and we also hope it'll work
      // with other methods...
      switch (signingMethod) {
        case 'v4':
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
    }
  }
  return { signature: signature!.data.toString(), signingScheme }
}
/**
 * Returns the signature for the specified order with the signing scheme encoded
 * into the signature.
 * @export
 * @param {UnsignedOrder} order The order to sign.
 * @param {ChainId} chainId The chain Id
 * @param {Signer} signer The owner for the order used to sign.
 * @return {*} Encoded signature including signing scheme for the order.
 */
export async function signOrder(order: UnsignedOrder, chainId: ChainId, signer: Signer): Promise<SigningResult> {
  return _signPayload({ order, chainId }, _signOrder, signer)
}

/**
 * Returns the signature for the Order Cancellation with the signing scheme encoded
 * into the signature.
 *
 * @export
 * @param {string} orderId The unique identifier of the order being cancelled.
 * @param {ChainId} chainId The chain Id
 * @param {Signer} signer The owner for the order used to sign.
 * @return {*} Encoded signature including signing scheme for the order.
 */
export async function signOrderCancellation(orderId: string, chainId: ChainId, signer: Signer): Promise<SigningResult> {
  return _signPayload({ orderId, chainId }, _signOrderCancellation, signer)
}
