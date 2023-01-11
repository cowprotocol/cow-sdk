import prompts from 'prompts'
import { createOrderSchema } from '../schemas'
import kleur from 'kleur'
import { SignOrderOperationParams } from '../types'
import { generateOrder, getCliCowSdk } from '../utils'

export async function sendOrderOperation(isRunningWithArgv: boolean, params?: SignOrderOperationParams) {
  const creatingParams = params || ((await prompts(createOrderSchema)) as SignOrderOperationParams)

  const cowSdk = getCliCowSdk(creatingParams)
  const owner = (await cowSdk.context.signer?.getAddress()) || ''
  const order = await generateOrder(cowSdk, creatingParams)
  const orderId = await cowSdk.cowApi.sendOrder({ order, owner })

  if (isRunningWithArgv) {
    console.log(orderId)
    return
  }

  console.log(kleur.green().bold('New order id: '))
  console.log(kleur.white().underline(orderId))
}
