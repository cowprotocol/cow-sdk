import { WeirollCommandFlags, createWeirollContract, createWeirollDelegateCall } from '../../../weiroll'
import { Contract as WeirollContract } from '@weiroll/weiroll.js'
import { Contract as EthersContract } from '@ethersproject/contracts'
import { ETH_ADDRESS, EvmCall } from '../../../common'
import { CowShedSdk } from '../../../cow-shed'
import { BungeeQuoteResult } from './BungeeBridgeProvider'
import { QuoteBridgeRequest } from '../../types'
import { BUNGEE_COWSWAP_LIB_ABI, ERC20_ABI, SOCKET_GATEWAY_ABI } from './abi'
import { decodeAmountsBungeeTxData, decodeBungeeBridgeTxData } from './util'
import { TargetChainId } from '../../../chains'
import { BungeeCowswapLibAddresses } from './const/contracts'
import { BungeeTxDataBytesIndices } from './const/misc'
import { BungeeBridge } from './types'

function getSellTokenContract(sellTokenAddress: string): WeirollContract {
  return createWeirollContract(new EthersContract(sellTokenAddress, ERC20_ABI), WeirollCommandFlags.CALL)
}

function getBungeeCowswapLibContract(sourceChainId: TargetChainId): WeirollContract {
  const bungeeCowswapLibContractAddress = BungeeCowswapLibAddresses[sourceChainId]
  if (!bungeeCowswapLibContractAddress) {
    throw new Error('BungeeCowswapLib contract not found')
  }
  return createWeirollContract(
    new EthersContract(bungeeCowswapLibContractAddress, BUNGEE_COWSWAP_LIB_ABI),
    WeirollCommandFlags.CALL,
  )
}

function getSocketGatewayContract(socketGatewayAddress: string): WeirollContract {
  return createWeirollContract(new EthersContract(socketGatewayAddress, SOCKET_GATEWAY_ABI), WeirollCommandFlags.CALL)
}

export async function createBungeeDepositCall(params: {
  request: QuoteBridgeRequest
  quote: BungeeQuoteResult
  cowShedSdk: CowShedSdk
}): Promise<EvmCall> {
  const { request, quote, cowShedSdk } = params
  const { bungeeQuote, buildTx } = quote
  const { routeId, encodedFunctionData } = decodeBungeeBridgeTxData(buildTx.txData.data)

  // get cowShed account address
  const ownerAddress = request.owner ?? request.account
  const cowShedAccount = cowShedSdk.getCowShedAccount(request.sellTokenChainId, ownerAddress)

  // prep all weiroll contracts
  const SellTokenContract = getSellTokenContract(request.sellTokenAddress)
  const BungeeCowswapLibContract = getBungeeCowswapLibContract(request.sellTokenChainId)
  const socketGatewayContract = getSocketGatewayContract(buildTx.txData.to)

  // Check & set allowance for SocketGateway to transfer bridged tokens
  // set allowance if not native token
  let setAllowance = false
  if (!(request.sellTokenAddress.toLowerCase() === ETH_ADDRESS.toLowerCase())) {
    setAllowance = true
  }

  const bridgeDepositCall = createWeirollDelegateCall((planner) => {
    // add weiroll action to replace input amount with new input amount
    const sourceAmountIncludingSurplus = planner.add(SellTokenContract.balanceOf(cowShedAccount))

    // add weiroll action to approve token to socket gateway
    if (setAllowance) {
      planner.add(SellTokenContract.approve(buildTx.approvalData.spenderAddress, sourceAmountIncludingSurplus))
    }

    const encodedFunctionDataWithNewInputAmount = planner.add(
      BungeeCowswapLibContract.replaceUint256(
        encodedFunctionData, // original encoded function data
        BungeeTxDataBytesIndices[bungeeQuote.routeBridge].inputAmount.bytes_startIndex, // start index of input amount
        sourceAmountIncludingSurplus, // new input amount
      ),
    )
    let finalEncodedFunctionData = encodedFunctionDataWithNewInputAmount

    // if bridge is across, update the output amount based on pctDiff of the new balance
    if (bungeeQuote.routeBridge === BungeeBridge.Across) {
      // decode current input & output amounts
      const { inputAmountBigNumber, outputAmountBigNumber } = decodeAmountsBungeeTxData(
        encodedFunctionData,
        bungeeQuote.routeBridge,
      )

      // weiroll: increase output amount by pctDiff
      const newOutputAmount = planner.add(
        BungeeCowswapLibContract.applyPctDiff(
          inputAmountBigNumber, // base
          sourceAmountIncludingSurplus, // compare - new input amount
          outputAmountBigNumber, // target
        ),
      )
      // weiroll: replace output amount bytes with newOutputAmount
      const encodedFunctionDataWithNewInputAndOutputAmount = planner.add(
        BungeeCowswapLibContract.replaceUint256(
          finalEncodedFunctionData, // original encoded function data
          BungeeTxDataBytesIndices[bungeeQuote.routeBridge].outputAmount.bytes_startIndex, // start index of output amount
          newOutputAmount, // new output amount
        ),
      )
      finalEncodedFunctionData = encodedFunctionDataWithNewInputAndOutputAmount
    }

    // weiroll: execute route on socket gateway
    planner.add(socketGatewayContract.executeRoute(routeId, finalEncodedFunctionData))
  })

  return bridgeDepositCall
}
