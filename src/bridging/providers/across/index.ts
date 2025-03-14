import { ethers } from 'ethers'
import { BaseTransaction } from '../../types'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { acrossSpokePoolMapping, mathContractMapping } from './const/contracts'
import { getCowShedAccount } from '../cowShed'
import { Planner as WeirollPlanner, Contract as WeirollContract } from '@weiroll/weiroll.js'
import { getAcrossQuote } from './api'
import { getErc20Contract } from '../erc20'
import { CommandFlags, getWeirollTx } from '../weiroll'
import { acrossSpokePoolAbi } from './abi'
import { mathContractAbi } from './acrossMathContractAbi'

export interface BridgeWithAcrossParams {
  owner: string
  sourceChain: SupportedChainId
  sourceToken: string
  sourceTokenAmount: bigint
  targetToken: string
  targetChain: number
  recipient: string
  bridgeAllFromSwap: boolean
}

export async function bridgeWithAcross(params: BridgeWithAcrossParams): Promise<BaseTransaction> {
  const { owner, sourceChain, sourceToken, sourceTokenAmount, targetChain, targetToken, bridgeAllFromSwap, recipient } =
    params

  const spokePoolAddress = acrossSpokePoolMapping[sourceChain]
  const mathContractAddress = mathContractMapping[sourceChain]
  if (!spokePoolAddress || !mathContractAddress) {
    throw new Error('Spoke pool or math contract not found')
  }

  if (!bridgeAllFromSwap) {
    throw new Error('Bridge User Amount: not implemented')
  }

  // Get cow-shed account
  const cowShedAccount = getCowShedAccount(sourceChain, owner)

  const planner = new WeirollPlanner()

  // Get across quote
  const quote = await getAcrossQuote(
    {
      originChainId: sourceChain,
      destinationChainId: targetChain,
      inputToken: sourceToken,
      outputToken: targetToken,
    },
    BigInt(sourceTokenAmount),
    recipient
  )
  const relayFeePercentage = quote.totalRelayFee.pct // TODO: review fee model

  // Create bridged token contract
  const bridgedTokenContract = WeirollContract.createContract(
    getErc20Contract(sourceToken),
    CommandFlags.CALL // TODO: I think I should use CALL just for the approve, and STATICCALL for the balanceOf (for now is just testing)
  )

  // Create SpokePool contract
  const spokePoolContract = WeirollContract.createContract(
    new ethers.Contract(spokePoolAddress, acrossSpokePoolAbi),
    CommandFlags.CALL
  )

  // Create Math contract
  const mathContract = WeirollContract.createContract(
    new ethers.Contract(mathContractAddress, mathContractAbi),
    CommandFlags.CALL
  )

  // Get balance of CoW shed proxy
  console.log(`[across] Get cow-shed balance for ERC20.balanceOf(${cowShedAccount}) for ${bridgedTokenContract}`)

  // Get bridged amount (balance of the intermediate token at swap time)
  const sourceAmountIncludingSurplus = planner.add(bridgedTokenContract.balanceOf(cowShedAccount))

  // Get the output amount using the actual received intermediate amount
  const outputAmountIncludingSurplus = planner.add(
    mathContract.multiplyAndSubtract(sourceAmountIncludingSurplus, BigInt(relayFeePercentage))
  )

  // Set allowance for SpokePool to transfer bridged tokens
  console.log(
    `[acros] bridgedTokenContract.approve(${spokePoolAddress}, ${sourceAmountIncludingSurplus}) for ${bridgedTokenContract}`
  )
  planner.add(bridgedTokenContract.approve(spokePoolAddress, sourceAmountIncludingSurplus))

  // Prepare deposit params
  const quoteTimestamp = BigInt(quote.timestamp)
  const fillDeadline = quote.fillDeadline // BigInt(Math.floor(Date.now() / 1000) + 7200); // 2 hours from now
  const exclusivityDeadline = quote.exclusivityDeadline
  const exclusiveRelayer = quote.exclusiveRelayer
  const message = '0x'

  // Deposit into spoke pool
  planner.add(
    spokePoolContract.depositV3(
      cowShedAccount,
      recipient,
      sourceToken,
      targetToken,
      sourceAmountIncludingSurplus,
      outputAmountIncludingSurplus,
      targetChain,
      exclusiveRelayer,
      quoteTimestamp,
      fillDeadline,
      exclusivityDeadline,
      message
    )
  )

  // Return the transaction
  return getWeirollTx({ planner })
}

export { getIntermediateTokenFromTargetToken } from './api'
