import { generateAppDataDoc } from '../src/api/generateAppDataDoc'
import { validateAppDataDoc } from '../src/api/validateAppDataDoc'

describe('Wrappers metadata v1.11.0', () => {
  // actual metadata used for Euler
  const validWrappersMetadata = [
    {
      address: '0x74399a40D9FE2478e82058480F426D7e5783167c',
      data: '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000ff123456000000000000000000000000d8b27cf359b7da5be299af6e7bf904984c2000000000000000000000000797dd80692c3b2dadabce8e30c07fde5307d48a90000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000005f5e100'
    }
  ]

  test('Creates appDataDoc with flashloan metadata v1.11.0', async () => {
    // when
    const appDataDoc = await generateAppDataDoc({
      metadata: {
        wrappers: validWrappersMetadata,
      },
    })

    // then
    expect(appDataDoc.metadata.wrappers).toEqual(validWrappersMetadata)
  })

  test('Validates valid flashloan metadata v1.11.0', async () => {
    // given
    const appDataDocV1110 = {
      version: '1.11.0',
      appCode: 'euler',
      metadata: {
        wrappers: validWrappersMetadata,
      },
    }

    // when
    const validation = await validateAppDataDoc(appDataDocV1110)

    // then
    expect(validation.success).toBeTruthy()
    expect(validation.errors).toBeUndefined()
  })

  test('Fails validation with invalid wrapper address', async () => {
    // given
    const invalidDoc = {
      version: '1.11.0',
      appCode: 'euler',
      metadata: {
        wrappers: [{
          address: '0xinvalid',
        }],
      },
    }

    // when
    const validation = await validateAppDataDoc(invalidDoc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain(
      'data/metadata/wrappers/0/address must match pattern "^0x[a-fA-F0-9]{40}$"',
    )
  })

  test('Fails validation with invalid wrapper data', async () => {
    // given
    const invalidDoc = {
      version: '1.11.0',
      appCode: 'euler',
      metadata: {
        wrappers: [{
          address: '0x74399a40D9FE2478e82058480F426D7e5783167c',
          data: '0xinvalid',
        }],
      },
    }

    // when
    const validation = await validateAppDataDoc(invalidDoc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain(
      'data/metadata/wrappers/0/data must match pattern "^0x[a-f0-9]*$"',
    )
  })

  test('Fails validation with missing required fields', async () => {
    // given
    const invalidDoc = {
      version: '1.11.0',
      appCode: 'CoW Swap',
      metadata: {
        wrappers: [{
          data: validWrappersMetadata[0]?.data,
          // missing address
        }],
      },
    }

    // when
    const validation = await validateAppDataDoc(invalidDoc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain("data/metadata/wrappers/0 must have required property 'address'")
  })

  test('Validates all new fields are present', async () => {
    // given
    const appDataDocWithAllFields = {
      version: '1.11.0',
      appCode: 'euler',
      metadata: {
        wrappers: validWrappersMetadata,
      },
    }

    // when
    const validation = await validateAppDataDoc(appDataDocWithAllFields)

    // then
    expect(validation.success).toBeTruthy()
    expect(validation.errors).toBeUndefined()
    // Ensure all fields are present
    expect(appDataDocWithAllFields.metadata.wrappers[0]?.address).toBeDefined()
    expect(appDataDocWithAllFields.metadata.wrappers[0]?.data).toBeDefined()
  })

  test('Creates appDataDoc with flashloan and other metadata v1.11.0', async () => {
    // given
    const metadata = {
      wrappers: validWrappersMetadata,
      quote: {
        slippageBips: 50,
        version: '1.1.0',
      },
    }

    // when
    const appDataDoc = await generateAppDataDoc({ metadata })

    // then
    expect(appDataDoc.metadata).toEqual(metadata)
  })
})
