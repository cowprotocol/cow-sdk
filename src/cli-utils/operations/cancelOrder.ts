import prompts from 'prompts'
import { cancelOrderSchema } from '../schemas'
import kleur from 'kleur'
import { CommonOperationParams } from '../types'
import { getCliCowSdk } from '../utils'
import { OrderCancellationParams } from '../../api/cow/types'

export interface CancelOrderOperationParams extends CommonOperationParams {
  orderUid: string
}

export async function cancelOrderOperation(isRunningWithArgv: boolean, params?: CancelOrderOperationParams) {
  const cancelingParams = params || ((await prompts(cancelOrderSchema)) as CancelOrderOperationParams)

  const { orderUid } = cancelingParams
  const cowSdk = getCliCowSdk(cancelingParams)
  const owner = (await cowSdk.context.signer?.getAddress()) || ''
  const signatureData = await cowSdk.signOrderCancellation(orderUid)

  if (!signatureData.signature) {
    throw new Error('Cannot sign order cancellation')
  }

  const request: OrderCancellationParams = {
    chainId: +cancelingParams.chainId,
    owner,
    cancellation: {
      signature: signatureData.signature,
      signingScheme: signatureData.signingScheme,
      orderUid,
    },
  }

  await cowSdk.cowApi.sendSignedOrderCancellation(request)

  if (isRunningWithArgv) {
    console.log(orderUid)
    return
  }

  console.log(kleur.green().bold('Order canceled: '))
  console.log(kleur.white().underline(orderUid))
}
