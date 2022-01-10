import Ajv, { ErrorObject, ValidateFunction } from 'ajv'

let validate: ValidateFunction | undefined
let ajv: Ajv

interface ValidationResult {
  result: boolean
  errors?: ErrorObject[]
}

async function getValidator(): Promise<{ ajv: Ajv; validate: ValidateFunction }> {
  if (!ajv) {
    ajv = new Ajv()
  }

  if (!validate) {
    const appDataSchema = await import('../schemas/appData.schema.json')
    validate = ajv.compile(appDataSchema)
  }

  return { ajv, validate }
}

export async function validateAppDataDocument(appDataDocument: any): Promise<ValidationResult> {
  const { ajv, validate } = await getValidator()
  const result = !!(await validate(appDataDocument))

  return {
    result,
    errors: ajv.errors ?? undefined,
  }
}
