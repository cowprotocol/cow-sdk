import { TradingAppDataInfo, AppDataRootSchema, BuildAppDataParams } from './types'
import {
  AppDataParams,
  type LatestAppDataDocVersion,
  MetadataApi,
  stringifyDeterministic,
} from '@cowprotocol/sdk-app-data'
import { getGlobalAdapter } from '@cowprotocol/sdk-common'
import deepmerge from 'deepmerge'
// Import the SDK package.json to get the version (relative path for build compatibility)
import sdkPackageJson from '../../sdk/package.json'

/**
 * Get default UTM parameters for developer attribution tracking
 */
export function getDefaultUtmParams() {
  return {
    utmCampaign: 'developer-cohort',
    utmContent: '',
    utmMedium: `cow-sdk@${sdkPackageJson.version}`,
    utmSource: 'cowmunity',
    utmTerm: 'js',
  }
}

export async function buildAppData(
  { slippageBps, appCode, orderClass: orderClassName, partnerFee }: BuildAppDataParams,
  advancedParams?: AppDataParams,
): Promise<TradingAppDataInfo> {
  const quoteParams = { slippageBips: slippageBps }
  const orderClass = { orderClass: orderClassName }
  const metadataApiSdk = new MetadataApi(getGlobalAdapter())

  // Only add default UTM if user hasn't provided their own
  // This ensures backward compatibility - if advancedParams.metadata.utm is provided,
  // the user has full control over UTM parameters
  const shouldAddDefaultUtm = !advancedParams?.metadata?.utm

  const baseMetadata = {
    quote: quoteParams,
    orderClass,
    partnerFee,
    ...(shouldAddDefaultUtm ? { utm: getDefaultUtmParams() } : {}),
  }

  const doc = await metadataApiSdk.generateAppDataDoc(
    deepmerge(
      {
        appCode,
        metadata: baseMetadata,
      },
      advancedParams || {},
    ),
  )

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(doc)

  return { doc, fullAppData, appDataKeccak256 }
}

export async function generateAppDataFromDoc(
  doc: AppDataRootSchema,
): Promise<Pick<TradingAppDataInfo, 'fullAppData' | 'appDataKeccak256'>> {
  const adapter = getGlobalAdapter()
  const fullAppData = await stringifyDeterministic(doc)
  const appDataKeccak256 = adapter.utils.keccak256(adapter.utils.toUtf8Bytes(fullAppData))

  return { fullAppData, appDataKeccak256 }
}

export async function mergeAppDataDoc(
  _doc: LatestAppDataDocVersion,
  appDataOverride: AppDataParams,
): Promise<TradingAppDataInfo> {
  // Do not merge hooks if there are overrides
  // Otherwise we will just append hooks instead of overriding
  const doc = appDataOverride.metadata?.hooks
    ? {
        ..._doc,
        metadata: {
          ..._doc.metadata,
          hooks: {},
        },
      }
    : { ..._doc }

  const appData = (appDataOverride ? deepmerge(doc, appDataOverride) : doc) as LatestAppDataDocVersion
  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(appData)

  return {
    fullAppData,
    appDataKeccak256,
    doc: appData,
  }
}
