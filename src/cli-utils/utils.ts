import CowSdk from '../CowSdk'
import { OrderCreation, UnsignedOrder } from '../utils/sign'
import { Wallet } from '@ethersproject/wallet'
import { CommonOperationParams, SignOrderOperationParams } from './types'

const cliCowSdkCache: { [key: string]: CowSdk } = {}
export function getCliCowSdk(params: CommonOperationParams): CowSdk {
  const cacheKey = JSON.stringify(params)

  if (!cliCowSdkCache[cacheKey]) {
    const signer = new Wallet(params.privateKey)

    cliCowSdkCache[cacheKey] = new CowSdk(+params.chainId, { signer })
  }

  return cliCowSdkCache[cacheKey]
}

export async function generateOrder(
  cowSdk: CowSdk,
  creatingParams: SignOrderOperationParams
): Promise<Omit<OrderCreation, 'appData'>> {
  const order: Omit<UnsignedOrder, 'appData'> = {
    sellToken: creatingParams.sellToken,
    buyToken: creatingParams.buyToken,
    receiver: creatingParams.receiver || (await cowSdk.context.signer?.getAddress()) || '',
    sellAmount: creatingParams.sellAmount,
    buyAmount: creatingParams.buyAmount,
    validTo: Math.round(Date.now() / 1000) + parseInt(creatingParams.expiresIn),
    feeAmount: creatingParams.feeAmount,
    kind: creatingParams.kind,
    partiallyFillable: creatingParams.partiallyFillable === 'true',
  }

  const { signature, signingScheme } = await cowSdk.signOrder(order)

  if (!signature) throw new Error('Invalid order signature: ' + signature)

  return {
    ...order,
    signature,
    signingScheme,
  }
}
