import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { EvmCall, SupportedChainId, TargetChainId } from '@cowprotocol/sdk-config'
import { getGlobalAdapter, ZERO_ADDRESS, ERC20_BALANCE_OF_ABI, ERC20_TRANSFER_ABI } from '@cowprotocol/sdk-common'
import { ACROSS_SPOKE_POOL_PERIPHERY_CONTRACT_ADDRESSES, ACROSS_SPOKE_POOL_CONTRACT_ADDRESSES } from './const/contracts'
import { ACROSS_SPOKE_POOL_PERIPHERY_ABI } from './abi'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import { QuoteBridgeRequest } from '../../types'
import { mapNativeOrWrappedTokenAddress } from './util'

/**
 * Minimal ABI to read `SpokePoolPeriphery.swapProxy()`, which runs Across swap
 * logic (unused in our case). CoWShed `ERC20.transfer`s intermediate tokens
 * into SwapProxy before calling `swapAndBridge`.
 *
 * @see https://etherscan.io/address/0x10D8b8DaA26d307489803e10477De69C0492B610#code
 */
const ACROSS_SPOKE_POOL_PERIPHERY_SWAP_PROXY_GETTER_ABI = [
  {
    inputs: [],
    name: 'swapProxy',
    outputs: [{ internalType: 'contract SwapProxy', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const TRANSFER_TYPE_APPROVAL = 0

/**
 * Reads the SwapProxy address from the deployed SpokePoolPeriphery on this chain.
 *
 * We read this from chain (via the global adapter) so the periphery remains the single
 * source of truth for its SwapProxy wiring. This avoids maintaining a second static
 * `ACROSS_SWAP_PROXY_ADDRESSES` registry that must be kept in sync with periphery deployments.
 */
export async function fetchAcrossSwapProxyAddress(chainId: SupportedChainId): Promise<string> {
  const peripheryAddress = getSpokePoolPeripheryAddress(chainId)
  const adapter = getGlobalAdapter()
  const raw = await adapter.readContract({
    address: peripheryAddress,
    abi: ACROSS_SPOKE_POOL_PERIPHERY_SWAP_PROXY_GETTER_ABI,
    functionName: 'swapProxy',
    args: [],
  })

  const swapProxy = typeof raw === 'string' ? raw : String(raw)

  if (!swapProxy || swapProxy === ZERO_ADDRESS) {
    throw new Error(`Across swapProxy() returned empty address for chain ${chainId}`)
  }

  return swapProxy
}

/**
 * Converts an Ethereum address (20 bytes) to bytes32 by left-padding with zeros.
 * Matches Solidity: bytes32(uint256(uint160(address)))
 */
export function addressToBytes32(address: string): string {
  return '0x' + address.slice(2).toLowerCase().padStart(64, '0')
}

function getSpokePoolAddress(chainId: TargetChainId): string {
  const address = ACROSS_SPOKE_POOL_CONTRACT_ADDRESSES[chainId]
  if (!address) {
    throw new Error(`Spoke pool address not found for chain ${chainId}`)
  }
  return address
}

function getSpokePoolPeripheryAddress(chainId: TargetChainId): string {
  const address = ACROSS_SPOKE_POOL_PERIPHERY_CONTRACT_ADDRESSES[chainId]
  if (!address) {
    throw new Error(`Spoke pool periphery address not found for chain ${chainId}`)
  }
  return address
}

/**
 * Builds the two EVM calls needed to bridge tokens via Across using `SpokePoolPeriphery`.
 *
 * This provider uses Across' `swapAndBridge` entrypoint, with a no-op swap:
 *
 * 1) Prefund Across `SwapProxy`: We transfer the intermediate token from the user's CoW Shed to
 *    Across' SwapProxy: `ERC20.transfer(swapProxy, prefundFromShedAmount)`.
 *
 *    Note: The old flow assumed the amount to bridge is known up front and equals the quoted amount,
 *    so we set `swapTokenAmount = request.amount` and approved the periphery to pull only that much.
 *    But that was and still is not true because the swap executes later during settlement and can produce surplus.
 *
 * 2. Call `SpokePoolPeriphery.swapAndBridge` with a pass-through "swap"
 *    (no actual token swap), using Across-recommended parameters for surplus:
 *
 *    - `swapTokenAmount = 0`, so periphery pulls 0 from the cow-shed via.
 *    - a no-op `exchange` call.
 *    - `minExpectedInputTokenAmount = request.amount` must be the same amount used in Across quote (the `/suggested-fees` `amount`).
 *    - `enableProportionalAdjustment = true` ensures the output amount scales if the actual input differs.
 *
 * This works because Across' periphery calls `swapProxy.performSwap(...)` and uses the returned output amount
 * (`returnAmount`) as the bridge input. `SwapProxy` computes that by checking its own
 * `balanceOf(outputToken)` after the no-op swap call, and then transfers the full balance back.
 *
 * Because we previously prefunded `SwapProxy`, `returnAmount` reflects what we transferred in, even though
 * the periphery pulled 0 tokens from cow-shed.
 *
 * Note that `prefundFromShedAmount` must be >= `minExpectedInputTokenAmount`, otherwise the periphery reverts.
 *
 * Also, if `enableProportionalAdjustment` is true and `prefundFromShedAmount` is higher than the minimum, Across
 * proportionally scales the destination output amount up (by `returnAmount / minExpectedInputTokenAmount`).
 *
* `prefundFromShedAmount` defaults to `request.amount` (the quoted minimum) because hook calldata is typically fixed
 * when the user signs. If you want to prefund the full post-settlement balance (including surplus), you need a way
 * to determine that balance at execution time (e.g. a small helper contract that transfers `balanceOf(address(this))`).
 *
 * @returns An array of EvmCalls: `[transferToSwapProxy, swapAndBridge]` (swap is no-op)
 */
export function createAcrossDepositCall(params: {
  request: QuoteBridgeRequest
  quote: AcrossQuoteResult
  cowShedSdk: CowShedSdk
  swapProxyAddress: string

  /**
   * How much of `sellToken` the Shed sends to SwapProxy before `swapAndBridge`.
   * Defaults to `request.amount`. Must be `>= request.amount` so `returnAmount` still clears
   * `minExpectedInputTokenAmount` (Across reverts otherwise with `MinimumExpectedInputAmount`).
   */
  prefundFromShedAmount?: bigint
}): [EvmCall, EvmCall] {
  const { request, quote, cowShedSdk, swapProxyAddress } = params

  // Amount user committed for quoting / min bound — same number must hit `getSuggestedFees` and `minExpectedInputTokenAmount`.
  const quotedIntermediateAmount = request.amount

  // Optional override when upstream knows the real post-settlement balance (surplus capture).
  const prefundFromShedAmount = params.prefundFromShedAmount ?? quotedIntermediateAmount

  if (prefundFromShedAmount < quotedIntermediateAmount) {
    throw new Error(
      'prefundFromShedAmount must be >= request.amount (Across min input) to avoid MinimumExpectedInputAmount revert',
    )
  }

  const { sellTokenChainId, sellTokenAddress, buyTokenChainId, buyTokenAddress, account, receiver } = request

  // Across always uses wrapped native if the native token is selected:
  const sellTokenLike = { address: sellTokenAddress, chainId: sellTokenChainId }
  const sellToken = mapNativeOrWrappedTokenAddress(sellTokenLike)
  const buyToken = mapNativeOrWrappedTokenAddress({ address: buyTokenAddress, chainId: buyTokenChainId })

  const adapter = getGlobalAdapter()

  const spokePoolPeripheryAddress = getSpokePoolPeripheryAddress(sellTokenChainId)
  const spokePoolAddress = getSpokePoolAddress(sellTokenChainId)
  const cowShedAccount = cowShedSdk.getCowShedAccount(sellTokenChainId, account)

  const { suggestedFees } = quote

  // Min. output on the destination chain (after bridge slippage):
  const outputAmount = quote.amountsAndCosts.afterSlippage.buyAmount

  // The "swap" is a pass-through: the SwapProxy receives tokens and returns them unchanged.
  // We use TransferType.Approval so tokens stay in the SwapProxy, and the routerCalldata
  // is a harmless read-only call (balanceOf) on the token contract used as the "exchange".

  const noOpSwapCalldata = adapter.utils.encodeFunction(ERC20_BALANCE_OF_ABI, 'balanceOf', [ZERO_ADDRESS]) as string

  const swapAndDepositData = {
    submissionFees: {
      amount: 0n,
      recipient: ZERO_ADDRESS,
    },
    depositData: {
      inputToken: sellToken,
      outputToken: addressToBytes32(buyToken),
      outputAmount,
      depositor: cowShedAccount,
      recipient: addressToBytes32(receiver || account),
      destinationChainId: BigInt(buyTokenChainId),
      exclusiveRelayer: addressToBytes32(suggestedFees.exclusiveRelayer),
      quoteTimestamp: Number(suggestedFees.timestamp),
      fillDeadline: Number(suggestedFees.fillDeadline),
      exclusivityParameter: Number(suggestedFees.exclusivityDeadline),
      message: getGlobalAdapter().utils.encodeAbi(['string'], [quote.suggestedFees.id]),
    },
    swapToken: sellToken,
    exchange: sellToken,
    transferType: TRANSFER_TYPE_APPROVAL,
    routerCalldata: noOpSwapCalldata,
    enableProportionalAdjustment: true,
    spokePool: spokePoolAddress,
    nonce: 0n,

    // `swapTokenAmount: 0` means that the `SpokePoolPeriphery` won't try to pull anything from CowShed,
    // as we prefunded `SwapProxy`. Other than telling it how much to transfer around, this value doesn't matter.
    swapTokenAmount: 0n,

    // This should be the min. swap output (i.e. max slippage), which should
    // also be the value we pass to the across API:
    minExpectedInputTokenAmount: quotedIntermediateAmount,
  }

  // Call 1: Prefund SwapProxy from the cow-shed,
  // instead of approving `SpokePoolPeriphery` to pull tokens from cow-shed:
  const transferCallData = adapter.utils.encodeFunction(ERC20_TRANSFER_ABI, 'transfer', [
    swapProxyAddress,
    prefundFromShedAmount,
  ]) as string

  const transferCall: EvmCall = {
    to: sellToken,
    data: transferCallData,
    value: 0n,
  }

  // Call 2: Execute swapAndBridge on the SpokePoolPeriphery:
  const swapAndBridgeCallData = adapter.utils.encodeFunction(ACROSS_SPOKE_POOL_PERIPHERY_ABI, 'swapAndBridge', [
    swapAndDepositData,
  ]) as string

  const swapAndBridgeCall: EvmCall = {
    to: spokePoolPeripheryAddress,
    data: swapAndBridgeCallData,
    value: 0n,
  }

  return [transferCall, swapAndBridgeCall]
}
