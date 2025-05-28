import { latest } from '@cowprotocol/app-data'

export function getPartnerFeeBps(partnerFee: latest.PartnerFee | undefined): number | undefined {
  if (!partnerFee) {
    return undefined
  }

  if ('volumeBps' in partnerFee) {
    return partnerFee.volumeBps
  }

  if (Array.isArray(partnerFee)) {
    for (const fee of partnerFee) {
      if ('volumeBps' in fee) {
        return fee.volumeBps
      }
    }
  }
  // TODO: what do we do when partnerFee doesn't have volumeBps? (priceImprovementBps or surplusBps). Is it safe to ignore?

  return undefined
}
