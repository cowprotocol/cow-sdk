import prompts from 'prompts'
import { createOrderSchema } from '../schemas'
import CowSdk from '../../CowSdk'
import { Wallet } from '@ethersproject/wallet'
import { OrderKind } from '@cowprotocol/contracts'
import kleur from 'kleur'
import { generateOrder } from '../utils'

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

export async function createOrderOperation(isRunningWithArgv: boolean, params?: CreatingParams) {
  const creatingParams = params || ((await prompts(createOrderSchema)) as CreatingParams)

  const signer = new Wallet(creatingParams.privateKey)
  const cowSdk = new CowSdk(+creatingParams.chainId, { signer })

  const newOrder = await generateOrder(cowSdk, creatingParams)

  if (isRunningWithArgv) {
    console.log(JSON.stringify(newOrder))
    return newOrder
  }

  console.log(kleur.green().bold('New order: '))
  console.log(kleur.white().underline(JSON.stringify(newOrder, null, 4)))
}
