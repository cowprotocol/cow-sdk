import { APP_DATA_DOC_WITH_FLASHLOAN } from '../src/mocks'
import { generateAppDataDoc } from '../src/api/generateAppDataDoc'
import { validateAppDataDoc } from '../src/api/validateAppDataDoc'

describe('Flashloan metadata', () => {
  test('Creates appDataDoc with flashloan metadata', async () => {
    // given
    const flashloanMetadata = {
      lender: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      borrower: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
      token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      amount: '1000000000',
    }

    // when
    const appDataDoc = await generateAppDataDoc({
      metadata: {
        flashloan: flashloanMetadata,
      },
    })

    // then
    expect(appDataDoc.metadata.flashloan).toEqual(flashloanMetadata)
    expect(appDataDoc.version).toBe('1.6.0')
  })

  test('Validates valid flashloan metadata', async () => {
    // when
    const validation = await validateAppDataDoc(APP_DATA_DOC_WITH_FLASHLOAN)

    // then
    expect(validation.success).toBeTruthy()
    expect(validation.errors).toBeUndefined()
  })

  test('Fails validation with invalid lender address', async () => {
    // given
    const invalidDoc = {
      ...APP_DATA_DOC_WITH_FLASHLOAN,
      metadata: {
        flashloan: {
          ...APP_DATA_DOC_WITH_FLASHLOAN.metadata.flashloan,
          lender: '0xinvalid',
        },
      },
    }

    // when
    const validation = await validateAppDataDoc(invalidDoc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain('data/metadata/flashloan/lender must match pattern "^0x[a-fA-F0-9]{40}$"')
  })

  test('Fails validation with invalid amount', async () => {
    // given
    const invalidDoc = {
      ...APP_DATA_DOC_WITH_FLASHLOAN,
      metadata: {
        flashloan: {
          ...APP_DATA_DOC_WITH_FLASHLOAN.metadata.flashloan,
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
      ...APP_DATA_DOC_WITH_FLASHLOAN,
      metadata: {
        flashloan: {
          ...APP_DATA_DOC_WITH_FLASHLOAN.metadata.flashloan,
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
      version: '1.6.0',
      appCode: 'CoW Swap',
      metadata: {
        flashloan: {
          lender: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
          // missing borrower, token, and amount
        },
      },
    }

    // when
    const validation = await validateAppDataDoc(invalidDoc)

    // then
    expect(validation.success).toBeFalsy()
    expect(validation.errors).toContain("data/metadata/flashloan must have required property 'borrower'")
  })

  test('Creates appDataDoc with flashloan and other metadata', async () => {
    // given
    const metadata = {
      flashloan: {
        lender: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        borrower: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        amount: '1000000000',
      },
      quote: {
        slippageBips: 50,
        version: '1.1.0',
      },
    }

    // when
    const appDataDoc = await generateAppDataDoc({ metadata })

    // then
    expect(appDataDoc.metadata).toEqual(metadata)
    expect(appDataDoc.version).toBe('1.6.0')
  })
})
