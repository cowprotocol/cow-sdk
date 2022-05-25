import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { CowSdk } from '../../CowSdk'
import { CowError } from '../../utils/common'

enableFetchMocks()

const chainId = 4 //Rinkeby

const cowSdk = new CowSdk(chainId)

const HTTP_STATUS_OK = 200
const HTTP_STATUS_INTERNAL_ERROR = 500

const DEFAULT_APP_DATA_DOC = {
  version: '0.2.0',
  appCode: 'CowSwap',
  metadata: {},
}

const IPFS_HASH = 'QmWtoqEQKSUvwUqnCEyoLeJ5SfnCzPhWerVDXjBBjjnj9t'

const APP_DATA_HEX = '0x7f1a65839d8801753d270a067c6cfaface303af6506531f3362a3001f25bb153'

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
  const cowSdk1 = new CowSdk(chainId, { ipfs: { pinataApiKey: 'validApiKey', pinataApiSecret: 'ValidApiSecret' } })
  const appDataHex = await cowSdk1.metadataApi.uploadMetadataDocToIpfs(appDataDoc)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(appDataHex).toEqual(APP_DATA_HEX)
})

test('Invalid: Upload AppDataDoc to IPFS with wrong credentials', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ error: { details: 'IPFS api keys are invalid' } }), {
    status: HTTP_STATUS_INTERNAL_ERROR,
  })
  const appDataDoc = cowSdk.metadataApi.generateAppDataDoc({})
  const cowSdk1 = new CowSdk(chainId, { ipfs: { pinataApiKey: 'InvalidApiKey', pinataApiSecret: 'InvValidApiSecret' } })
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
  expect(fetchMock).toHaveBeenCalledWith(`https://gnosis.mypinata.cloud/ipfs/${IPFS_HASH}`)
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
