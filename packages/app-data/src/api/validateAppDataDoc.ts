import type { default as AjvType, ValidateFunction } from 'ajv'
import { AnyValidateFunction } from 'ajv/dist/core'
import { ValidationResult } from '../types'

import { AnyAppDataDocVersion } from '../generatedTypes'
import { importSchema } from '../importSchema'

let _ajvPromise: Promise<AjvType> | undefined
let _validatorPromises: Record<string, Promise<AnyValidateFunction<unknown>> | undefined> = {}

async function getAjv(): Promise<AjvType> {
  if (!_ajvPromise) {
    _ajvPromise = import('ajv').then(({ default: Ajv }) => new Ajv())
  }

  return _ajvPromise
}

async function _createValidator(ajv: AjvType, version: string): Promise<AnyValidateFunction<unknown>> {
  let validator = ajv.getSchema(version)

  if (!validator) {
    const schema = await importSchema(version)
    ajv.addSchema(schema, version)
    validator = ajv.getSchema(version) as ValidateFunction
  }

  return validator
}

async function getValidator(ajv: AjvType, version: string): Promise<AnyValidateFunction<unknown>> {
  let validatorPromise = _validatorPromises[version]

  // Instantiate the validator for the current version if it doesn't exist yet
  if (!validatorPromise) {
    validatorPromise = _createValidator(ajv, version)
    _validatorPromises[version] = validatorPromise
  }

  return validatorPromise
}

export async function validateAppDataDoc(appDataDoc: AnyAppDataDocVersion): Promise<ValidationResult> {
  const { version } = appDataDoc

  try {
    const ajv = await getAjv()
    const validator = await getValidator(ajv, version)
    const success = !!validator(appDataDoc)
    const errors = validator.errors ? ajv.errorsText(validator.errors) : undefined

    return { success, errors }
  } catch (e) {
    if (e instanceof Error) {
      return {
        success: false,
        errors: e.message,
      }
    } else {
      throw e
    }
  }
}
