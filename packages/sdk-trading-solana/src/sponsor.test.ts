import { SOLANA_ORDER_SPONSOR, SOLANA_ORDER_SPONSOR_STAGING } from '@cowprotocol/sdk-config'

import { getSolanaOrderSponsor } from './sponsor'

describe('getSolanaOrderSponsor', () => {
  it('returns the configured sponsor for prod', () => {
    expect(getSolanaOrderSponsor().toBase58()).toBe(SOLANA_ORDER_SPONSOR)
    expect(getSolanaOrderSponsor('prod').toBase58()).toBe(SOLANA_ORDER_SPONSOR)
  })

  it('returns the staging sponsor for staging', () => {
    expect(getSolanaOrderSponsor('staging').toBase58()).toBe(SOLANA_ORDER_SPONSOR_STAGING)
  })
})
