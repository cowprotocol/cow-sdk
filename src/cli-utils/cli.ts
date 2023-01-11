import prompts from 'prompts'
import yargs from 'yargs'
import { operationSchema } from './schemas'
import { registry } from './registry'
import { CliOperations, CliOperationsKeys } from './types'

export interface OperationParams {
  operation: string
}

// To avoid converting hex string into number
yargs.parserConfiguration({
  'parse-numbers': false,
})
;(async () => {
  const argvKeys = Object.keys(yargs.argv)

  prompts.override(yargs.argv)

  const operationResult = (await prompts(operationSchema)) as OperationParams
  const cli = registry[CliOperations[operationResult.operation as CliOperationsKeys]]
  const isRunningWithArgv = cli.schema.map((i) => i.name as string).every((param) => argvKeys.includes(param))

  try {
    await cli.operation(isRunningWithArgv)
  } catch (e) {
    console.log(e instanceof Error ? e.message : e)
  }
})()
