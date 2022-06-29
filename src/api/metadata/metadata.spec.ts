import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { CowSdk } from '../../CowSdk'
import { CowError } from '../../utils/common'
import { DEFAULT_IPFS_READ_URI, DEFAULT_IPFS_WRITE_URI } from '../../constants'

enableFetchMocks()

const chainId = 4 //Rinkeby

const cowSdk = new CowSdk(chainId)

const HTTP_STATUS_OK = 200
const HTTP_STATUS_INTERNAL_ERROR = 500

const DEFAULT_APP_DATA_DOC = {
  version: '0.4.0',
  appCode: 'CowSwap',
  environment: 'test',
  metadata: {},
}

const IPFS_HASH = 'QmRoosA9VFaZVPxBk9k9jhPGGmCAcLMeDP8L2Dd2RbjNv2'
const APP_DATA_HEX = '0x3388186d8f802360e78ee4d57d489678a01c3ce922b1e0078eeb45c8f084b7e7'

const PINATA_API_KEY = 'apikey'
const PINATA_API_SECRET = 'apiSecret'

const CUSTOM_APP_DATA_DOC = {
  ...DEFAULT_APP_DATA_DOC,
  metadata: {
    referrer: {
      address: '0x1f5B740436Fc5935622e92aa3b46818906F416E9',
      version: '0.1.0',
    },
  },
}

beforeEach(() => {
  fetchMock.resetMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('Valid: Create appDataDoc with empty metadata ', () => {
  const appDataDoc = cowSdk.metadataApi.generateAppDataDoc({})
  expect(appDataDoc.version).toEqual(DEFAULT_APP_DATA_DOC.version)
  expect(appDataDoc.appCode).toEqual(DEFAULT_APP_DATA_DOC.appCode)
  expect(appDataDoc.metadata).toEqual(DEFAULT_APP_DATA_DOC.metadata)
})

test('Valid: Create appDataDoc with custom metadata ', () => {
  const appDataDoc = cowSdk.metadataApi.generateAppDataDoc(CUSTOM_APP_DATA_DOC.metadata)
  expect(appDataDoc.metadata.referrer?.address).toEqual(CUSTOM_APP_DATA_DOC.metadata.referrer.address)
  expect(appDataDoc.metadata.referrer?.version).toEqual(CUSTOM_APP_DATA_DOC.metadata.referrer.version)
})

test('Invalid: Upload to IPFS without passing credentials', async () => {
  const appDataDoc = cowSdk.metadataApi.generateAppDataDoc(CUSTOM_APP_DATA_DOC.metadata)
  try {
    await cowSdk.metadataApi.uploadMetadataDocToIpfs(appDataDoc)
  } catch (e) {
    const error = e as CowError
    expect(error.message).toEqual('You need to pass IPFS api credentials.')
  }
})

test('Valid: Upload AppDataDoc to IPFS', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ IpfsHash: IPFS_HASH }), { status: HTTP_STATUS_OK })
  const appDataDoc = cowSdk.metadataApi.generateAppDataDoc(CUSTOM_APP_DATA_DOC.metadata)
  const cowSdk1 = new CowSdk(chainId, { ipfs: { pinataApiKey: PINATA_API_KEY, pinataApiSecret: PINATA_API_SECRET } })
  const appDataHex = await cowSdk1.metadataApi.uploadMetadataDocToIpfs(appDataDoc)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(appDataHex).toEqual(APP_DATA_HEX)
  expect(fetchMock).toHaveBeenCalledWith(DEFAULT_IPFS_WRITE_URI + '/pinning/pinJSONToIPFS', {
    body: JSON.stringify({ pinataContent: appDataDoc, pinataMetadata: { name: 'appData' } }),
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
    method: 'POST',
  })
})

test('Invalid: Upload AppDataDoc to IPFS with wrong credentials', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ error: { details: 'IPFS api keys are invalid' } }), {
    status: HTTP_STATUS_INTERNAL_ERROR,
  })
  const appDataDoc = cowSdk.metadataApi.generateAppDataDoc({})
  const cowSdk1 = new CowSdk(chainId, { ipfs: { pinataApiKey: PINATA_API_KEY, pinataApiSecret: PINATA_API_SECRET } })
  try {
    await cowSdk1.metadataApi.uploadMetadataDocToIpfs(appDataDoc)
    await expect(cowSdk1.metadataApi.uploadMetadataDocToIpfs(appDataDoc)).rejects.toThrow('IPFS api keys are invalid')
  } catch (e) {
    const error = e as CowError
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(error.message).toEqual('IPFS api keys are invalid')
  }
})

test('Valid: Decode appData ', async () => {
  fetchMock.mockResponseOnce(JSON.stringify(CUSTOM_APP_DATA_DOC), { status: HTTP_STATUS_OK })
  const appDataDoc = await cowSdk.metadataApi.decodeAppData(APP_DATA_HEX)

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(`${DEFAULT_IPFS_READ_URI}/${IPFS_HASH}`)
  expect(appDataDoc?.version).toEqual(CUSTOM_APP_DATA_DOC.version)
  expect(appDataDoc?.appCode).toEqual(CUSTOM_APP_DATA_DOC.appCode)
  expect(appDataDoc?.metadata.referrer?.address).toEqual(CUSTOM_APP_DATA_DOC.metadata.referrer.address)
  expect(appDataDoc?.metadata.referrer?.version).toEqual(CUSTOM_APP_DATA_DOC.metadata.referrer.version)
})

test('Invalid: Decode appData with wrong hash format', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({}), { status: HTTP_STATUS_INTERNAL_ERROR })
  try {
    await cowSdk.metadataApi.decodeAppData('invalidHash')
  } catch (e) {
    const error = e as CowError
    expect(error.message).toEqual('Error decoding AppData: Incorrect length')
  }
})

test('Valid: AppData to CID ', async () => {
  const decodedAppDataHex = await cowSdk.metadataApi.appDataHexToCid(APP_DATA_HEX)
  expect(decodedAppDataHex).toEqual(IPFS_HASH)
})

test('Invalid: AppData to CID with wrong format ', async () => {
  try {
    await cowSdk.metadataApi.appDataHexToCid('invalidHash')
  } catch (e) {
    const error = e as CowError
    expect(error.message).toEqual('Incorrect length')
  }
})

test('Valid: pre-calculated CIDv0 and appDataHash', async () => {
  const result = await cowSdk.metadataApi.calculateAppDataHash(DEFAULT_APP_DATA_DOC)

  expect(result).not.toBeFalsy()
  expect(result).toEqual({ cidV0: IPFS_HASH, appDataHash: APP_DATA_HEX })
})

test('Invalid: pre-calculated CIDv0 not valid appDoc', async () => {
  const doc = {
    ...DEFAULT_APP_DATA_DOC,
    metadata: { quote: { sellAmount: 'fsdfas', buyAmount: '41231', version: '0.1.0' } },
  }

  await expect(cowSdk.metadataApi.calculateAppDataHash(doc)).rejects.toThrow('Invalid appData provided')
})

test('Invalid: Could not derive a the appDataHash', async () => {
  const mock = jest.fn()
  cowSdk.metadataApi.cidToAppDataHex = mock

  await expect(cowSdk.metadataApi.calculateAppDataHash(DEFAULT_APP_DATA_DOC)).rejects.toThrow(
    'Failed to calculate appDataHash'
  )
  expect(mock).toBeCalledTimes(1)
  expect(mock).toHaveBeenCalledWith(IPFS_HASH)
})
