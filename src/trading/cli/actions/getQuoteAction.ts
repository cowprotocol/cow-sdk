import prompts from 'prompts'
import { swapParametersSchema } from '../consts'
import { SwapParameters } from '../../types'
import { getQuote } from '../../getQuote'
import kleur from 'kleur'
import { printJSON } from '../utils'

export async function getQuoteAction(hasArgv: boolean) {
  const params = (await prompts(swapParametersSchema)) as SwapParameters

  const quote = await getQuote(params)

  if (hasArgv) {
    console.log(printJSON(quote))
    return
  }

  console.log(kleur.green().bold('Quote: '))
  console.log(kleur.white().underline(printJSON(quote)))
}
