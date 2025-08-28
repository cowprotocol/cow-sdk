import { ValidateFunction } from 'ajv'

export function buildAssertValidFn(validator: ValidateFunction, doc: any) {
  return () => {
    // when
    const actual = validator(doc)
    // then
    expect(validator.errors).toBeFalsy()
    expect(actual).toBeTruthy()
  }
}

export function buildAssertInvalidFn(validator: ValidateFunction, doc: any, errors: any) {
  return () => {
    // when
    const actual = validator(doc)
    // then
    expect(actual).toBeFalsy()
    expect(validator.errors).toEqual(errors)
  }
}
