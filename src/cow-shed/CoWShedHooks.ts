import {
  arrayify,
  defaultAbiCoder,
  getCreate2Address,
  joinSignature,
  solidityKeccak256,
  solidityPack,
  splitSignature,
} from 'ethers/lib/utils'
import { COW_SHED_FACTORY, COW_SHED_IMPLEMENTATION, SupportedChainId } from 'src/common'
import { COW_SHED_712_TYPES, ICoWShedCall } from './types'
import { COW_SHED_PROXY_INIT_CODE } from './proxyInitCode'
import type { Signer } from '@ethersproject/abstract-signer'
import { getCoWShedFactoryInterface, getCoWShedInterface } from './contracts'
import { TypedDataDomain } from 'ethers'
import {
  EcdsaSigningScheme,
  hashTypedData,
  isTypedDataSigner,
  SigningScheme,
  TypedDataTypes,
} from '@cowprotocol/contracts'

export class CowShedHooks {
  static computeProxyAddress(user: string) {
    const salt = defaultAbiCoder.encode(['address'], [user])
    const initCodeHash = solidityKeccak256(
      ['bytes', 'bytes'],
      [this.proxyCreationCode(), defaultAbiCoder.encode(['address', 'address'], [COW_SHED_IMPLEMENTATION, user])]
    )
    return getCreate2Address(COW_SHED_FACTORY, salt, initCodeHash)
  }

  static encodeExecuteHooksForFactory(
    calls: ICoWShedCall[],
    nonce: string,
    deadline: bigint,
    user: string,
    signature: string
  ) {
    // #TODO: fix ts error
    // eslint-disable-next-line
    // @ts-ignore
    return getCoWShedFactoryInterface().encodeFunctionData('executeHooks', [calls, nonce, deadline, user, signature])
  }
  static encodeExecuteHooksForProxy(calls: ICoWShedCall[], nonce: string, deadline: bigint, signature: string) {
    return getCoWShedInterface().encodeFunctionData('executeHooks', [calls, nonce, deadline, signature])
  }

  static async signCalls(
    calls: ICoWShedCall[],
    nonce: string,
    deadline: bigint,
    chainId: SupportedChainId,
    signer: Signer,
    signingScheme: EcdsaSigningScheme
  ) {
    const user = await signer.getAddress()
    const proxy = this.computeProxyAddress(user)

    const { domain, types, message } = this.infoToSign(calls, nonce, deadline, proxy, chainId)

    return await ecdsaSignTypedData(signingScheme, signer, domain, types, message)
  }

  static infoToSign(calls: ICoWShedCall[], nonce: string, deadline: bigint, proxy: string, chainId: SupportedChainId) {
    const message = {
      calls,
      nonce,
      deadline,
    }
    return { domain: this.getDomain(proxy, chainId), types: COW_SHED_712_TYPES, message }
  }

  static encodeEOASignature(signature: string) {
    const r = BigInt(signature.slice(0, 66))
    const s = BigInt(`0x${signature.slice(66, 130)}`)
    const v = parseInt(signature.slice(130, 132), 16)
    return solidityPack(['uint', 'uint', 'uint8'], [r, s, v])
  }

  static getDomain(proxy: string, chainId: SupportedChainId): TypedDataDomain {
    const domain: TypedDataDomain = {
      name: 'COWShed',
      version: '1.0.0',
      chainId: chainId,
      verifyingContract: proxy,
    }
    return domain
  }
  static proxyCreationCode() {
    return COW_SHED_PROXY_INIT_CODE
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
