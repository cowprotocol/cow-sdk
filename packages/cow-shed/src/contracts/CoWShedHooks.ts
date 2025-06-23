import { ContractsEcdsaSigningScheme as EcdsaSigningScheme, ecdsaSignTypedData } from '@cowprotocol/sdk-contracts-ts'
import { SupportedChainId, COW_SHED_FACTORY, COW_SHED_IMPLEMENTATION } from '@cowprotocol/sdk-config'

import {
  getGlobalAdapter,
  setGlobalAdapter,
  AbstractProviderAdapter,
  SignerLike,
  TypedDataDomain,
} from '@cowprotocol/sdk-common'
import { CowShedFactoryAbi } from '../abi/CowShedFactoryAbi'
import { ICoWShedCall, ICoWShedOptions } from '../types'

export const COW_SHED_PROXY_INIT_CODE =
  '0x60a034608e57601f61037138819003918201601f19168301916001600160401b038311848410176093578084926040948552833981010312608e57604b602060458360a9565b920160a9565b6080527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc556040516102b490816100bd8239608051818181608f01526101720152f35b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b0382168203608e5756fe60806040526004361015610018575b3661019457610194565b6000803560e01c908163025b22bc1461003b575063f851a4400361000e5761010d565b3461010a5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261010a5773ffffffffffffffffffffffffffffffffffffffff60043581811691828203610106577f0000000000000000000000000000000000000000000000000000000000000000163314600014610101577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b8280a280f35b61023d565b8380fd5b80fd5b346101645760007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc360112610164576020610146610169565b73ffffffffffffffffffffffffffffffffffffffff60405191168152f35b600080fd5b333003610101577f000000000000000000000000000000000000000000000000000000000000000090565b60ff7f68df44b1011761f481358c0f49a711192727fb02c377d697bcb0ea8ff8393ac0541615806101ef575b1561023d5760046040517ff92ee8a9000000000000000000000000000000000000000000000000000000008152fd5b507f400ada75000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000006000351614156101c0565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc546000808092368280378136915af43d82803e1561027a573d90f35b3d90fdfea2646970667358221220c7c26ff3040b96a28e96d6d27b743972943aeaef81cc821544c5fe1e24f9b17264736f6c63430008190033'

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
    adapter: AbstractProviderAdapter,
    private chainId: SupportedChainId,
    private customOptions?: ICoWShedOptions,
  ) {
    setGlobalAdapter(adapter)
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
      calls: calls.map((call) => ({
        target: call.target.toLowerCase(),
        value: call.value,
        callData: call.callData,
        allowFailure: call.allowFailure,
        isDelegateCall: call.isDelegateCall,
      })),
      nonce,
      deadline: deadline.toString(),
    }

    return { domain: this.getDomain(proxy), types: COW_SHED_712_TYPES, message }
  }

  getDomain(proxy: string): TypedDataDomain {
    return {
      name: 'COWShed',
      version: '1.0.0',
      chainId: typeof this.chainId === 'bigint' ? Number(this.chainId) : this.chainId,
      verifyingContract: proxy.toLowerCase(),
    }
  }

  proxyCreationCode() {
    return this.customOptions?.proxyCreationCode ?? COW_SHED_PROXY_INIT_CODE
  }

  getFactoryAddress() {
    return this.customOptions?.factoryAddress ?? COW_SHED_FACTORY
  }

  getImplementationAddress() {
    return this.customOptions?.implementationAddress ?? COW_SHED_IMPLEMENTATION
  }
}
