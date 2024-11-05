import {
  arrayify,
  defaultAbiCoder,
  getCreate2Address,
  joinSignature,
  solidityKeccak256,
  splitSignature,
} from 'ethers/lib/utils'
import { COW_SHED_FACTORY, COW_SHED_IMPLEMENTATION, SupportedChainId } from 'src/common'
import { COW_SHED_712_TYPES, ICoWShedCall, ICoWShedOptions } from './types'
import { COW_SHED_PROXY_INIT_CODE } from './proxyInitCode'
import type { Signer } from '@ethersproject/abstract-signer'
import { getCoWShedFactoryInterface } from './contracts'
import { TypedDataDomain } from 'ethers'
import {
  EcdsaSigningScheme,
  hashTypedData,
  isTypedDataSigner,
  SigningScheme,
  TypedDataTypes,
} from '@cowprotocol/contracts'

export class CowShedHooks {
  constructor(private chainId: SupportedChainId, private customOptions?: ICoWShedOptions) {}

  proxyOf(user: string) {
    const salt = defaultAbiCoder.encode(['address'], [user])
    const initCodeHash = solidityKeccak256(
      ['bytes', 'bytes'],
      [
        this.proxyCreationCode(),
        defaultAbiCoder.encode(['address', 'address'], [this.getImplementationAddress(), user]),
      ]
    )
    return getCreate2Address(this.getFactoryAddress(), salt, initCodeHash)
  }

  encodeExecuteHooksForFactory(
    calls: ICoWShedCall[],
    nonce: string,
    deadline: bigint,
    user: string,
    signature: string
  ): string {
    return getCoWShedFactoryInterface().encodeFunctionData('executeHooks', [calls, nonce, deadline, user, signature])
  }

  async signCalls(
    calls: ICoWShedCall[],
    nonce: string,
    deadline: bigint,
    signer: Signer,
    signingScheme: EcdsaSigningScheme
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
  data: Record<string, unknown>
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
