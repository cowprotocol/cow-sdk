import { AppDataInfo, AppDataRootSchema, BuildAppDataParams } from './types'
import {
  AppDataParams,
  type LatestAppDataDocVersion,
  MetadataApi,
  stringifyDeterministic,
} from '@cowprotocol/sdk-app-data'
import { getGlobalAdapter } from '@cowprotocol/sdk-common'
import deepmerge from 'deepmerge'

export async function buildAppData(
  { slippageBps, appCode, orderClass: orderClassName, partnerFee }: BuildAppDataParams,
  advancedParams?: AppDataParams,
): Promise<AppDataInfo> {
  const quoteParams = { slippageBips: slippageBps }
  const orderClass = { orderClass: orderClassName }
  const metadataApiSdk = new MetadataApi(getGlobalAdapter())

  const doc = await metadataApiSdk.generateAppDataDoc(
    deepmerge(
      {
        appCode,
        metadata: {
          quote: quoteParams,
          orderClass,
          partnerFee,
        },
      },
      advancedParams || {},
    ),
  )

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(doc)

  return { doc, fullAppData, appDataKeccak256 }
}

export async function generateAppDataFromDoc(
  doc: AppDataRootSchema,
): Promise<Pick<AppDataInfo, 'fullAppData' | 'appDataKeccak256'>> {
  const adapter = getGlobalAdapter()
  const fullAppData = await stringifyDeterministic(doc)
  const appDataKeccak256 = adapter.utils.keccak256(adapter.utils.toUtf8Bytes(fullAppData))

  return { fullAppData, appDataKeccak256 }
}

export async function mergeAppDataDoc(
  _doc: LatestAppDataDocVersion,
  appDataOverride: AppDataParams,
): Promise<AppDataInfo> {
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
    : _doc

  const appData = (appDataOverride ? deepmerge(doc, appDataOverride) : doc) as LatestAppDataDocVersion
  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(appData)

  return {
    fullAppData,
    appDataKeccak256,
    doc: appData,
  }
}
