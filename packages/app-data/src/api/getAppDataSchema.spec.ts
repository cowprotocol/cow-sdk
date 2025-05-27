import { getAppDataSchema } from './getAppDataSchema'

describe('getAppDataSchema', () => {
  test('Returns existing schema', async () => {
    // given
    const version = '0.4.0'
    // when
    const schema = await getAppDataSchema(version)
    // then
    // @ts-ignore
    expect(schema.$id).toMatch(version)
  })

  test('Throws on invalid schema', async () => {
    // given
    const version = '0.0.0'
    // when
    const promise = getAppDataSchema(version)
    // then
    await expect(promise).rejects.toThrow(`AppData version ${version} doesn't exist`)
  })

  test('Non-existent version throws', async () => {
    // given
    const version = '0.0.0'
    // when
    const schemaPromise = getAppDataSchema(version)
    // then
    await expect(schemaPromise).rejects.toThrow(`AppData version ${version} doesn't exist`)
  })

  test('Non-semver version throws', async () => {
    // given
    const version = 'not semver'
    // when
    const schemaPromise = getAppDataSchema(version)
    // then
    await expect(schemaPromise).rejects.toThrow(`AppData version ${version} is not a valid version`)
  })

  test('Version 0.1.0', _buildAssertVersionFn('0.1.0'))
  test('Version 0.2.0', _buildAssertVersionFn('0.2.0'))
  test('Version 0.3.0', _buildAssertVersionFn('0.3.0'))
  test('Version 0.4.0', _buildAssertVersionFn('0.4.0'))
})

function _buildAssertVersionFn(version: string) {
  return async () => {
    // when
    const schema = await getAppDataSchema(version)
    // then
    // @ts-ignore
    expect(schema.$id).toMatch(version)
  }
}
