import prompts from 'prompts'
import { swapParametersSchema } from '../consts'
import { SwapParameters } from '../../types'
import kleur from 'kleur'
import { postSwapOrder } from '../../postSwapOrder'

export async function postSwapOrderAction(hasArgv: boolean) {
  const params = (await prompts(swapParametersSchema)) as SwapParameters

  const orderId = await postSwapOrder(params)

  if (hasArgv) {
    console.log(orderId)
    return
  }

  console.log(kleur.green().bold('Order id: '))
  console.log(kleur.white().underline(orderId))
}
