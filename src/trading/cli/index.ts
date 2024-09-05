import yargvParser from 'yargs-parser'
import prompts from 'prompts'
import { actionsSchema, swapParametersSchema } from './consts'
import { getQuoteAction } from './actions/getQuoteAction'
import { toggleLog } from '../consts'
import { postSwapOrderAction } from './actions/postSwapOrderAction'
import { postLimitOrderAction } from './actions/postLimitOrderAction'

const promptSchemas = [swapParametersSchema]

// IIFE
;(async () => {
  const argv = yargvParser(process.argv.slice(2), { configuration: { 'parse-numbers': false } })
  const argvKeys = Object.keys(argv)
  const hasArgv = promptSchemas.some((schema) =>
    schema.map((i) => i.name as string).every((param) => argvKeys.includes(param))
  )

  prompts.override(argv)

  if (hasArgv) {
    toggleLog(false)
  }

  const actionsResult = await prompts(actionsSchema)

  switch (actionsResult.action) {
    case 'getQuote':
      await getQuoteAction(hasArgv)
      break
    case 'postSwapOrder':
      await postSwapOrderAction(hasArgv)
      break
    case 'postLimitOrder':
      await postLimitOrderAction(hasArgv)
      break
    default:
      console.log('Unknown action: ', actionsResult.action)
      break
  }
})()
