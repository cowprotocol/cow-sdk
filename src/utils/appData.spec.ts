import fetchMock from 'jest-fetch-mock'
import { validateAppDataDocument, getSerializedCID, loadIpfsFromCid } from './appData'
import { DEFAULT_IPFS_READ_URI } from '../constants'

const VALID_RESULT = {
  result: true,
}

const BASE_DOCUMENT = {
  version: '0.1.0',
  metadata: {},
}

const INVALID_CID_LENGTH = 'Incorrect length'

describe('validateAppDataDocument', () => {
  const v010Doc = {
    ...BASE_DOCUMENT,
    metatadata: {
      referrer: { address: '0xb6BAd41ae76A11D10f7b0E664C5007b908bC77C9', version: '0.1.0' },
    },
  }
  const v040Doc = {
    ...v010Doc,
    version: '0.4.0',
    metadata: { ...v010Doc.metadata, quote: { slippageBips: '1', version: '0.2.0' } },
  }

  test('Version matches schema', async () => {
    // given
    // when
    const v010Validation = await validateAppDataDocument(v010Doc, v010Doc.version)
    const v040Validation = await validateAppDataDocument(v040Doc, v040Doc.version)
    // then
    expect(v010Validation).toEqual(VALID_RESULT)
    expect(v040Validation).toEqual(VALID_RESULT)
  })

  test("Version doesn't match schema", async () => {
    // given
    // when
    const v030Validation = await validateAppDataDocument(v040Doc, '0.3.0')
    // then
    expect(v030Validation.result).toBeFalsy()
    expect(v030Validation.errors).toEqual("data/metadata/quote must have required property 'sellAmount'")
  })

  test("Version doesn't exist", async () => {
    // given
    // when
    const validation = validateAppDataDocument(v010Doc, '0.0.0')
    // then
    await expect(validation).rejects.toThrow('AppData version 0.0.0 does not exist')
  })
})

describe('getSerializedCID', () => {
  test('Serializes hash into CID', async () => {
    // given
    const hash = '0xa6c81f4ca727252a05b108f1742a07430f28d474d2a3492d8f325746824d22e5'
    const expected = 'QmZZhNnqMF1gRywNKnTPuZksX7rVjQgTT3TJAZ7R6VE3b2'

    // when
    const cidV0 = await getSerializedCID(hash)

    // then
    expect(cidV0).toEqual(expected)
  })

  test('Throws on invalid appData hash', async () => {
    // given
    const invalidHash = '0xa6c81f4ca727252a05b108f1742'

    // when
    const promise = getSerializedCID(invalidHash)

    // then
    await expect(promise).rejects.toThrow(INVALID_CID_LENGTH)
  })
})

describe('loadIpfsFromCid', () => {
  test('Valid IPFS appData from CID', async () => {
    // given
    const validSerializedCidV0 = 'QmZZhNnqMF1gRywNKnTPuZksX7rVjQgTT3TJAZ7R6VE3b2'
    const expected =
      '{"appCode":"CowSwap","metadata":{"referrer":{"address":"0x1f5B740436Fc5935622e92aa3b46818906F416E9","version":"0.1.0"}},"version":"0.1.0"}'
    fetchMock.mockResponseOnce(expected)

    // when
    const appDataDocument = await loadIpfsFromCid(validSerializedCidV0)

    // then
    expect(appDataDocument).toEqual(JSON.parse(expected))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(`${DEFAULT_IPFS_READ_URI}/${validSerializedCidV0}`)
  })
})
