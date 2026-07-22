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
      if (aBridgeName === bBridgeName) {
        return Number(b.output.amount) - Number(a.output.amount)
      }

      const isAFast = aBridgeName === BungeeBridge.CircleCCTPV2Fast
      const fastRoute = isAFast ? a : b
      const isFastPreferred = fastRoute.output.effectiveReceivedInUsd < CCTP_FAST_THRESHOLD

      return isAFast === isFastPreferred ? -1 : 1
    }

    return Number(b.output.amount) - Number(a.output.amount)
  })
}
