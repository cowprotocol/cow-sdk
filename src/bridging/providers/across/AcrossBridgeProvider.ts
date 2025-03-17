/* eslint-disable @typescript-eslint/no-unused-vars */
import { Signer } from 'ethers'

import { Contract as WeirollContract } from '@weiroll/weiroll.js'
import { Contract as EthersContract } from '@ethersproject/contracts'

import {
  BridgeDeposit,
  BridgeHook,
  BridgeProvider,
  BridgeProviderInfo,
  BridgeQuoteResult,
  BridgeStatusResult,
  GetBuyTokensParams,
  QuoteBridgeRequest,
} from '../../types'

import { RAW_PROVIDERS_FILES_PATH } from '../../const'

import { ChainId, ChainInfo, SupportedChainId, TargetChainId } from '../../../chains'

import { acrossTokenMapping } from './const/tokens'
import { EvmCall, TokenInfo } from '../../../common'

import { mainnet } from '../../../chains/details/mainnet'
import { polygon } from '../../../chains/details/polygon'
import { arbitrumOne } from 'src/chains/details/arbitrum'
import { base } from '../../../chains/details/base'
import { optimism } from '../../../chains/details/optimism'
import { AcrossApi, AcrossApiOptions, SuggestedFeesResponse } from './AcrossApi'
import { getChainConfigs, getTokenAddress, getTokenSymbol, toBridgeQuoteResult } from './util'
import { ACROSS_MATH_CONTRACT_ADDRESSES, ACROSS_SPOOK_CONTRACT_ADDRESSES } from './const/contracts'
import { CowShedSdk, CowShedSdkOptions } from '../../../cow-shed'
import { CommandFlags, createWeirollDelegateCall } from '../../../weiroll'
import { ACROSS_MATH_ABI, ACROSS_SPOKE_POOL_ABI } from './abi'

const DEPOSIT_SPOOK_DAPP_ID = 'AcrossBridgeProvider-depositIntoSpokePool'
const ERC20_BALANCE_OF_ABI = ['function balanceOf(address account) external view returns (uint256)'] as const

const ERC20_APPROVE_OF_ABI = ['function approve(address spender, uint256 amount) external returns (bool)'] as const

interface AcrossBridgeProviderOptions {
  /**
   * Token info provider
   * @param chainId - The chain ID
   * @param addresses - The addresses of the tokens to get the info for
   * @returns The token infos
   */
  getTokenInfos: (chainId: ChainId, addresses: string[]) => Promise<TokenInfo[]>

  // API options
  apiOptions?: AcrossApiOptions

  // Cow-shed options
  cowShedOptions?: CowShedSdkOptions
}

export interface AcrossQuoteResult extends BridgeQuoteResult {
  suggestedFees: SuggestedFeesResponse
}

export class AcrossBridgeProvider implements BridgeProvider<AcrossQuoteResult> {
  private api: AcrossApi
  private cowShedSdk: CowShedSdk

  constructor(private options: AcrossBridgeProviderOptions) {
    this.api = new AcrossApi(options.apiOptions)
    this.cowShedSdk = new CowShedSdk(options.cowShedOptions)
  }

  info: BridgeProviderInfo = {
    name: 'Across',
    logoUrl: `${RAW_PROVIDERS_FILES_PATH}/across/across-logo.png`,
  }

  async getNetworks(): Promise<ChainInfo[]> {
    return [mainnet, polygon, arbitrumOne, base, optimism]
  }

  async getBuyTokens(param: GetBuyTokensParams): Promise<TokenInfo[]> {
    const { targetChainId } = param

    const chainConfig = acrossTokenMapping[targetChainId as TargetChainId]
    if (!chainConfig) {
      return []
    }

    const tokenAddresses = Object.values(chainConfig.tokens)
    return this.options.getTokenInfos(targetChainId, tokenAddresses)
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<string[]> {
    // TODO: This is a temporary implementation. We should use the Across API to get the intermediate tokens (see this.getAvailableRoutes())
    const { sellTokenChainId, buyTokenChainId, buyTokenAddress } = request
    const chainConfigs = getChainConfigs(sellTokenChainId, buyTokenChainId)
    if (!chainConfigs) return []

    const { sourceChainConfig, targetChainConfig } = chainConfigs

    // Find the token symbol for the target token
    const targetTokenSymbol = getTokenSymbol(buyTokenAddress, targetChainConfig)
    if (!targetTokenSymbol) return []

    // Use the tokenSymbol to find the outputToken in the target chain
    const intermediateToken = getTokenAddress(targetTokenSymbol, sourceChainConfig)
    return intermediateToken ? [intermediateToken] : []
  }

  async getQuote(request: QuoteBridgeRequest): Promise<AcrossQuoteResult> {
    const { sellTokenAddress, sellTokenChainId, buyTokenChainId, amount, recipient } = request

    const suggestedFees = await this.api.getSuggestedFees({
      token: sellTokenAddress,
      // inputToken: sellTokenAddress,
      // outputToken: buyTokenAddress,
      originChainId: sellTokenChainId,
      destinationChainId: buyTokenChainId,
      amount,
      recipient,
    })

    // TODO: The suggested fees contain way more information. As we review more bridge providers we should revisit the
    // facade of the quote result.
    //
    // For example, this contains also information on the limits, so you don't need to quote again for the same pair.
    // potentially, this could be cached for a short period of time in the SDK so we can resolve quotes with less
    // requests.

    return toBridgeQuoteResult(amount, suggestedFees)
  }

  async getUnsignedBridgeTx(request: QuoteBridgeRequest, quote: AcrossQuoteResult): Promise<EvmCall> {
    const { sellTokenChainId, sellTokenAddress, buyTokenChainId, buyTokenAddress, owner, recipient } = request

    // Create SpokePool contract
    const spokePoolAddress = ACROSS_SPOOK_CONTRACT_ADDRESSES[sellTokenChainId]
    if (!spokePoolAddress) {
      throw new Error('Spoke pool address not found for chain: ' + sellTokenChainId)
    }
    const spokePoolContract = WeirollContract.createContract(
      new EthersContract(spokePoolAddress, ACROSS_SPOKE_POOL_ABI),
      CommandFlags.CALL
    )

    // Create Math contract
    const mathContractAddress = ACROSS_MATH_CONTRACT_ADDRESSES[sellTokenChainId]
    if (!mathContractAddress) {
      throw new Error('Math contract address not found for chain: ' + sellTokenChainId)
    }
    const mathContract = WeirollContract.createContract(
      new EthersContract(mathContractAddress, ACROSS_MATH_ABI),
      CommandFlags.CALL
    )

    // Create 'balanceOf' static call contract for the sell token
    const balanceOfSellTokenContract = WeirollContract.createContract(
      new EthersContract(sellTokenAddress, ERC20_BALANCE_OF_ABI),
      CommandFlags.STATICCALL
    )

    // Create 'approve' call contract for the sell token
    const approveSellTokenContract = WeirollContract.createContract(
      new EthersContract(sellTokenAddress, ERC20_APPROVE_OF_ABI),
      CommandFlags.CALL
    )

    // Get the cow shed account
    const cowShedAccount = this.cowShedSdk.getCowShedAccount(sellTokenChainId, owner)

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
      planner.add(approveSellTokenContract.approve(spokePoolAddress, sourceAmountIncludingSurplus))

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
          recipient,
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

  async getSignedHook(chainId: SupportedChainId, unsignedCall: EvmCall, signer: Signer): Promise<BridgeHook> {
    // Sign the multicall
    const { signedMulticall, cowShedAccount, gasLimit } = await this.cowShedSdk.signCalls({
      calls: [
        {
          target: unsignedCall.to,
          value: unsignedCall.value,
          callData: unsignedCall.data,
          allowFailure: false,
          isDelegateCall: true,
        },
      ],
      chainId,
      signer,
    })

    const { to, data } = signedMulticall
    return {
      postHook: {
        target: to,
        callData: data,
        gasLimit: gasLimit.toString(),
        dappId: DEPOSIT_SPOOK_DAPP_ID, // TODO: I think we should have some additional parameter to type the hook (using dappId for now)
      },
      recipient: cowShedAccount,
    }
  }
  async decodeBridgeHook(_hook: BridgeHook): Promise<BridgeDeposit> {
    throw new Error('Not implemented')
  }

  async getBridgingId(_orderUid: string, _settlementTx: string): Promise<string> {
    throw new Error('Not implemented')
  }

  getExplorerUrl(_bridgingId: string): string {
    throw new Error('Not implemented')
  }

  async getStatus(_bridgingId: string): Promise<BridgeStatusResult> {
    throw new Error('Not implemented')
  }

  async getCancelBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
  async getRefundBridgingTx(_bridgingId: string): Promise<EvmCall> {
    throw new Error('Not implemented')
  }
}
