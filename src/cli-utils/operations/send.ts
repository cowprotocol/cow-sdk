import prompts from 'prompts'
import { createOrderSchema } from '../schemas'
import CowSdk from '../../CowSdk'
import { Wallet } from '@ethersproject/wallet'
import { OrderKind } from '@cowprotocol/contracts'
import { createOrderOperation } from './create'
import kleur from 'kleur'

export interface CreatingParams {
  chainId: string
  privateKey: string
  account: string
  expiresIn: string
  kind: OrderKind
  partiallyFillable: string
  sellToken: string
  buyToken: string
  feeAmount: string
  sellAmount: string
  buyAmount: string
  receiver?: string
}

export async function sendOrderOperation(isRunningWithArgv: boolean, params?: CreatingParams) {
  const creatingParams = params || ((await prompts(createOrderSchema)) as CreatingParams)

  const signer = new Wallet(creatingParams.privateKey)
  const cowSdk = new CowSdk(+creatingParams.chainId, { signer })
  const owner = signer.address
  const order = await createOrderOperation(true, creatingParams)

  if (!order) throw new Error('Order creation error')

  const orderId = await cowSdk.cowApi.sendOrder({ order, owner })

  if (isRunningWithArgv) {
    console.log(orderId)
    return orderId
  }

  console.log(kleur.green().bold('New order id: '))
  console.log(kleur.white().underline(orderId))
}
