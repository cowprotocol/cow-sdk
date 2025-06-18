import { SupportedChainId, EvmCall } from '@cowprotocol/sdk-config'
import { CowShedHooks } from './contracts/CoWShedHooks'
import {
  ContractsEcdsaSigningScheme as EcdsaSigningScheme,
  ContractsSigningScheme as SigningScheme,
} from '@cowprotocol/sdk-contracts-ts'
import { ICoWShedCall, ICoWShedOptions } from './types'

import {
  log,
  MAX_UINT256 as NON_EXPIRING_DEADLINE,
  jsonWithBigintReplacer,
  getGlobalAdapter,
  AbstractProviderAdapter,
  setGlobalAdapter,
  SignerLike,
  AbstractSigner,
} from '@cowprotocol/sdk-common'

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
  defaultGasLimit?: bigint

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
   * Adapter for the cow-shed.
   */
  adapter: AbstractProviderAdapter

  /**
   * Custom options for the cow-shed hooks.
   */
  factoryOptions?: ICoWShedOptions
}

export class CowShedSdk {
  protected hooksCache = new Map<SupportedChainId, CowShedHooks>()

  constructor(
    adapter: AbstractProviderAdapter,
    private factoryOptions?: ICoWShedOptions,
  ) {
    setGlobalAdapter(adapter)
  }

  getCowShedAccount(chainId: SupportedChainId, ownerAddress: string): string {
    const cowShedHooks = this.getCowShedHooks(chainId, this.factoryOptions)
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
    const cowShedHooks = this.getCowShedHooks(chainId)
    const adapter = getGlobalAdapter()

    const signer: AbstractSigner = new adapter.Signer(signerParam)

    const ownerAddress = await signer.getAddress()

    const cowShedAccount = cowShedHooks.proxyOf(ownerAddress)
    // Sign the calls using cow-shed's owner
    const signature = await cowShedHooks.signCalls(calls, nonce, deadline, signer, signingScheme)

    // Get the signed transaction's calldata
    const callData = cowShedHooks.encodeExecuteHooksForFactory(calls, nonce, deadline, ownerAddress, signature)

    // Estimate the gas limit for the transaction
    const cowShedFactoryAddress = cowShedHooks.getFactoryAddress()
    const factoryCall = {
      to: cowShedFactoryAddress,
      data: callData,
      value: BigInt(0),
    }

    const gasEstimate = await signer.estimateGas(factoryCall).catch((error) => {
      const factoryCallString = JSON.stringify(factoryCall, jsonWithBigintReplacer, 2)
      const errorMessage = `Error estimating gas for the cow-shed call: ${factoryCallString}. Review the factory call`

      // Return the default gas limit if provided
      if (defaultGasLimit) {
        log(`${errorMessage}, using the default gas limit.`)
        return defaultGasLimit
      }

      // Re-throw the error if no default gas limit is provided
      throw new Error(`${errorMessage}, or provide the defaultGasLimit parameter.`, { cause: error })
    })

    // Return the details, including the signed transaction data
    return {
      cowShedAccount,
      signedMulticall: factoryCall,
      gasLimit: gasEstimate,
    }
  }

  protected getCowShedHooks(chainId: SupportedChainId, customOptions?: ICoWShedOptions) {
    let cowShedHooks = this.hooksCache.get(chainId)

    if (cowShedHooks) {
      // Return cached cow-shed hooks
      return cowShedHooks
    }

    // Create new cow-shed hooks and cache it
    const adapter = getGlobalAdapter()
    cowShedHooks = new CowShedHooks(adapter, chainId, customOptions)
    this.hooksCache.set(chainId, cowShedHooks)
    return cowShedHooks
  }

  protected static getNonce(): string {
    const adapter = getGlobalAdapter()
    return adapter.utils.formatBytes32String(Date.now().toString())
  }
}
