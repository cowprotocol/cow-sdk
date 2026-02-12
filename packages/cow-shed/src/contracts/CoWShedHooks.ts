import {
  ContractsEcdsaSigningScheme as EcdsaSigningScheme,
  ContractsSigningScheme,
  ecdsaSignTypedData,
  EIP1271_MAGICVALUE,
} from '@cowprotocol/sdk-contracts-ts'
import { SupportedEvmChainId } from '@cowprotocol/sdk-config'

import {
  AbstractProviderAdapter,
  getGlobalAdapter,
  setGlobalAdapter,
  SignerLike,
  TTLCache,
  TypedDataContext,
  TypedDataDomain,
} from '@cowprotocol/sdk-common'
import { CowShedFactoryAbi } from '../abi/CowShedFactoryAbi'
import { ICoWShedCall, ICoWShedOptions } from '../types'
import {
  COW_SHED_FACTORY,
  COW_SHED_IMPLEMENTATION,
  COW_SHED_LATEST_VERSION,
  COW_SHED_PROXY_INIT_CODE,
  CoWShedEip1271SignatureInvalid,
  CoWShedVersion,
  EIP1271_VALID_SIGNATURE_ABI,
} from '../const'

export const COW_SHED_712_TYPES = {
  ExecuteHooks: [
    { type: 'Call[]', name: 'calls' },
    { type: 'bytes32', name: 'nonce' },
    { type: 'uint256', name: 'deadline' },
  ],
  Call: [
    { type: 'address', name: 'target' },
    { type: 'uint256', name: 'value' },
    { type: 'bytes', name: 'callData' },
    { type: 'bool', name: 'allowFailure' },
    { type: 'bool', name: 'isDelegateCall' },
  ],
}

const FIVE_MINUTES = 5 * 60 * 1000

export class CowShedHooks {
  private eip1271SignatureCache: TTLCache<boolean>
  private accountCodeCache: TTLCache<boolean>

  constructor(
    private chainId: SupportedEvmChainId,
    private customOptions?: ICoWShedOptions,
    public readonly version: CoWShedVersion = COW_SHED_LATEST_VERSION,
    adapter?: AbstractProviderAdapter,
  ) {
    if (adapter) {
      setGlobalAdapter(adapter)
    }

    // Initialize caches with 5-minute TTL (300000ms)
    this.eip1271SignatureCache = new TTLCache<boolean>('cowshed-eip1271-signature', true, FIVE_MINUTES)
    this.accountCodeCache = new TTLCache<boolean>('cowshed-account-code', true, FIVE_MINUTES)
  }

  proxyOf(user: string) {
    const adapter = getGlobalAdapter()
    const salt = adapter.utils.encodeAbi(['address'], [user])
    const initCodeHash = adapter.utils.solidityKeccak256(
      ['bytes', 'bytes'],
      [
        this.proxyCreationCode(),
        adapter.utils.encodeAbi(['address', 'address'], [this.getImplementationAddress(), user]),
      ],
    )
    return adapter.utils.getCreate2Address(this.getFactoryAddress(), salt, initCodeHash)
  }

  encodeExecuteHooksForFactory(
    calls: ICoWShedCall[],
    nonce: string,
    deadline: bigint,
    ownerAddress: string,
    signature: string,
  ): string {
    const adapter = getGlobalAdapter()
    return adapter.utils.encodeFunction(CowShedFactoryAbi, 'executeHooks', [
      calls,
      nonce,
      deadline,
      ownerAddress,
      signature,
    ]) as string
  }

  /**
   * @throws CoWShedEip1271SignatureInvalid
   */
  async signCalls(
    calls: ICoWShedCall[],
    nonce: string,
    deadline: bigint,
    signingScheme: EcdsaSigningScheme,
    owner?: SignerLike,
  ): Promise<string> {
    const adapter = getGlobalAdapter()
    const signer = owner ? adapter.createSigner(owner) : adapter.signer

    const user = await signer.getAddress()
    const proxy = this.proxyOf(user)

    const typedDataContext = this.infoToSign(calls, nonce, deadline, proxy)
    const { domain, types, message } = typedDataContext

    const signature = await ecdsaSignTypedData(signingScheme, domain, types, message, signer)

    const isAccountSmartContract = await this.doesAccountHaveCode(user)
    const shouldValidateEip1271Signature = isAccountSmartContract && signingScheme === ContractsSigningScheme.EIP712

    if (shouldValidateEip1271Signature) {
      const isEip1271SignatureValid = await this.verifyEip1271Signature(user, signature, typedDataContext)

      if (!isEip1271SignatureValid) {
        throw new CoWShedEip1271SignatureInvalid('EIP1271 signature is invalid for CoW Shed')
      }
    }

    return signature
  }

  /**
   * Verifies EIP1271 signature
   * It will return true only when isValidSignature() returns EIP1271_MAGICVALUE
   */
  async verifyEip1271Signature(
    account: string,
    signature: string,
    typedDataContext: TypedDataContext,
  ): Promise<boolean> {
    const adapter = getGlobalAdapter()

    const { domain, types, message } = typedDataContext

    const hash = adapter.utils.hashTypedData(domain, types, message)

    // Check cache first
    const cacheKey = `${account}:${signature}:${hash}`
    const cachedResult = this.eip1271SignatureCache.get(cacheKey)
    if (cachedResult !== undefined) {
      return cachedResult
    }

    try {
      const result = await adapter.readContract({
        address: account,
        abi: EIP1271_VALID_SIGNATURE_ABI,
        functionName: 'isValidSignature',
        args: [hash, signature],
      })

      const isValid = result === EIP1271_MAGICVALUE

      // Store result in cache
      this.eip1271SignatureCache.set(cacheKey, isValid)

      return isValid
    } catch (error) {
      console.error('CoWShedHooks.verifyEip1271Signature', error)

      return false
    }
  }

  infoToSign(calls: ICoWShedCall[], nonce: string, deadline: bigint, proxy: string): TypedDataContext {
    const message = {
      calls,
      nonce,
      deadline: deadline.toString(),
    }
    return { domain: this.getDomain(proxy), types: COW_SHED_712_TYPES, message }
  }

  getDomain(proxy: string): TypedDataDomain {
    return {
      name: 'COWShed',
      version: this.version,
      chainId: this.chainId,
      verifyingContract: proxy,
    }
  }

  proxyCreationCode() {
    return this.customOptions?.proxyCreationCode ?? COW_SHED_PROXY_INIT_CODE[this.version]
  }

  getFactoryAddress() {
    return this.customOptions?.factoryAddress ?? COW_SHED_FACTORY[this.version]
  }

  getImplementationAddress() {
    return this.customOptions?.implementationAddress ?? COW_SHED_IMPLEMENTATION[this.version]
  }

  private async doesAccountHaveCode(account: string): Promise<boolean> {
    // Check cache first
    const cachedResult = this.accountCodeCache.get(account)
    if (cachedResult !== undefined) {
      return cachedResult
    }

    const adapter = getGlobalAdapter()

    const userAccountCode = await adapter.getCode(account)

    const hasCode = !!userAccountCode && userAccountCode !== '0x'

    // Store result in cache
    this.accountCodeCache.set(account, hasCode)

    return hasCode
  }
}
