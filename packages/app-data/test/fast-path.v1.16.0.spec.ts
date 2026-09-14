import { generateAppDataDoc } from '../src/api/generateAppDataDoc'
import { validateAppDataDoc } from '../src/api/validateAppDataDoc'

describe('Fast-path metadata v1.16.0', () => {
  const metadata = {
    enableFastPath: true,
    validFrom: 1700000000,
  }

  test('Creates appDataDoc with fast-path metadata', async () => {
    // when
    const appDataDoc = await generateAppDataDoc({ metadata })

    // then
    expect(appDataDoc.metadata.enableFastPath).toBe(true)
    expect(appDataDoc.metadata.validFrom).toBe(1700000000)
  })

  test('Validates a v1.16.0 doc with enableFastPath and validFrom', async () => {
    // given
    const doc = {
      version: '1.16.0',
      appCode: 'CoW Swap',
      metadata,
    }

    // when
    const validation = await validateAppDataDoc(doc)

    // then
    expect(validation.success).toBeTruthy()
    expect(validation.errors).toBeUndefined()
  })

  test('Both fields are optional (empty metadata is valid)', async () => {
    // given
    const doc = { version: '1.16.0', appCode: 'CoW Swap', metadata: {} }

    // when
    const validation = await validateAppDataDoc(doc)

    // then
    expect(validation.success).toBeTruthy()
    expect(validation.errors).toBeUndefined()
  })

  test('Fails validation when enableFastPath is not a boolean', async () => {
    // given
    const doc = {
      version: '1.16.0',
      appCode: 'CoW Swap',
      metadata: { enableFastPath: 'yes' },
    }

    // when
    const validation = await validateAppDataDoc(doc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain('data/metadata/enableFastPath must be boolean')
  })

  test('Fails validation when validFrom is not an integer', async () => {
    // given
    const doc = {
      version: '1.16.0',
      appCode: 'CoW Swap',
      metadata: { validFrom: 'soon' },
    }

    // when
    const validation = await validateAppDataDoc(doc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain('data/metadata/validFrom must be integer')
  })
})
