import { APP_DATA_DOC } from '../mocks'
import { validateAppDataDoc } from './validateAppDataDoc'

describe('validateAppDataDocument', () => {
  const v010Doc = {
    ...APP_DATA_DOC,
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
    // when
    const v010Validation = await validateAppDataDoc(v010Doc)
    const v040Validation = await validateAppDataDoc(v040Doc)
    // then
    expect(v010Validation.success).toBeTruthy()
    expect(v040Validation.success).toBeTruthy()
  })

  test("Version doesn't match schema", async () => {
    // when
    const v030Validation = await validateAppDataDoc({ ...v040Doc, version: '0.3.0' })
    // then
    expect(v030Validation.success).toBeFalsy()
    expect(v030Validation.errors).toEqual("data/metadata/quote must have required property 'sellAmount'")
  })

  test("Version doesn't exist", async () => {
    // when
    const validation = await validateAppDataDoc({ ...v010Doc, version: '0.0.0' })
    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toEqual("AppData version 0.0.0 doesn't exist")
  })

  test("Version doesn't exist without logging the internal import error", async () => {
    // given
    // A version no other test loads: validators, including failed ones, are cached per version
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined)

    try {
      // when
      const validation = await validateAppDataDoc({ ...v010Doc, version: '0.0.1' })

      // then
      expect(validation).toEqual({ success: false, errors: "AppData version 0.0.1 doesn't exist" })
      expect(consoleLogSpy).not.toHaveBeenCalled()
    } finally {
      consoleLogSpy.mockRestore()
    }
  })

  test('Valid doc', async () => {
    // given
    const doc = { version: '0.4.0', metadata: {} }
    // when
    const result = await validateAppDataDoc(doc)
    // then
    expect(result.success).toBeTruthy()
    expect(result.errors).toBeUndefined()
  })

  test('Invalid doc', async () => {
    // given
    const doc = { version: '0.4.0', metadata: { referrer: { version: '312313', address: '0xssss' } } }
    // when
    const result = await validateAppDataDoc(doc)
    // then
    expect(result.success).toBeFalsy()
    expect(result.errors).toEqual('data/metadata/referrer/address must match pattern "^0x[a-fA-F0-9]{40}$"')
  })

  test('Non existent version', async () => {
    // given
    const doc = { version: '0.0.0', metadata: {} }
    // when
    const result = await validateAppDataDoc(doc)
    // then
    expect(result.success).toBeFalsy()
    expect(result.errors).toEqual(`AppData version 0.0.0 doesn't exist`)
  })
})
