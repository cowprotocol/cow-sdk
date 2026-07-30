import * as v from 'valibot'

import { ProgrammaticOrderApiError } from './types'

export function parseInput<TSchema extends v.GenericSchema>(schema: TSchema, input: unknown): v.InferOutput<TSchema> {
  const result = v.safeParse(schema, input, { abortEarly: true })

  if (!result.success) {
    throw new ProgrammaticOrderApiError(result.issues[0]?.message ?? 'Invalid input')
  }

  return result.output
}
