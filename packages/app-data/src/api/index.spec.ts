import { AppDataSdk, MetadataApi } from './index'

describe('AppDataSdk', () => {
  test('exposes exactly the supported app-data methods', () => {
    expect(Object.keys(new AppDataSdk()).sort()).toEqual([
      'appDataHexToCid',
      'cidToAppDataHex',
      'generateAppDataDoc',
      'getAppDataInfo',
      'getAppDataSchema',
      'validateAppDataDoc',
    ])
  })

  test('no longer exposes the legacy surface', () => {
    expect('legacy' in new AppDataSdk()).toBe(false)
  })

  test('MetadataApi stays an alias of AppDataSdk', () => {
    expect(new MetadataApi()).toBeInstanceOf(AppDataSdk)
  })
})
