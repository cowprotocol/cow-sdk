import { BlockInfo, ConditionalOrderParams, GPv2Order, IsValid, IsValidResult } from './types'
import { ContractsOrder as Order, OrderBalance, ContractsOrderKind as OrderKind } from '@cowprotocol/sdk-contracts-ts'
import {
  COMPOSABLE_COW_CONTRACT_ADDRESS,
  EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS,
  SupportedChainId,
} from '@cowprotocol/sdk-config'
import { getGlobalAdapter, Provider } from '@cowprotocol/sdk-common'
import { ExtensibleFallbackHandlerFactoryAbi } from './abis/ExtensibleFallbackHandlerFactoryAbi'

const ERC20_BALANCE_VALUES = ['erc20', '0x5a28e9363bb942b639270062aa6bb295f434bcdfc42c97267bf003f272060dc9']
const EXTERNAL_BALANCE_VALUES = ['external', '0xabee3b73373acd583a130924aad6dc38cfdc44ba0555ba94ce2ff63980ea0632']
const INTERNAL_BALANCE_VALUES = ['internal', '0x4ac99ace14ee0a5ef932dc609df0943ab7ac16b7583634612f8dc35a4289a6ce']
const SELL_KIND_VALUES = ['sell', '0xf3b277728b3fee749481eb3e0b3b48980dbbab78658fc419025cb16eee346775']
const BUY_KIND_VALUES = ['buy', '0x6ed88e868af0a1983e3886d5f3e95a2fafbd6c3450bc229e27342283dc429ccc']

// Define the ABI tuple for the ConditionalOrderParams struct
export const CONDITIONAL_ORDER_PARAMS_ABI = [
  {
    type: 'tuple',
    components: [
      { name: 'handler', type: 'address' },
      { name: 'salt', type: 'bytes32' },
      { name: 'staticInput', type: 'bytes' },
    ],
  },
]

export const DEFAULT_TOKEN_FORMATTER = (address: string, amount: bigint) => `${amount}@${address}`

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
  provider: Provider,
): Promise<string> {
  return (await getGlobalAdapter().readContract({
    address: EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS[chainId],
    abi: ExtensibleFallbackHandlerFactoryAbi,
    functionName: 'domainVerifiers',
    args: [safe, domain],
  }),
  provider) as string
}

export function createSetDomainVerifierTx(domain: string, verifier: string): string {
  return getGlobalAdapter().utils.encodeFunction(ExtensibleFallbackHandlerFactoryAbi, 'setDomainVerifier', [
    domain,
    verifier,
  ]) as string
}

/**
 * Encode the `ConditionalOrderParams` for the conditional order.
 *
 * @param params The `ConditionalOrderParams` struct representing the conditional order as taken from a merkle tree.
 * @returns The ABI-encoded conditional order.
 * @see ConditionalOrderParams
 */
export function encodeParams(params: ConditionalOrderParams): string {
  const x = getGlobalAdapter().utils.encodeAbi(CONDITIONAL_ORDER_PARAMS_ABI, [params]) as string
  return x
}

/**
 * Decode the `ConditionalOrderParams` for the conditional order.
 *
 * @param encoded The encoded conditional order.
 * @returns The decoded conditional order.
 */
export function decodeParams(encoded: string): ConditionalOrderParams {
  const { handler, salt, staticInput } = getGlobalAdapter().utils.decodeAbi(
    CONDITIONAL_ORDER_PARAMS_ABI,
    encoded,
  )[0] as ConditionalOrderParams
  return { handler, salt, staticInput }
}

/**
 * Helper method for validating ABI types.
 * @param types ABI types to validate against.
 * @param values The values to validate.
 * @returns {boolean} Whether the values are valid ABI for the given types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidAbi(types: readonly (string | unknown)[], values: any[]): boolean {
  try {
    getGlobalAdapter().utils.encodeAbi(types as string[], values)
  } catch {
    return false
  }
  return true
}

export async function getBlockInfo(provider: Provider): Promise<BlockInfo> {
  const block = await getGlobalAdapter().getBlock('latest', provider)

  return {
    blockNumber: Number(block.number),
    blockTimestamp: Number(block.timestamp),
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
    kind: kindToString(String(kind)),
    sellTokenBalance: balanceToString(String(sellTokenBalance)),
    buyTokenBalance: balanceToString(String(buyTokenBalance)),
  }
}

export function getIsValidResult(result: IsValidResult): result is IsValid {
  return result.isValid
}
