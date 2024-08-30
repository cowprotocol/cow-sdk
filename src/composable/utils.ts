import { utils, providers, BigNumber } from 'ethers'
import {
  COMPOSABLE_COW_CONTRACT_ADDRESS,
  EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS,
  SupportedChainId,
} from '../common'
import { ExtensibleFallbackHandler__factory } from '../common/generated'
import { BlockInfo, ConditionalOrderParams } from './types'
import { Order, OrderBalance, OrderKind } from '@cowprotocol/contracts'
import { GPv2Order } from '../common/generated/ComposableCoW'

const ERC20_BALANCE_VALUES = ['erc20', '0x5a28e9363bb942b639270062aa6bb295f434bcdfc42c97267bf003f272060dc9']
const EXTERNAL_BALANCE_VALUES = ['external', '0xabee3b73373acd583a130924aad6dc38cfdc44ba0555ba94ce2ff63980ea0632']
const INTERNAL_BALANCE_VALUES = ['internal', '0x4ac99ace14ee0a5ef932dc609df0943ab7ac16b7583634612f8dc35a4289a6ce']
const SELL_KIND_VALUES = ['sell', '0xf3b277728b3fee749481eb3e0b3b48980dbbab78658fc419025cb16eee346775']
const BUY_KIND_VALUES = ['buy', '0x6ed88e868af0a1983e3886d5f3e95a2fafbd6c3450bc229e27342283dc429ccc']

// Define the ABI tuple for the ConditionalOrderParams struct
export const CONDITIONAL_ORDER_PARAMS_ABI = ['tuple(address handler, bytes32 salt, bytes staticInput)']

export const DEFAULT_TOKEN_FORMATTER = (address: string, amount: BigNumber) => `${amount}@${address}`

export function isExtensibleFallbackHandler(handler: string, chainId: SupportedChainId): boolean {
  return handler === EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS[chainId]
}

export function isComposableCow(handler: string, chainId: SupportedChainId): boolean {
  return handler === COMPOSABLE_COW_CONTRACT_ADDRESS[chainId]
}

export async function getDomainVerifier(
  safe: string,
  domain: string,
  chainId: SupportedChainId,
  provider: providers.Provider
): Promise<string> {
  const contract = ExtensibleFallbackHandler__factory.connect(
    EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS[chainId],
    provider
  )
  return await contract.callStatic.domainVerifiers(safe, domain)
}

export function createSetDomainVerifierTx(domain: string, verifier: string): string {
  return ExtensibleFallbackHandler__factory.createInterface().encodeFunctionData('setDomainVerifier', [
    domain,
    verifier,
  ])
}

/**
 * Encode the `ConditionalOrderParams` for the conditional order.
 *
 * @param params The `ConditionalOrderParams` struct representing the conditional order as taken from a merkle tree.
 * @returns The ABI-encoded conditional order.
 * @see ConditionalOrderParams
 */
export function encodeParams(params: ConditionalOrderParams): string {
  return utils.defaultAbiCoder.encode(CONDITIONAL_ORDER_PARAMS_ABI, [params])
}

/**
 * Decode the `ConditionalOrderParams` for the conditional order.
 *
 * @param encoded The encoded conditional order.
 * @returns The decoded conditional order.
 */
export function decodeParams(encoded: string): ConditionalOrderParams {
  const { handler, salt, staticInput } = utils.defaultAbiCoder.decode(CONDITIONAL_ORDER_PARAMS_ABI, encoded)[0]
  return { handler, salt, staticInput }
}

/**
 * Helper method for validating ABI types.
 * @param types ABI types to validate against.
 * @param values The values to validate.
 * @returns {boolean} Whether the values are valid ABI for the given types.
 */
export function isValidAbi(types: readonly (string | utils.ParamType)[], values: any[]): boolean {
  try {
    utils.defaultAbiCoder.encode(types, values)
  } catch (e) {
    return false
  }
  return true
}

export async function getBlockInfo(provider: providers.Provider): Promise<BlockInfo> {
  const block = await provider.getBlock('latest')

  return {
    blockNumber: block.number,
    blockTimestamp: block.timestamp,
  }
}

export function formatEpoch(epoch: number): string {
  return new Date(epoch * 1000).toISOString()
}

/**
 * Convert a balance source/destination hash to a string
 *
 * @param balance balance source/destination hash
 * @returns string representation of the balance
 * @throws if the balance is not recognized
 */
function balanceToString(balance: string) {
  if (ERC20_BALANCE_VALUES.includes(balance)) {
    return OrderBalance.ERC20
  } else if (EXTERNAL_BALANCE_VALUES.includes(balance)) {
    return OrderBalance.EXTERNAL
  } else if (INTERNAL_BALANCE_VALUES.includes(balance)) {
    return OrderBalance.INTERNAL
  } else {
    throw new Error(`Unknown balance type: ${balance}`)
  }
}

/**
 * Convert an order kind hash to a string
 * @param kind of order in hash format
 * @returns string representation of the order kind
 */
function kindToString(kind: string) {
  if (SELL_KIND_VALUES.includes(kind)) {
    return OrderKind.SELL
  } else if (BUY_KIND_VALUES.includes(kind)) {
    return OrderKind.BUY
  } else {
    throw new Error(`Unknown kind: ${kind}`)
  }
}

export function fromStructToOrder(order: GPv2Order.DataStruct): Order {
  const {
    sellToken,
    sellAmount,
    buyToken,
    buyAmount,
    buyTokenBalance,
    sellTokenBalance,
    feeAmount,
    kind,
    receiver,
    validTo,
    partiallyFillable,
    appData,
  } = order

  return {
    sellToken,
    sellAmount,
    buyToken,
    buyAmount,
    feeAmount,
    receiver,
    partiallyFillable,
    appData,
    validTo: Number(validTo),
    kind: kindToString(kind.toString()),
    sellTokenBalance: balanceToString(sellTokenBalance.toString()),
    buyTokenBalance: balanceToString(buyTokenBalance.toString()),
  }
}
