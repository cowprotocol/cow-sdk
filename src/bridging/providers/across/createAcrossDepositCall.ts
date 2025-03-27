import { Contract as WeirollContract } from '@weiroll/weiroll.js'
import { Contract as EthersContract } from '@ethersproject/contracts'

import { EvmCall } from '../../../common'

import { ACROSS_MATH_CONTRACT_ADDRESSES, ACROSS_SPOOK_CONTRACT_ADDRESSES } from './const/contracts'
import { WeirollCommandFlags, createWeirollContract, createWeirollDelegateCall } from '../../../weiroll'
import { ACROSS_MATH_ABI, ACROSS_SPOKE_POOL_ABI } from './abi'
import { TargetChainId } from '../../../chains/types'
import { CowShedSdk } from '../../../cow-shed'
import { AcrossQuoteResult } from './AcrossBridgeProvider'
import { QuoteBridgeRequest } from '../../types'

const ERC20_BALANCE_OF_ABI = ['function balanceOf(address account) external view returns (uint256)'] as const
const ERC20_APPROVE_OF_ABI = ['function approve(address spender, uint256 amount) external returns (bool)'] as const

function getSpookPoolContract(sellTokenChainId: TargetChainId): WeirollContract {
  const spokePoolAddress = ACROSS_SPOOK_CONTRACT_ADDRESSES[sellTokenChainId]
  if (!spokePoolAddress) {
    throw new Error('Spoke pool address not found for chain: ' + sellTokenChainId)
  }
  return createWeirollContract(new EthersContract(spokePoolAddress, ACROSS_SPOKE_POOL_ABI), WeirollCommandFlags.CALL)
}

function getMathContract(sellTokenChainId: TargetChainId): WeirollContract {
  const mathContractAddress = ACROSS_MATH_CONTRACT_ADDRESSES[sellTokenChainId]
  if (!mathContractAddress) {
    throw new Error('Math contract address not found for chain: ' + sellTokenChainId)
  }

  return createWeirollContract(new EthersContract(mathContractAddress, ACROSS_MATH_ABI), WeirollCommandFlags.CALL)
}

function getBalanceOfSellTokenContract(sellTokenAddress: string): WeirollContract {
  return createWeirollContract(
    new EthersContract(sellTokenAddress, ERC20_BALANCE_OF_ABI),
    WeirollCommandFlags.STATICCALL
  )
}

function getApproveSellTokenContract(sellTokenAddress: string): WeirollContract {
  return createWeirollContract(new EthersContract(sellTokenAddress, ERC20_APPROVE_OF_ABI), WeirollCommandFlags.CALL)
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
      mathContract.multiplyAndSubtract(sourceAmountIncludingSurplus, relayFeePercentage)
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
        message
      )
    )
  })

  // Return the deposit into spoke pool call
  return depositCall
}
