import prompts from 'prompts'
import yargs from 'yargs'
import { createOrderSchema, operationSchema } from './schemas'
import { createOrderOperation } from './operations/create'
import { sendOrderOperation } from './operations/send'

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

  switch (operationResult.operation) {
    case 'create':
      await createOrderOperation(isRunningWithArgv)
    case 'send':
      await sendOrderOperation(isRunningWithArgv)
      break
    default:
      console.log('Unknown operation: ', operationResult.operation)
      break
  }
})()
