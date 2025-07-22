import {
  EcdsaSigningScheme,
  hashTypedData,
  isTypedDataSigner,
  SigningScheme,
  TypedDataTypes,
} from '@cowprotocol/contracts'
import { SupportedChainId } from '../../chains'
import type { Signer, TypedDataDomain } from '@ethersproject/abstract-signer'

import {
  arrayify,
  defaultAbiCoder,
  getCreate2Address,
  joinSignature,
  solidityKeccak256,
  splitSignature,
} from 'ethers/lib/utils'
import { COW_SHED_FACTORY, COW_SHED_IMPLEMENTATION, COW_SHED_VERSION } from '../../common'
import { getCoWShedFactoryInterface } from './utils'

import { ICoWShedCall, ICoWShedOptions } from '../types'

export const COW_SHED_PROXY_INIT_CODE =
  '0x60a03461009557601f61033d38819003918201601f19168301916001600160401b0383118484101761009957808492604094855283398101031261009557610052602061004b836100ad565b92016100ad565b6080527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5560405161027b90816100c28239608051818181608b01526101750152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b03821682036100955756fe60806040526004361015610018575b3661019757610197565b5f3560e01c8063025b22bc146100375763f851a4400361000e57610116565b346101125760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101125760043573ffffffffffffffffffffffffffffffffffffffff81169081810361011257337f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff160361010d577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f80a2005b61023d565b5f80fd5b34610112575f7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261011257602061014e61016c565b73ffffffffffffffffffffffffffffffffffffffff60405191168152f35b33300361010d577f000000000000000000000000000000000000000000000000000000000000000090565b60ff7f68df44b1011761f481358c0f49a711192727fb02c377d697bcb0ea8ff8393ac0541615806101f0575b1561023d577ff92ee8a9000000000000000000000000000000000000000000000000000000005f5260045ffd5b507f400ada75000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000005f351614156101c3565b5f807f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc54368280378136915af43d5f803e15610277573d5ff35b3d5ffd'

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
  public readonly version = COW_SHED_VERSION

  constructor(
    private chainId: SupportedChainId,
    private customOptions?: ICoWShedOptions,
  ) {}

  proxyOf(user: string) {
    const salt = defaultAbiCoder.encode(['address'], [user])
    const initCodeHash = solidityKeccak256(
      ['bytes', 'bytes'],
      [
        this.proxyCreationCode(),
        defaultAbiCoder.encode(['address', 'address'], [this.getImplementationAddress(), user]),
      ],
    )
    return getCreate2Address(this.getFactoryAddress(), salt, initCodeHash)
  }

  encodeExecuteHooksForFactory(
    calls: ICoWShedCall[],
    nonce: string,
    deadline: bigint,
    user: string,
    signature: string,
  ): string {
    return getCoWShedFactoryInterface().encodeFunctionData('executeHooks', [calls, nonce, deadline, user, signature])
  }

  async signCalls(
    calls: ICoWShedCall[],
    nonce: string,
    deadline: bigint,
    signer: Signer,
    signingScheme: EcdsaSigningScheme,
  ): Promise<string> {
    const user = await signer.getAddress()
    const proxy = this.proxyOf(user)

    const { domain, types, message } = this.infoToSign(calls, nonce, deadline, proxy)

    return await ecdsaSignTypedData(signingScheme, signer, domain, types, message)
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
      version: '1.0.0',
      chainId: this.chainId,
      verifyingContract: proxy,
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

// code copied from @cow/contract (not exported there)
async function ecdsaSignTypedData(
  scheme: EcdsaSigningScheme,
  owner: Signer,
  domain: TypedDataDomain,
  types: TypedDataTypes,
  data: Record<string, unknown>,
): Promise<string> {
  let signature: string | null = null

  switch (scheme) {
    case SigningScheme.EIP712:
      if (!isTypedDataSigner(owner)) {
        throw new Error('signer does not support signing typed data')
      }
      signature = await owner._signTypedData(domain, types, data)
      break
    case SigningScheme.ETHSIGN:
      signature = await owner.signMessage(arrayify(hashTypedData(domain, types, data)))
      break
    default:
      throw new Error('invalid signing scheme')
  }

  // Passing the signature through split/join to normalize the `v` byte.
  // Some wallets do not pad it with `27`, which causes a signature failure
  // `splitSignature` pads it if needed, and `joinSignature` simply puts it back together
  return joinSignature(splitSignature(signature))
}
