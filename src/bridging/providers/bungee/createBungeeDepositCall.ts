import { WeirollCommandFlags, createWeirollContract, createWeirollDelegateCall } from '../../../weiroll'
import { Contract as WeirollContract } from '@weiroll/weiroll.js'
import { Contract as EthersContract } from '@ethersproject/contracts'
import { ETH_ADDRESS, EvmCall } from '../../../common'
import { CowShedSdk } from '../../../cow-shed'
import { BungeeQuoteResult } from './BungeeBridgeProvider'
import { QuoteBridgeRequest } from '../../types'
import { BUNGEE_COWSWAP_LIB_ABI, ERC20_ABI, SOCKET_GATEWAY_ABI } from './abi'
import { decodeAmountsBungeeTxData, decodeBungeeBridgeTxData, fetchTokenAllowance } from './util'
import { TargetChainId } from 'src/chains'
import { BungeeCowswapLibAddresses } from './const/contracts'
import { BungeeTxDataBytesIndices } from './const/misc'
import { BungeeBridge } from './types'
import { BigNumber, ethers } from 'ethers'
import { getSigner } from 'src/common/utils/wallet'
import { factoryGetErc20Decimals } from 'src/bridging/BridgingSdk/getErc20Decimals'

function getSellTokenContract(sellTokenAddress: string): WeirollContract {
  return createWeirollContract(new EthersContract(sellTokenAddress, ERC20_ABI), WeirollCommandFlags.CALL)
}

function getBungeeCowswapLibContact(sourceChainId: TargetChainId): WeirollContract {
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
  const BungeeCowswapLibContract = getBungeeCowswapLibContact(request.sellTokenChainId)
  const socketGatewayContract = getSocketGatewayContract(buildTx.txData.to)

  // Check & set allowance for SocketGateway to transfer bridged tokens
  // check if allowance is sufficient
  let setAllowance = false
  let allowanceToSet = BigNumber.from(0)
  // check if token is not native token
  const isNativeToken = request.sellTokenAddress.toLowerCase() === ETH_ADDRESS.toLowerCase()
  if (!isNativeToken) {
    const signer = getSigner(request.signer)
    const tokenDecimals = await factoryGetErc20Decimals(signer)(request.sellTokenChainId, request.sellTokenAddress)
    const allowance = await fetchTokenAllowance({
      chainId: request.sellTokenChainId,
      tokenAddress: request.sellTokenAddress,
      ownerAddress: cowShedAccount, // approval should be from cowshed account
      spenderAddress: buildTx.approvalData.spenderAddress,
      signer: request.signer,
    })
    if (allowance < BigInt(buildTx.approvalData.amount)) {
      setAllowance = true
      // TODO test if the rawValue balance bytes can be used for approval
      // @note using higher allowance for saving gas on subsequent txs
      allowanceToSet = ethers.utils.parseUnits('1000', tokenDecimals)
    }
  }

  const bridgeDepositCall = createWeirollDelegateCall((planner) => {
    // add weiroll action to approve token to socket gateway
    if (setAllowance) {
      planner.add(SellTokenContract.approve(buildTx.approvalData.spenderAddress, allowanceToSet))
    }

    // Get bridged amount (balance of the intermediate token at swap time)
    // fetching raw value in bytes since we need to replace bytes in the encoded function data
    const sourceAmountIncludingSurplusBytes = planner.add(SellTokenContract.balanceOf(cowShedAccount).rawValue())
    // add weiroll action to replace input amount with new input amount
    const encodedFunctionDataWithNewInputAmount = planner.add(
      BungeeCowswapLibContract.replaceBytes(
        encodedFunctionData,
        BungeeTxDataBytesIndices[bungeeQuote.routeBridge].inputAmount.bytes_startIndex,
        BungeeTxDataBytesIndices[bungeeQuote.routeBridge].inputAmount.bytes_length,
        sourceAmountIncludingSurplusBytes,
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

      // new input amount
      const newInputAmount = sourceAmountIncludingSurplusBytes

      // weiroll: increase output amount by pctDiff
      const newOutputAmount = planner.add(
        BungeeCowswapLibContract.applyPctDiff(
          inputAmountBigNumber, // base
          newInputAmount, // compare
          outputAmountBigNumber, // target
        ).rawValue(),
      )
      // weiroll: replace output amount bytes with newOutputAmount
      // TODO will write a new cheaper replaceBytes function on the contract and use that
      const encodedFunctionDataWithNewInputAndOutputAmount = planner.add(
        BungeeCowswapLibContract.replaceBytes(
          finalEncodedFunctionData,
          BungeeTxDataBytesIndices[bungeeQuote.routeBridge].outputAmount.bytes_startIndex,
          BungeeTxDataBytesIndices[bungeeQuote.routeBridge].outputAmount.bytes_length,
          newOutputAmount,
        ),
      )
      finalEncodedFunctionData = encodedFunctionDataWithNewInputAndOutputAmount
    }

    // weiroll: execute route on socket gateway
    planner.add(socketGatewayContract.executeRoute(routeId, finalEncodedFunctionData))
  })

  return bridgeDepositCall
}
