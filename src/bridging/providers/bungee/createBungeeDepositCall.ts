import { ethers } from 'ethers'
import { ETH_ADDRESS, EvmCall } from '../../../common'
import { BungeeQuoteResult } from './BungeeBridgeProvider'
import { QuoteBridgeRequest } from '../../types'
import { BungeeTxDataBytesIndices } from './const/misc'
import { BungeeBridge } from './types'
import { BUNGEE_APPROVE_AND_BRIDGE_V1_ABI } from './abi'
import { BungeeApproveAndBridgeV1Addresses } from './const/contracts'

export async function createBungeeDepositCall(params: {
  request: QuoteBridgeRequest
  quote: BungeeQuoteResult
}): Promise<EvmCall> {
  const { request, quote } = params
  const { bungeeQuote, buildTx } = quote

  // Prepare modifyCalldataParams for the bridge contract
  // information required for modifying input amount and output amount
  const bridge = bungeeQuote.routeBridge
  const inputAmountStartIndex = BungeeTxDataBytesIndices[bridge].inputAmount.bytes_startIndex
  let modifyOutputAmount = false
  let outputAmountStartIndex = 0
  const nativeTokenExtraFee = 0n // neither across nor cctp requires additional native token transfer for now
  // modify output amount for across bridge
  if (bridge === BungeeBridge.Across) {
    modifyOutputAmount = true
    outputAmountStartIndex = BungeeTxDataBytesIndices[bridge].outputAmount.bytes_startIndex
  }
  // Encode extra data as bytes
  const modifyCalldataParams = ethers.utils.defaultAbiCoder.encode(
    ['uint256', 'bool', 'uint256'],
    [inputAmountStartIndex, modifyOutputAmount, outputAmountStartIndex],
  )
  // Concatenate calldata + modifyCalldataParams
  let data = buildTx.txData.data

  if (data.startsWith('0x')) data = data.slice(2)
  let extra = modifyCalldataParams
  if (extra.startsWith('0x')) extra = extra.slice(2)
  const fullData = '0x' + data + extra

  // use the input amount from
  // but will later be modified by BungeeApproveAndBridge
  const bridgeInputAmount = bungeeQuote.input.amount
  // function approveAndBridge(IERC20 token, uint256 minAmount, address receiver, bytes calldata data) external {
  const iface = new ethers.utils.Interface(BUNGEE_APPROVE_AND_BRIDGE_V1_ABI)
  const callData = iface.encodeFunctionData('approveAndBridge', [
    // @note sellTokenAddress here will be the intermediate token in usage. the naming might be a bit misleading
    //       see getQuoteWithBridge.ts::getBaseBridgeQuoteRequest()
    request.sellTokenAddress, // token
    bridgeInputAmount, // minAmount
    nativeTokenExtraFee, // nativeTokenExtraFee
    fullData, // data
  ])

  // If native token, set value; otherwise, value is 0
  // use the output amount from the quote
  // but will later be modified by BungeeApproveAndBridge
  const value = request.sellTokenAddress.toLowerCase() === ETH_ADDRESS.toLowerCase() ? BigInt(bridgeInputAmount) : 0n
  const finalValue = value + nativeTokenExtraFee
  // @note sellTokenChainId here will be the intermediate token chainId. the naming might be a bit misleading
  //       see getQuoteWithBridge.ts::getBaseBridgeQuoteRequest()
  const to = BungeeApproveAndBridgeV1Addresses[request.sellTokenChainId]
  if (!to) {
    throw new Error('BungeeApproveAndBridgeV1 not found')
  }

  return {
    to: to,
    data: callData,
    value: finalValue,
  }
}
