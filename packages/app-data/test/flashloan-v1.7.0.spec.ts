import { generateAppDataDoc } from '../src/api/generateAppDataDoc'
import { validateAppDataDoc } from '../src/api/validateAppDataDoc'

describe('Flashloan metadata v1.7.0', () => {
  const validFlashloanMetadata = {
    amount: '2000000000000000000',
    liquidityProvider: '0xb50201558B00496A145fE76f7424749556E326D8',
    protocolAdapter: '0x1186B5ad42E3e6d6c6901FC53b4A367540E6EcFE',
    receiver: '0x1186B5ad42E3e6d6c6901FC53b4A367540E6EcFE',
    token: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
  }

  test('Creates appDataDoc with flashloan metadata v1.7.0', async () => {
    // when
    const appDataDoc = await generateAppDataDoc({
      metadata: {
        flashloan: validFlashloanMetadata,
      },
    })

    // then
    expect(appDataDoc.metadata.flashloan).toEqual(validFlashloanMetadata)
    expect(appDataDoc.version).toBe('1.8.0')
  })

  test('Validates valid flashloan metadata v1.7.0', async () => {
    // given
    const appDataDocV170 = {
      version: '1.7.0',
      appCode: 'aave-v3-flashloan',
      metadata: {
        flashloan: validFlashloanMetadata,
      },
    }

    // when
    const validation = await validateAppDataDoc(appDataDocV170)

    // then
    expect(validation.success).toBeTruthy()
    expect(validation.errors).toBeUndefined()
  })

  test('Fails validation with invalid liquidityProvider address', async () => {
    // given
    const invalidDoc = {
      version: '1.7.0',
      appCode: 'aave-v3-flashloan',
      metadata: {
        flashloan: {
          ...validFlashloanMetadata,
          liquidityProvider: '0xinvalid',
        },
      },
    }

    // when
    const validation = await validateAppDataDoc(invalidDoc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain(
      'data/metadata/flashloan/liquidityProvider must match pattern "^0x[a-fA-F0-9]{40}$"',
    )
  })

  test('Fails validation with invalid amount', async () => {
    // given
    const invalidDoc = {
      version: '1.7.0',
      appCode: 'aave-v3-flashloan',
      metadata: {
        flashloan: {
          ...validFlashloanMetadata,
          amount: '-100',
        },
      },
    }

    // when
    const validation = await validateAppDataDoc(invalidDoc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain('data/metadata/flashloan/amount must match pattern "^[1-9]\\d*$"')
  })

  test('Fails validation with zero amount', async () => {
    // given
    const invalidDoc = {
      version: '1.7.0',
      appCode: 'aave-v3-flashloan',
      metadata: {
        flashloan: {
          ...validFlashloanMetadata,
          amount: '0',
        },
      },
    }

    // when
    const validation = await validateAppDataDoc(invalidDoc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain('data/metadata/flashloan/amount must match pattern "^[1-9]\\d*$"')
  })

  test('Fails validation with missing required fields', async () => {
    // given
    const invalidDoc = {
      version: '1.7.0',
      appCode: 'CoW Swap',
      metadata: {
        flashloan: {
          amount: '2000000000000000000',
          liquidityProvider: '0xb50201558B00496A145fE76f7424749556E326D8',
          // missing protocolAdapter, receiver, and token
        },
      },
    }

    // when
    const validation = await validateAppDataDoc(invalidDoc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain("data/metadata/flashloan must have required property 'protocolAdapter'")
  })

  test('Validates all new fields are present', async () => {
    // given
    const appDataDocWithAllFields = {
      version: '1.7.0',
      appCode: 'aave-v3-flashloan',
      metadata: {
        flashloan: validFlashloanMetadata,
      },
    }

    // when
    const validation = await validateAppDataDoc(appDataDocWithAllFields)

    // then
    expect(validation.success).toBeTruthy()
    expect(validation.errors).toBeUndefined()
    // Ensure all fields are present
    expect(appDataDocWithAllFields.metadata.flashloan.amount).toBeDefined()
    expect(appDataDocWithAllFields.metadata.flashloan.liquidityProvider).toBeDefined()
    expect(appDataDocWithAllFields.metadata.flashloan.protocolAdapter).toBeDefined()
    expect(appDataDocWithAllFields.metadata.flashloan.receiver).toBeDefined()
    expect(appDataDocWithAllFields.metadata.flashloan.token).toBeDefined()
  })

  test('Creates appDataDoc with flashloan and other metadata v1.7.0', async () => {
    // given
    const metadata = {
      flashloan: validFlashloanMetadata,
      quote: {
        slippageBips: 50,
        version: '1.1.0',
      },
    }

    // when
    const appDataDoc = await generateAppDataDoc({ metadata })

    // then
    expect(appDataDoc.metadata).toEqual(metadata)
    expect(appDataDoc.version).toBe('1.8.0')
  })
})
