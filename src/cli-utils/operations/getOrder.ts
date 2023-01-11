import prompts from 'prompts'
import { getOrderSchema } from '../schemas'
import kleur from 'kleur'
import { CowApi } from '../../api'
import { Context } from '../../utils/context'

export interface GetOrderOperationParams {
  chainId: string
  orderUid: string
}

export async function getOrderOperation(isRunningWithArgv: boolean, params?: GetOrderOperationParams) {
  const getOrderParams = params || ((await prompts(getOrderSchema)) as GetOrderOperationParams)

  const { orderUid, chainId } = getOrderParams
  const cowApi = new CowApi(new Context(+chainId, {}))

  const order = await cowApi.getOrder(orderUid)

  if (isRunningWithArgv) {
    console.log(JSON.stringify(order))
    return
  }

  console.log(kleur.green().bold('Order: '))
  console.log(kleur.white().underline(JSON.stringify(order)))
}
