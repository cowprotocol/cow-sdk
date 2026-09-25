import type { LatestAppDataDocVersion } from '@cowprotocol/sdk-app-data'

import { hashAppDataDoc, mergeAppData } from './appData'
import { toHex } from './orderIntent'

const BASE_DOC = { appCode: 'base-app', metadata: {} } as unknown as LatestAppDataDocVersion

describe('mergeAppData', () => {
  it('digests to exactly 32 bytes', async () => {
    const result = await mergeAppData(BASE_DOC, { metadata: { referrer: { code: 'someone' } } })

    expect(result).toHaveLength(32)
  })

  it('is deterministic for the same doc and override', async () => {
    const override = { metadata: { referrer: { code: 'someone' } } }

    const first = await mergeAppData(BASE_DOC, override)
    const second = await mergeAppData(BASE_DOC, override)

    expect(first).toEqual(second)
  })

  it('changes when the override changes', async () => {
    const withReferrer = await mergeAppData(BASE_DOC, { metadata: { referrer: { code: 'someone' } } })
    const withDifferentReferrer = await mergeAppData(BASE_DOC, { metadata: { referrer: { code: 'someone-else' } } })

    expect(withReferrer).not.toEqual(withDifferentReferrer)
  })

  it('overrides the base doc rather than just appending to it', async () => {
    const docWithAppCode = { ...BASE_DOC, appCode: 'original' } as unknown as LatestAppDataDocVersion

    const overridden = await mergeAppData(docWithAppCode, { appCode: 'replaced' })
    const replacedFromScratch = await mergeAppData(
      { ...BASE_DOC, appCode: 'replaced' } as unknown as LatestAppDataDocVersion,
      {},
    )

    expect(overridden).toEqual(replacedFromScratch)
  })
})

describe('hashAppDataDoc', () => {
  it('digests to exactly 32 bytes', async () => {
    const result = await hashAppDataDoc(BASE_DOC)

    expect(result).toHaveLength(32)
  })

  it('is deterministic for the same doc', async () => {
    const first = await hashAppDataDoc(BASE_DOC)
    const second = await hashAppDataDoc(BASE_DOC)

    expect(first).toEqual(second)
  })

  it('changes when the doc changes', async () => {
    const docA = { ...BASE_DOC, appCode: 'app-a' } as unknown as LatestAppDataDocVersion
    const docB = { ...BASE_DOC, appCode: 'app-b' } as unknown as LatestAppDataDocVersion

    expect(await hashAppDataDoc(docA)).not.toEqual(await hashAppDataDoc(docB))
  })

  it('agrees with mergeAppData against an empty override, since merging nothing is just hashing the doc', async () => {
    expect(await hashAppDataDoc(BASE_DOC)).toEqual(await mergeAppData(BASE_DOC, {}))
  })

  it('matches the known keccak256 digest for the base doc', async () => {
    const result = await hashAppDataDoc(BASE_DOC)

    expect(toHex(result)).toBe('bb0346cf4113f3cc24c24761e3c9b57c510e3359a246b2f6576c237f94f25365')
  })
})
