import prompts from 'prompts'
import { createOrderSchema } from '../schemas'
import kleur from 'kleur'
import { generateOrder, getCliCowSdk } from '../utils'
import { SignOrderOperationParams } from '../types'

export async function signOrderOperation(isRunningWithArgv: boolean, params?: SignOrderOperationParams) {
  const creatingParams = params || ((await prompts(createOrderSchema)) as SignOrderOperationParams)

  const cowSdk = getCliCowSdk(creatingParams)
  const newOrder = await generateOrder(cowSdk, creatingParams)

  if (isRunningWithArgv) {
    console.log(JSON.stringify(newOrder))
    return
  }

  console.log(kleur.green().bold('New order: '))
  console.log(kleur.white().underline(JSON.stringify(newOrder, null, 4)))
}
