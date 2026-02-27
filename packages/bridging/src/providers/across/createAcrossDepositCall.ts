import { ACROSS_SPOKE_POOL_PERIPHERY_CONTRACT_ADDRESSES, ACROSS_SPOKE_POOL_CONTRACT_ADDRESSES } from './const/contracts'
import { ACROSS_SPOKE_POOL_PERIPHERY_ABI } from './abi'
import { EvmCall, TargetChainId } from '@cowprotocol/sdk-config'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import { QuoteBridgeRequest } from '../../types'
import { getGlobalAdapter } from '@cowprotocol/sdk-common'

const ERC20_APPROVE_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const ERC20_BALANCE_OF_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

const TRANSFER_TYPE_APPROVAL = 0
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

/**
 * Converts an Ethereum address (20 bytes) to bytes32 by left-padding with zeros.
 * Matches Solidity: bytes32(uint256(uint160(address)))
 */
export function addressToBytes32(address: string): string {
  return '0x' + address.slice(2).toLowerCase().padStart(64, '0')
}

function getSpokePoolPeripheryAddress(chainId: TargetChainId): string {
  const address = ACROSS_SPOKE_POOL_PERIPHERY_CONTRACT_ADDRESSES[chainId]
  if (!address) {
    throw new Error('Spoke pool periphery address not found for chain: ' + chainId)
  }
  return address
}

function getSpokePoolAddress(chainId: TargetChainId): string {
  const address = ACROSS_SPOKE_POOL_CONTRACT_ADDRESSES[chainId]
  if (!address) {
    throw new Error('Spoke pool address not found for chain: ' + chainId)
  }
  return address
}

/**
 * Creates the EVM calls needed to bridge tokens via Across using the SpokePoolPeriphery contract.
 *
 * The flow:
 * 1. Approve the SpokePoolPeriphery to pull tokens from cow-shed
 * 2. Call swapAndBridge on the periphery with a pass-through "swap" (no actual token swap)
 *    - The periphery pulls tokens from cow-shed, passes them through the SwapProxy (identity swap),
 *      and deposits them into the SpokePool
 *    - enableProportionalAdjustment=true ensures the output amount scales if the actual input differs
 *
 * @returns An array of EvmCalls: [approve, swapAndBridge]
 */
export function createAcrossDepositCall(params: {
  request: QuoteBridgeRequest
  quote: AcrossQuoteResult
  cowShedSdk: CowShedSdk
}): EvmCall[] {
  const { request, quote, cowShedSdk } = params
  const { sellTokenChainId, sellTokenAddress, buyTokenChainId, buyTokenAddress, account, receiver } = request

  const adapter = getGlobalAdapter()

  const spokePoolPeripheryAddress = getSpokePoolPeripheryAddress(sellTokenChainId)
  const spokePoolAddress = getSpokePoolAddress(sellTokenChainId)
  const cowShedAccount = cowShedSdk.getCowShedAccount(sellTokenChainId, account)

  const { suggestedFees } = quote
  const inputAmount = request.amount
  const outputAmount = quote.amountsAndCosts.afterFee.buyAmount

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
      inputToken: sellTokenAddress,
      outputToken: addressToBytes32(buyTokenAddress),
      outputAmount,
      depositor: cowShedAccount,
      recipient: addressToBytes32(receiver || account),
      destinationChainId: BigInt(buyTokenChainId),
      exclusiveRelayer: addressToBytes32(suggestedFees.exclusiveRelayer),
      quoteTimestamp: Number(suggestedFees.timestamp),
      fillDeadline: Number(suggestedFees.fillDeadline),
      exclusivityParameter: Number(suggestedFees.exclusivityDeadline),
      message: '0x',
    },
    swapToken: sellTokenAddress,
    exchange: sellTokenAddress,
    transferType: TRANSFER_TYPE_APPROVAL,
    swapTokenAmount: inputAmount,
    minExpectedInputTokenAmount: inputAmount,
    routerCalldata: noOpSwapCalldata,
    enableProportionalAdjustment: true,
    spokePool: spokePoolAddress,
    nonce: 0n,
  }

  // Call 1: Approve the SpokePoolPeriphery to pull tokens from cow-shed
  const approveCallData = adapter.utils.encodeFunction(ERC20_APPROVE_ABI, 'approve', [
    spokePoolPeripheryAddress,
    inputAmount,
  ]) as string

  const approveCall: EvmCall = {
    to: sellTokenAddress,
    data: approveCallData,
    value: 0n,
  }

  // Call 2: Execute swapAndBridge on the SpokePoolPeriphery
  const swapAndBridgeCallData = adapter.utils.encodeFunction(ACROSS_SPOKE_POOL_PERIPHERY_ABI, 'swapAndBridge', [
    swapAndDepositData,
  ]) as string

  const swapAndBridgeCall: EvmCall = {
    to: spokePoolPeripheryAddress,
    data: swapAndBridgeCallData,
    value: 0n,
  }

  return [approveCall, swapAndBridgeCall]
}