import { delay, objectToQueryString, withTimeout } from './common'

const TIMEOUT = 1000
test('Common: withTimeout errors properly', async () => {
  const promiseFn = async () => delay(2000, 'SUCCESS!')
  const wrappedFn = withTimeout(promiseFn(), TIMEOUT, 'WITHTIMEOUT CONTEXT')

  await expect(wrappedFn).rejects.toThrow(new Error('WITHTIMEOUT CONTEXT. Timeout after 1000 ms'))
})
test('Common: objectQueryToString returns empty string when no object', async () => {
  // GIVEN
  const object = undefined

  // @ts-expect-error - testing
  expect(objectToQueryString(object)).toEqual('')
})
