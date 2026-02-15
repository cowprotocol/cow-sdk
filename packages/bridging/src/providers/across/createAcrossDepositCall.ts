import { WeirollContract } from '@cowprotocol/sdk-weiroll'
import { ACROSS_MATH_CONTRACT_ADDRESSES, ACROSS_SPOOK_CONTRACT_ADDRESSES } from './const/contracts'
import { WeirollCommandFlags, createWeirollContract, createWeirollDelegateCall } from '@cowprotocol/sdk-weiroll'
import { ACROSS_MATH_ABI, ACROSS_SPOKE_POOL_ABI } from './abi'
import { EvmCall, TargetEvmChainId } from '@cowprotocol/sdk-config'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import { QuoteBridgeRequest } from '../../types'
import { getGlobalAdapter } from '@cowprotocol/sdk-common'

const ERC20_BALANCE_OF_ABI = ['function balanceOf(address account) external view returns (uint256)'] as const
const ERC20_APPROVE_OF_ABI = ['function approve(address spender, uint256 amount) external returns (bool)'] as const

function getSpookPoolContract(sellTokenChainId: TargetEvmChainId): WeirollContract {
  const adapter = getGlobalAdapter()
  const spokePoolAddress = ACROSS_SPOOK_CONTRACT_ADDRESSES[sellTokenChainId]
  if (!spokePoolAddress) {
    throw new Error('Spoke pool address not found for chain: ' + sellTokenChainId)
  }
  return createWeirollContract(
    adapter.getContract(spokePoolAddress, ACROSS_SPOKE_POOL_ABI) as any,
    WeirollCommandFlags.CALL,
  )
}

function getMathContract(sellTokenChainId: TargetEvmChainId): WeirollContract {
  const adapter = getGlobalAdapter()
  const mathContractAddress = ACROSS_MATH_CONTRACT_ADDRESSES[sellTokenChainId]
  if (!mathContractAddress) {
    throw new Error('Math contract address not found for chain: ' + sellTokenChainId)
  }

  return createWeirollContract(
    adapter.getContract(mathContractAddress, ACROSS_MATH_ABI) as any,
    WeirollCommandFlags.CALL,
  )
}

function getBalanceOfSellTokenContract(sellTokenAddress: string): WeirollContract {
  const adapter = getGlobalAdapter()
  return createWeirollContract(
    adapter.getContract(sellTokenAddress, ERC20_BALANCE_OF_ABI),
    WeirollCommandFlags.STATICCALL,
  )
}

function getApproveSellTokenContract(sellTokenAddress: string): WeirollContract {
  const adapter = getGlobalAdapter()
  return createWeirollContract(adapter.getContract(sellTokenAddress, ERC20_APPROVE_OF_ABI), WeirollCommandFlags.CALL)
}

export function createAcrossDepositCall(params: {
  request: QuoteBridgeRequest
  quote: AcrossQuoteResult
  cowShedSdk: CowShedSdk
}): EvmCall {
  const { request, quote, cowShedSdk } = params
  const { sellTokenChainId, sellTokenAddress, buyTokenChainId, buyTokenAddress, account, receiver } = request

  // Create the relevant weiroll contracts
  const spokePoolContract = getSpookPoolContract(sellTokenChainId)
  const mathContract = getMathContract(sellTokenChainId)
  const balanceOfSellTokenContract = getBalanceOfSellTokenContract(sellTokenAddress)
  const approveSellTokenContract = getApproveSellTokenContract(sellTokenAddress)

  // Get the cow shed account
  const cowShedAccount = cowShedSdk.getCowShedAccount(sellTokenChainId, account)

  const { suggestedFees } = quote

  // Get the weiroll call of the deposit into spoke pool
  const depositCall = createWeirollDelegateCall((planner) => {
    // Get bridged amount (balance of the intermediate token at swap time)
    const sourceAmountIncludingSurplus = planner.add(balanceOfSellTokenContract.balanceOf(cowShedAccount))

    // Calculate the new output amount using the actual received intermediate tokens (uses the original quoted fee)
    const relayFeePercentage = BigInt(suggestedFees.totalRelayFee.pct)
    const outputAmountIncludingSurplus = planner.add(
      mathContract.multiplyAndSubtract(sourceAmountIncludingSurplus, relayFeePercentage),
    )

    // Set allowance for SpokePool to transfer bridged tokens
    planner.add(approveSellTokenContract.approve(spokePoolContract.address, sourceAmountIncludingSurplus))

    // Prepare deposit params
    const quoteTimestamp = BigInt(suggestedFees.timestamp)
    const fillDeadline = suggestedFees.fillDeadline
    const exclusivityDeadline = suggestedFees.exclusivityDeadline
    const exclusiveRelayer = suggestedFees.exclusiveRelayer
    const message = '0x'

    // Deposit into spoke pool
    planner.add(
      spokePoolContract.depositV3(
        cowShedAccount,
        receiver || account,
        sellTokenAddress,
        buyTokenAddress,
        sourceAmountIncludingSurplus,
        outputAmountIncludingSurplus,
        buyTokenChainId,
        exclusiveRelayer,
        quoteTimestamp,
        fillDeadline,
        exclusivityDeadline,
        message,
      ),
    )
  })

  // Return the deposit into spoke pool call
  return depositCall
}
