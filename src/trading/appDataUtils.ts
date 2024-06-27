import { AppDataInfo, AppDataRootSchema, BuildAppDataParams } from './types'
import { AppDataParams, MetadataApi, stringifyDeterministic } from '@cowprotocol/app-data'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'

export async function buildAppData(
  { slippageBps, appCode, orderClass: orderClassName }: BuildAppDataParams,
  advancedParams?: AppDataParams
): Promise<AppDataInfo> {
  const metadataApiSDK = new MetadataApi()

  const quoteParams = { slippageBips: slippageBps }
  const orderClass = { orderClass: orderClassName }

  const doc = await metadataApiSDK.generateAppDataDoc({
    appCode,
    metadata: {
      quote: quoteParams,
      orderClass,
    },
    ...advancedParams,
  })

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(doc)

  return { doc, fullAppData, appDataKeccak256 }
}

export async function generateAppDataFromDoc(
  doc: AppDataRootSchema
): Promise<Pick<AppDataInfo, 'fullAppData' | 'appDataKeccak256'>> {
  const fullAppData = await stringifyDeterministic(doc)
  const appDataKeccak256 = keccak256(toUtf8Bytes(fullAppData))

  return { fullAppData, appDataKeccak256 }
}
