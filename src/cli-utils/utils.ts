import CowSdk from '../CowSdk'
import { OrderCreation, UnsignedOrder } from '../utils/sign'
import { CreatingParams } from './operations/create'

export async function generateOrder(
  cowSdk: CowSdk,
  creatingParams: CreatingParams
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
