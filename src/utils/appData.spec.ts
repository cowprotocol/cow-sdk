import { validateAppDataDocument } from './appData'

const VALID_RESULT = {
  result: true,
}

test('Valid minimal document', async () => {
  const validation = await validateAppDataDocument({
    version: '0.1.0',
    metadata: {},
  })
  expect(validation).toEqual(VALID_RESULT)
})

test('Valid minimal document + appCode', async () => {
  const validation = await validateAppDataDocument({
    version: '0.1.0',
    appCode: 'MyApp',
    metadata: {},
  })
  expect(validation).toEqual(VALID_RESULT)
})

test('Valid minimal document + appCode + referrer', async () => {
  const validation = await validateAppDataDocument({
    version: '0.1.0',
    appCode: 'MyApp',
    metadata: {
      referrer: {
        version: '0.1.0',
        address: '0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52',
      },
    },
  })
  expect(validation).toEqual(VALID_RESULT)
})

test('Invalid: Bad referrer', async () => {
  const validation = await validateAppDataDocument({
    version: '0.1.0',
    appCode: 'MyApp',
    metadata: {
      referrer: {
        version: '0.1.0',
        address: 'this is not an ethereum address',
      },
    },
  })
  expect(validation.result).toBeFalsy()
})

test('Invalid: No version', async () => {
  const validation = await validateAppDataDocument({
    appCode: 'MyApp',
    metadata: {},
  })
  expect(validation.result).toBeFalsy()
})

test('Invalid: No metadata', async () => {
  const validation = await validateAppDataDocument({
    version: '0.1.0',
    appCode: 'MyApp',
  })
  expect(validation.result).toBeFalsy()
})
