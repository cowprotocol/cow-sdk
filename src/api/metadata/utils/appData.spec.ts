import fetchMock from 'jest-fetch-mock'
import { getSerializedCID, loadIpfsFromCid } from './appData'
import { DEFAULT_IPFS_READ_URI } from '../../../common/ipfs'

const INVALID_CID_LENGTH = 'Incorrect length'

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
