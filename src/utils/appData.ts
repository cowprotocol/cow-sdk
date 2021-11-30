import Ajv from 'ajv'

let validate: Ajv.ValidateFunction | undefined
let ajv: Ajv.Ajv

interface ValidationResult {
  result: boolean,
  errors?: Ajv.ErrorObject[]
}

async function getValidator(): Promise<{ ajv: Ajv.Ajv, validate: Ajv.ValidateFunction }> {  
  if (!ajv) {
    ajv = new Ajv()  
  }

  if (!validate) {
    const appDataSchema = await import('../schemas/appData.schema.json');
    validate = ajv.compile(appDataSchema)
  }
  

  return { ajv, validate }
}

export async function validateAppDataDocument(appDataDocument: any): Promise<ValidationResult>{
  const { ajv, validate } = await getValidator()
  const result = !!(await validate(appDataDocument))


  return {
    result,
    errors: ajv.errors ?? undefined
  }
}