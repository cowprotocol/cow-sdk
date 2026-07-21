import { getBungeeBridgeFromDisplayName } from './util'
import { BungeeBridge, BungeeQuoteAPIResponse } from './types'

type ManualRoutes = BungeeQuoteAPIResponse['result']['manualRoutes']

const CCTPV2_FAMILY = [BungeeBridge.CircleCCTPV2, BungeeBridge.CircleCCTPV2Fast]
const CCTP_FAST_THRESHOLD = 5000 // 5k USD

export function sortManualRoutes(manualRoutes: ManualRoutes): ManualRoutes {
  return manualRoutes.sort((a, b) => {
    const aBridgeName = getBungeeBridgeFromDisplayName(a.routeDetails.name)
    const bBridgeName = getBungeeBridgeFromDisplayName(b.routeDetails.name)

    if (aBridgeName && bBridgeName && CCTPV2_FAMILY.includes(aBridgeName) && CCTPV2_FAMILY.includes(bBridgeName)) {
      // Should choose fast when amount is less than 5k
      if (a.output.effectiveReceivedInUsd < CCTP_FAST_THRESHOLD) {
        return aBridgeName === BungeeBridge.CircleCCTPV2Fast ? -1 : 1
      }

      return aBridgeName === BungeeBridge.CircleCCTPV2Fast ? 1 : -1
    }

    return Number(b.output.amount) - Number(a.output.amount)
  })
}
