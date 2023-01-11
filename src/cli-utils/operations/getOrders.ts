import prompts from 'prompts'
import { getOrdersSchema } from '../schemas'
import kleur from 'kleur'
import { CowApi } from '../../api'
import { Context } from '../../utils/context'
import { GetOrdersParams } from '../../api/cow/types'

export interface GetOrdersOperationParams extends GetOrdersParams {
  chainId: string
}

export async function getOrdersOperation(isRunningWithArgv: boolean, params?: GetOrdersOperationParams) {
  const getOrderParams = params || ((await prompts(getOrdersSchema)) as GetOrdersOperationParams)

  const { chainId } = getOrderParams
  const cowApi = new CowApi(new Context(+chainId, {}))

  const data = await cowApi.getOrders(getOrderParams)

  if (isRunningWithArgv) {
    console.log(JSON.stringify(data))
    return
  }

  console.log(kleur.green().bold('Orders: '))
  console.log(kleur.white().underline(JSON.stringify(data)))
}
