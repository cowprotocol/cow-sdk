import prompts from 'prompts'
import yargs from 'yargs'
import { createOrderSchema, operationSchema } from './schemas'
import { signOrderOperation } from './operations/signOrder'
import { sendOrderOperation } from './operations/sendOrder'
import { cancelOrderOperation } from './operations/cancelOrder'

const allSchemas = [createOrderSchema, operationSchema]

export interface OperationParams {
  operation: string
}

yargs.parserConfiguration({
  'parse-numbers': false,
})
;(async () => {
  const argvKeys = Object.keys(yargs.argv)
  const isRunningWithArgv = allSchemas.some((schema) => {
    return schema.map((i) => i.name as string).every((param) => argvKeys.includes(param))
  })

  prompts.override(yargs.argv)

  const operationResult = (await prompts(operationSchema)) as OperationParams

  try {
    switch (operationResult.operation) {
      // getProfileData
      // getTrades
      // getOrders
      // getOrder
      case 'signOrder':
        await signOrderOperation(isRunningWithArgv)
        break
      case 'sendOrder':
        await sendOrderOperation(isRunningWithArgv)
        break
      case 'cancelOrder':
        await cancelOrderOperation(isRunningWithArgv)
        break
      default:
        console.log('Unknown operation: ', operationResult.operation)
        break
    }
  } catch (e) {
    console.log(e instanceof Error ? e.message : e)
  }
})()
