import { ContractsEcdsaSigningScheme as EcdsaSigningScheme, ecdsaSignTypedData } from '@cowprotocol/sdk-contracts-ts'
import { SupportedChainId } from '@cowprotocol/sdk-config'

import {
  getGlobalAdapter,
  setGlobalAdapter,
  AbstractProviderAdapter,
  SignerLike,
  TypedDataDomain,
} from '@cowprotocol/sdk-common'
import { CowShedFactoryAbi } from '../abi/CowShedFactoryAbi'
import { ICoWShedCall, ICoWShedOptions } from '../types'
import {
  COW_SHED_FACTORY,
  COW_SHED_IMPLEMENTATION,
  COW_SHED_LATEST_VERSION,
  COW_SHED_PROXY_INIT_CODE,
  CoWShedVersion,
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

    const { domain, types, message } = this.infoToSign(calls, nonce, deadline, proxy)

    return await ecdsaSignTypedData(signingScheme, domain, types, message, signer)
  }

  infoToSign(calls: ICoWShedCall[], nonce: string, deadline: bigint, proxy: string) {
    const message = {
      calls,
      nonce,
      deadline,
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
