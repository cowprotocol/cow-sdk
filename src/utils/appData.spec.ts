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

// TODO: move unit tests to app-data package

test('Valid minimal document', async () => {
  const validation = await validateAppDataDocument(BASE_DOCUMENT, BASE_DOCUMENT.version)
  expect(validation).toEqual(VALID_RESULT)
})

test('Valid minimal document + appCode', async () => {
  const validation = await validateAppDataDocument(
    {
      version: '0.1.0',
      appCode: 'MyApp',
      metadata: {},
    },
    '0.1.0'
  )
  expect(validation).toEqual(VALID_RESULT)
})

test('Valid minimal document + appCode + referrer', async () => {
  const validation = await validateAppDataDocument(
    {
      version: '0.1.0',
      appCode: 'MyApp',
      metadata: {
        referrer: {
          version: '0.1.0',
          address: '0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52',
        },
      },
    },
    '0.1.0'
  )
  expect(validation).toEqual(VALID_RESULT)
})

test('Invalid: Bad referrer', async () => {
  const validation = await validateAppDataDocument(
    {
      version: '0.1.0',
      appCode: 'MyApp',
      metadata: {
        referrer: {
          version: '0.1.0',
          address: 'this is not an ethereum address',
        },
      },
    },
    '0.1.0'
  )
  expect(validation.result).toBeFalsy()
})

test('Invalid: No version', async () => {
  const validation = await validateAppDataDocument(
    {
      appCode: 'MyApp',
      metadata: {},
    },
    '0.1.0'
  )
  expect(validation.result).toBeFalsy()
})

test('Invalid: No metadata', async () => {
  const validation = await validateAppDataDocument(
    {
      version: '0.1.0',
      appCode: 'MyApp',
    },
    '0.1.0'
  )
  expect(validation.result).toBeFalsy()
})

test('Invalid: No metadata', async () => {
  const validation = await validateAppDataDocument(
    {
      version: '0.1.0',
      appCode: 'MyApp',
    },
    '0.1.0'
  )
  expect(validation.result).toBeFalsy()
})

test('Invalid: No metadata', async () => {
  const validation = await validateAppDataDocument(
    {
      version: '0.1.0',
      appCode: 'MyApp',
    },
    '0.1.0'
  )
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
  fetchMock.mockResponseOnce(
    '{"appCode":"CowSwap","metadata":{"referrer":{"address":"0x1f5B740436Fc5935622e92aa3b46818906F416E9","version":"0.1.0"}},"version":"0.1.0"}'
  )

  const validSerializedCidV0 = 'QmZZhNnqMF1gRywNKnTPuZksX7rVjQgTT3TJAZ7R6VE3b2'
  const appDataDocument = await loadIpfsFromCid(validSerializedCidV0)
  const validation = await validateAppDataDocument(appDataDocument, '0.1.0')

  expect(validation).toEqual(VALID_RESULT)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('Valid: quote metadata - slippage', async () => {
  const document = { ...BASE_DOCUMENT, metadata: { quote: { version: '0.1.0', slippageBips: '5', newField: 'bla' } } }
  const validation = await validateAppDataDocument(document, '0.1.0')

  expect(validation).toEqual(VALID_RESULT)
})

test('Valid: quote metadata - slippage - decimals', async () => {
  const document = { ...BASE_DOCUMENT, metadata: { quote: { version: '0.1.0', slippageBips: '0.1' } } }
  const validation = await validateAppDataDocument(document, '0.1.0')

  expect(validation).toEqual(VALID_RESULT)
})

test('Invalid: quote metadata - missing fields', async () => {
  const document = { ...BASE_DOCUMENT, metadata: { quote: { version: '0.1.2' } } }
  const validation = await validateAppDataDocument(document, '0.4.0')

  expect(validation.result).toBeFalsy()
})

test('Invalid: quote metadata - wrong amount type', async () => {
  const document = { ...BASE_DOCUMENT, metadata: { quote: { version: '0.1.0', sellAmount: 312, buyAmount: '0xbab3' } } }
  const validation = await validateAppDataDocument(document, '0.3.0')

  expect(validation.result).toBeFalsy()
})

test('Invalid: quote metadata - wrong slippage amount', async () => {
  const document = { ...BASE_DOCUMENT, metadata: { quote: { version: '0.1.0', slippageBips: '.1' } } }
  const validation = await validateAppDataDocument(document, '0.4.0')

  expect(validation.result).toBeFalsy()
})

test('Invalid: quote metadata - amount missing buyAmount type', async () => {
  const document = { ...BASE_DOCUMENT, metadata: { quote: { sellAmount: 312 } } }
  const validation = await validateAppDataDocument(document, '0.3.0')

  expect(validation.result).toBeFalsy()
})

test('Invalid: quote metadata - amount missing sellAmount type', async () => {
  const document = { ...BASE_DOCUMENT, metadata: { quote: { buyAmount: 312 } } }
  const validation = await validateAppDataDocument(document, '0.2.0')

  expect(validation.result).toBeFalsy()
})

test('Valid: environment', async () => {
  const document = { ...BASE_DOCUMENT, environment: 'test' }

  const validation = await validateAppDataDocument(document, '0.1.0')

  expect(validation).toEqual(VALID_RESULT)
})

test('Invalid: environment', async () => {
  const document = { ...BASE_DOCUMENT, environment: 1234142 }

  const validation = await validateAppDataDocument(document, '0.3.0')

  expect(validation.result).toBeFalsy()
})
