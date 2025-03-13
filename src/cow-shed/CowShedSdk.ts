import { ethers } from 'ethers'
import { EvmCall, SignerLike, SupportedChainId } from '../common'
import { CowShedHooks } from './contracts/CoWShedHooks'
import { EcdsaSigningScheme, SigningScheme } from '@cowprotocol/contracts'
import { ICoWShedCall, ICoWShedOptions } from './types'
import { getSigner } from 'src/common/utils/wallet'

const NON_EXPIRING_DEADLINE = ethers.constants.MaxUint256.toBigInt()

export interface SignAndEncodeTxArgs {
  /**
   * Calls to pre-authorize on the cow-shed account
   */
  calls: ICoWShedCall[]

  /**
   * Signer for the cow-shed's owner account.
   *
   * The signer will be used to pre-authorise the calls.
   * The cow-shed account will be derived from this signer.
   */
  signer?: SignerLike

  /**
   * Chain ID to use for the transaction.
   */
  chainId: SupportedChainId

  /**
   * Nonce to use for the transaction. If not provided, the current timestamp will be used.
   */
  nonce?: string

  /**
   * Deadline to use for the transaction. If not provided, the maximum uint256 will be used.
   */
  deadline?: bigint

  /**
   * Default gas limit to use for the transaction. If not provided, it will throw an error if the gas limit cannot be estimated.
   */
  defaultGasLimit?: ethers.BigNumber

  /**
   * Signing scheme to use for the transaction.
   */
  signingScheme?: EcdsaSigningScheme
}

export interface CowShedCall {
  cowShedAccount: string
  signedMulticall: EvmCall
  gasLimit: bigint
}

export interface CowShedSdkOptions {
  /**
   * Signer for the cow-shed's owner account.
   */
  signer?: SignerLike

  /**
   * Custom options for the cow-shed hooks.
   */
  factoryOptions?: ICoWShedOptions
}

export class CowShedSdk {
  static COW_SHED_CACHE = new Map<SupportedChainId, CowShedHooks>()

  constructor(private options: CowShedSdkOptions = {}) {}

  getCowShedAccount(chainId: SupportedChainId, ownerAddress: string): string {
    const cowShedHooks = CowShedSdk.getCowShedHooks(chainId, this.options?.factoryOptions)
    return cowShedHooks.proxyOf(ownerAddress)
  }

  /**
   * Encodes multiple calls into a single pre-authorized call to the cow-shed factory.
   *
   * This single call will create the cow-shed account if it doesn't exist yet, then will execute the calls.
   *
   * @returns pre-authorized multicall details
   */
  async signCalls({
    calls,
    signer: signerParam,
    chainId,
    nonce = CowShedSdk.getNonce(),
    deadline = NON_EXPIRING_DEADLINE,
    defaultGasLimit,
    signingScheme = SigningScheme.EIP712,
  }: SignAndEncodeTxArgs): Promise<CowShedCall> {
    // Get the cow-shed for the wallet
    const cowShedHooks = CowShedSdk.getCowShedHooks(chainId)

    // Get the signer, or throw an error if not provided
    const signerLike = signerParam || this.options?.signer
    if (!signerLike) {
      throw new Error('Signer is required')
    }
    const signer = getSigner(signerLike)
    const ownerAddress = await signer.getAddress()

    const cowShedAccount = cowShedHooks.proxyOf(ownerAddress)

    // Sign the calls using cow-shed's owner
    const signature = await cowShedHooks.signCalls(calls, nonce, deadline, signer, signingScheme)

    //  Get the signed transaction's calldata
    const callData = cowShedHooks.encodeExecuteHooksForFactory(calls, nonce, deadline, ownerAddress, signature)

    // Estimate the gas limit for the transaction
    const cowShedFactoryAddress = cowShedHooks.getFactoryAddress()
    const factoryCall = {
      to: cowShedFactoryAddress,
      data: callData,
      value: BigInt(0),
    }
    const gasEstimate = await signer.estimateGas(factoryCall).catch((error) => {
      console.error(
        'Error estimating gas for the cow-shed call: ' +
          JSON.stringify({ ...factoryCall, value: factoryCall.value.toString() }),
        error
      )

      // Return the default gas limit if provided
      if (defaultGasLimit) {
        return defaultGasLimit
      }

      // Re-throw the error if no default gas limit is provided
      throw error
    })

    // Return the details, including the signed transaction data
    return {
      cowShedAccount,
      signedMulticall: factoryCall,
      gasLimit: gasEstimate.toBigInt(),
    }
  }

  protected static getCowShedHooks(chainId: SupportedChainId, customOptions?: ICoWShedOptions) {
    let cowShedHooks = CowShedSdk.COW_SHED_CACHE.get(chainId)

    if (cowShedHooks) {
      // Return cached cow-shed hooks
      return cowShedHooks
    }

    // Create new cow-shed hooks and cache it
    cowShedHooks = new CowShedHooks(chainId, customOptions)
    CowShedSdk.COW_SHED_CACHE.set(chainId, cowShedHooks)
    return cowShedHooks
  }

  protected static getNonce(): string {
    return ethers.utils.formatBytes32String(Date.now().toString())
  }
}
