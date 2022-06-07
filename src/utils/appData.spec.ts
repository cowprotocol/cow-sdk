import fetchMock from 'jest-fetch-mock'
import { validateAppDataDocument, getSerializedCID, loadIpfsFromCid } from './appData'

const VALID_RESULT = {
  result: true,
}

const BASE_DOCUMENT = {
  version: '0.1.0',
  metadata: {},
}

const INVALID_CID_LENGTH = 'Incorrect length'

beforeEach(() => {
  fetchMock.dontMock()
})

test('Valid minimal document', async () => {
  const validation = await validateAppDataDocument(BASE_DOCUMENT)
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

test('Invalid: No metadata', async () => {
  const validation = await validateAppDataDocument({
    version: '0.1.0',
    appCode: 'MyApp',
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

test('Valid serialized appData CID', async () => {
  const hash = '0xa6c81f4ca727252a05b108f1742a07430f28d474d2a3492d8f325746824d22e5'
  const serializedCidV0 = 'QmZZhNnqMF1gRywNKnTPuZksX7rVjQgTT3TJAZ7R6VE3b2'
  const cidV0 = await getSerializedCID(hash)

  expect(cidV0).toEqual(serializedCidV0)
})

test('Invalid: serialized appData CID format ', async () => {
  const invalidHash = '0xa6c81f4ca727252a05b108f1742'
  try {
    await getSerializedCID(invalidHash)
  } catch (e: unknown) {
    const error = e as Error
    expect(error.message).toEqual(INVALID_CID_LENGTH)
  }
})

test('Valid IPFS appData from CID', async () => {
  const validSerializedCidV0 = 'QmZZhNnqMF1gRywNKnTPuZksX7rVjQgTT3TJAZ7R6VE3b2'
  const appDataDocument = await loadIpfsFromCid(validSerializedCidV0)
  const validation = await validateAppDataDocument(appDataDocument)

  expect(validation).toEqual(VALID_RESULT)
})

test('Valid: quote metadata - minimal', async () => {
  const document = { ...BASE_DOCUMENT, metadata: { quote: { sellAmount: '1', buyAmount: '1', version: '0.1.0' } } }
  const validation = await validateAppDataDocument(document)

  expect(validation).toEqual(VALID_RESULT)
})

test('Valid: quote metadata - with all fields', async () => {
  const document = {
    ...BASE_DOCUMENT,
    metadata: { quote: { sellAmount: '1', buyAmount: '1', id: 'S09D8ZFAX', version: '0.1.0' } },
  }
  const validation = await validateAppDataDocument(document)

  expect(validation).toEqual(VALID_RESULT)
})

test('Invalid: quote metadata - missing fields', async () => {
  const document = { ...BASE_DOCUMENT, metadata: { quote: {} } }
  const validation = await validateAppDataDocument(document)

  expect(validation.result).toBeFalsy()
})

test('Invalid: quote metadata - wrong type', async () => {
  const document = { ...BASE_DOCUMENT, metadata: { quote: { sellAmount: 312, buyAmount: '0xbab3' } } }
  const validation = await validateAppDataDocument(document)

  expect(validation.result).toBeFalsy()
})
