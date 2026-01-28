import { DEFAULT_IPFS_READ_URI } from '../consts'
import { fetchDocFromCid } from './fetchDocFromCid'

describe('fetchDocFromCid', () => {
  test('Valid IPFS appData from CID', async () => {
    // given
    const validSerializedCid = 'QmZZhNnqMF1gRywNKnTPuZksX7rVjQgTT3TJAZ7R6VE3b2'
    const expected =
      '{"appCode":"CowSwap","metadata":{"referrer":{"code":"COWREF1"}},"version":"1.14.0"}'
    fetchMock.mockResponseOnce(expected)

    // when
    const appDataDocument = await fetchDocFromCid(validSerializedCid)

    // then
    expect(appDataDocument).toEqual(JSON.parse(expected))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(`${DEFAULT_IPFS_READ_URI}/${validSerializedCid}`)
  })
})
