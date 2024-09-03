import prompts from 'prompts'
import { limitParametersSchema } from '../consts'
import { LimitOrderParameters } from '../../types'
import kleur from 'kleur'
import { postLimitOrder } from '../../postLimitOrder'

export async function postLimitOrderAction(hasArgv: boolean) {
  const params = (await prompts(limitParametersSchema)) as LimitOrderParameters

  const orderId = await postLimitOrder(params)

  if (hasArgv) {
    console.log(orderId)
    return
  }

  console.log(kleur.green().bold('Order id: '))
  console.log(kleur.white().underline(orderId))
}
