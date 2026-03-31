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
 * Builds the two EVM calls needed to bride tokens view Across using the SpokePoolPeriphery contract.
 *
 * 1. Prefund Across SwapProxy (`ERC20.transfer(swapProxy, prefundFromShedAmount)`).
 *
 *    Note: The old flow assumed the amount to bridge is known up front and equals the quoted amount
 *    (request.amount), but that's not true because the swap executes later during settlement and
 *    can produce surplus. So instead of approving the `SpokePoolPeriphery` to pull tokens from cow-shed,
 *    we prefund `SwapProxy`.
 *
 * 2. Call `SpokePoolPeriphery.swapAndBridge` with a pass-through "swap"
 *    (no actual token swap), using Across-recommended parameters for surplus.
 *
 *    Then the periphery pulls tokens from cow-shed, passes them through the SwapProxy (identity swap),
 *    and deposits them into the SpokePool.
 *
 *    `enableProportionalAdjustment=true` ensures the output amount scales if the actual input differs.
 *
 * Implementation limitations notes:
 *
 * The periphery first pulls `swapTokenAmount` from `msg.sender` (the Shed) into itself, then
 * forwards that same `swapTokenAmount` into SwapProxy and runs `performSwap`. The swap proxy
 * measures **output** as the **full ERC20 balance** of the bridge input token sitting on SwapProxy
 * *after* the (possibly no-op) `exchange` call, and returns that balance to the periphery as
 * `returnAmount`. The periphery then requires `returnAmount >= minExpectedInputTokenAmount` and,
 * if `enableProportionalAdjustment` is true, scales `depositData.outputAmount` by
 * `returnAmount / minExpectedInputTokenAmount`.
 *
 * **Old CoW bug:** we set `swapTokenAmount == request.amount` and approved the periphery to pull
 * only that much. CoW swap surplus stayed on the Shed because it was never pulled.
 *
 * **Fix:** set `swapTokenAmount` to **0** so the periphery pulls nothing from the Shed in the
 * initial `transferFrom`. Instead we **already** moved tokens onto SwapProxy in step (1). Any
 * positive balance there (including amounts **above** the quoted leg) becomes `returnAmount`.
 *
 * **Critical:** `minExpectedInputTokenAmount` must equal the **`amount` passed to Across
 * `/suggested-fees`** (here: `request.amount`) — the conservative “worst case” intermediate size.
 * Then any *actual* balance on SwapProxy **strictly greater** than that minimum increases the
 * bridged output proportionally instead of being stranded on the Shed.
 *
 * Important Note: Full CoW surplus and calldata limits:
 *
 * Hook calldata is fixed when the user signs. This SDK therefore defaults `prefundFromShedAmount`
 * to `request.amount`. To bridge **every wei** of post-settlement surplus, the integrator must
 * supply a larger `prefundFromShedAmount` when it learns the executed intermediate balance (e.g.
 * via a small helper contract that transfers `balanceOf(address(this))`, or by regenerating hooks).
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
}): EvmCall[] {
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
