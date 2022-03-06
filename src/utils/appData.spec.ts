import { validateAppDataDocument, decodeAppData, decodeMultihash } from './appData'

const VALID_RESULT = {
  result: true,
}

const INVALID_MULTIHASH_LENGTH = 'multihash length inconsistent'

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

test('Valid AppData decode', async () => {
  const appData = await decodeAppData('0xa6c81f4ca727252a05b108f1742a07430f28d474d2a3492d8f325746824d22e5')
  const validation = await validateAppDataDocument(appData)
  expect(validation).toEqual(VALID_RESULT)
})

test('Invalid: AppData decode incorrect hash length', async () => {
  try {
    await decodeAppData('0xa6c81f4ca727252a05b108f1742a07430f28d474d2a3492d8f325746824d22e522')
  } catch (e: any) {
    expect(e.message).toEqual(expect.stringContaining(INVALID_MULTIHASH_LENGTH))
  }
})

test('Valid decode multihash digest', () => {
  const decodedHash = decodeMultihash('QmUf2TrpSANVXdgcYfAAACe6kg551cY3rAemB7xfEMjYvs')
  expect(decodedHash).toEqual('0x5ddb2c8207c10b96fac92cb934ef9ba004bc007a073c9e5b13edc422f209ed80')
})

test('Invalid: multihash incorrect length', () => {
  try {
    decodeMultihash('QmUf2TrpSANVXdgcYfAA')
  } catch (e: any) {
    expect(e.message).toEqual(expect.stringContaining(INVALID_MULTIHASH_LENGTH))
  }
})
