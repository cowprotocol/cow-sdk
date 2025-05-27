import { DEFAULT_IPFS_READ_URI } from '../consts'
import { fetchDocFromCid } from './fetchDocFromCid'

describe('fetchDocFromCid', () => {
  test('Valid IPFS appData from CID', async () => {
    // given
    const validSerializedCid = 'QmZZhNnqMF1gRywNKnTPuZksX7rVjQgTT3TJAZ7R6VE3b2'
    const expected =
      '{"appCode":"CowSwap","metadata":{"referrer":{"address":"0x1f5B740436Fc5935622e92aa3b46818906F416E9","version":"0.1.0"}},"version":"0.1.0"}'
    fetchMock.mockResponseOnce(expected)

    // when
    const appDataDocument = await fetchDocFromCid(validSerializedCid)

    // then
    expect(appDataDocument).toEqual(JSON.parse(expected))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(`${DEFAULT_IPFS_READ_URI}/${validSerializedCid}`)
  })
})
