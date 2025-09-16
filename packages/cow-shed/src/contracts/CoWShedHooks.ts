import {
  ContractsEcdsaSigningScheme as EcdsaSigningScheme,
  ContractsSigningScheme,
  ecdsaSignTypedData,
  EIP1271_MAGICVALUE,
} from '@cowprotocol/sdk-contracts-ts'
import { SupportedChainId } from '@cowprotocol/sdk-config'

import {
  getGlobalAdapter,
  setGlobalAdapter,
  AbstractProviderAdapter,
  SignerLike,
  TypedDataDomain,
  TypedDataContext,
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

export class CowShedHooks {
  constructor(
    private chainId: SupportedChainId,
    private customOptions?: ICoWShedOptions,
    public readonly version: CoWShedVersion = COW_SHED_LATEST_VERSION,
    adapter?: AbstractProviderAdapter,
  ) {
    if (adapter) {
      setGlobalAdapter(adapter)
    }
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

    const isEip1271SignatureValid =
      signingScheme === ContractsSigningScheme.EIP712
        ? await this.verifyEip1271Signature(user, signature, typedDataContext)
        : true

    if (!isEip1271SignatureValid) {
      throw new CoWShedEip1271SignatureInvalid('EIP1271 signature is invalid for CoW Shed')
    }

    return signature
  }

  /**
   * Verifies Eip1271 signature taking EIP7702 accounts into account
   * If an account is not a smart-contract account it will return true
   * If an account is a smart-contract account,
   *  then it will return true only when isValidSignature() returns EIP1271_MAGICVALUE
   */
  async verifyEip1271Signature(
    account: string,
    signature: string,
    typedDataContext: TypedDataContext,
  ): Promise<boolean> {
    const adapter = getGlobalAdapter()

    const { domain, types, message } = typedDataContext
    const userAccountCode = await adapter.getCode(account)

    // Only verify signature if account is a smart-contract account
    if (userAccountCode && userAccountCode !== '0x') {
      const hash = adapter.utils.hashTypedData(domain, types, message)

      const result = await adapter.readContract({
        address: account,
        abi: EIP1271_VALID_SIGNATURE_ABI,
        functionName: 'isValidSignature',
        args: [hash, signature],
      })

      return result === EIP1271_MAGICVALUE
    }

    return true
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
}
