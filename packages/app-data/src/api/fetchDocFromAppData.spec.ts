import { DEFAULT_IPFS_READ_URI } from '../consts'
import {
  APP_DATA_DOC_CUSTOM,
  APP_DATA_HEX_LEGACY,
  CID_LEGACY,
  HTTP_STATUS_INTERNAL_ERROR,
  HTTP_STATUS_OK,
} from '../mocks'

import { fetchDocFromAppDataHex, fetchDocFromAppDataHexLegacy } from './fetchDocFromAppData'

// beforeEach(() => {
//   fetchMock.resetMocks()
// })

// afterEach(() => {
//   jest.restoreAllMocks()
// })

describe('fetchDocFromAppData', () => {
  test('Decodes appData', async () => {
    // given
    fetchMock.mockResponseOnce(JSON.stringify(APP_DATA_DOC_CUSTOM), { status: HTTP_STATUS_OK })

    // when
    const appDataDoc = await fetchDocFromAppDataHexLegacy(APP_DATA_HEX_LEGACY)

    // then
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(`${DEFAULT_IPFS_READ_URI}/${CID_LEGACY}`)
    expect(appDataDoc).toEqual(APP_DATA_DOC_CUSTOM)
  })

  test('Throws with wrong hash format', async () => {
    // given
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: HTTP_STATUS_INTERNAL_ERROR })
    // when
    const promise = fetchDocFromAppDataHex('invalidHash')
    // then
    await expect(promise).rejects.toThrow(/Error decoding AppData:/)
  })
})
