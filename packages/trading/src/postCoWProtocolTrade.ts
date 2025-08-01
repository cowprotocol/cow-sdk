import { OrderBookApi, OrderCreation, SigningScheme } from '@cowprotocol/sdk-order-book'
import { TradingAppDataInfo, LimitTradeParameters, OrderPostingResult, PostTradeAdditionalParams } from './types'
import { SIGN_SCHEME_MAP } from './consts'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import { getOrderToSign } from './getOrderToSign'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getIsEthFlowOrder } from './utils/misc'
import { CowError, getGlobalAdapter, log, SignerLike } from '@cowprotocol/sdk-common'
import { generateAppDataFromDoc } from './appDataUtils'
import sdkPackageJson from '../../sdk/package.json'
import { utmContent as globalUtmContent, disableUtm } from './tradingSdk'

export async function postCoWProtocolTrade(
  orderBookApi: OrderBookApi,
  paramAppData: TradingAppDataInfo,
  params: LimitTradeParameters,
  additionalParams: PostTradeAdditionalParams = {},
  paramSigner?: SignerLike,
): Promise<OrderPostingResult> {
  const adapter = getGlobalAdapter()
  const appData = await createAppDataWithUTM(paramAppData)

  const signer = paramSigner ? adapter.createSigner(paramSigner) : adapter.signer
  const { networkCostsAmount = '0', signingScheme: _signingScheme = SigningScheme.EIP712 } = additionalParams
  if (getIsEthFlowOrder(params)) {
    const quoteId = params.quoteId

    if (typeof quoteId === 'number') {
      return postSellNativeCurrencyOrder(orderBookApi, appData, { ...params, quoteId }, additionalParams, paramSigner)
    } else {
      throw new Error('quoteId is required for EthFlow orders')
    }
  }

  const { quoteId = null, owner } = params
  const { appDataKeccak256, fullAppData } = appData

  const chainId = orderBookApi.context.chainId
  const from = owner || (await signer.getAddress())
  const orderToSign = getOrderToSign({ from, networkCostsAmount }, params, appData.appDataKeccak256)

  log('Signing order...')

  const { signature, signingScheme } = await (async () => {
    if (_signingScheme === SigningScheme.PRESIGN) {
      return { signature: from, signingScheme: SigningScheme.PRESIGN }
    } else {
      const signingResult = await OrderSigningUtils.signOrder(orderToSign, chainId, signer)

      return { signature: signingResult.signature, signingScheme: SIGN_SCHEME_MAP[signingResult.signingScheme] }
    }
  })()

  const orderBody: OrderCreation = {
    ...orderToSign,
    from,
    signature,
    signingScheme,
    quoteId,
    appData: fullAppData,
    appDataHash: appDataKeccak256,
  }

  log('Posting order...')

  const orderId = await orderBookApi.sendOrder(orderBody)

  log(`Order created, id: ${orderId}`)

  return { orderId, signature, signingScheme, orderToSign }
}

async function createAppDataWithUTM(originalAppData: TradingAppDataInfo): Promise<TradingAppDataInfo> {
  if (disableUtm) {
    return originalAppData
  }

  let parsedData: any

  try {
    parsedData = JSON.parse(originalAppData.fullAppData)
  } catch {
    try {
      const unescapedData = originalAppData.fullAppData.replace(/\\"/g, '"')
      parsedData = JSON.parse(unescapedData)
    } catch (error) {
      throw new CowError(`Failed to parse app data: ${originalAppData.fullAppData}: ${error}`)
    }
  }

  const orderSpecificUtmContent = parsedData.utm?.utmContent
  const defaultUtmContent = '🐮 moo-ving to defi 🐮'

  const utmContent = orderSpecificUtmContent || globalUtmContent || defaultUtmContent

  const defaultUtm = {
    utmCampaign: 'developer-cohort',
    utmContent,
    utmMedium: `cow-sdk@${sdkPackageJson.version}`,
    utmSource: 'cowmunity',
    utmTerm: 'js',
  }

  parsedData.utm = defaultUtm

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(parsedData)

  return {
    ...originalAppData,
    fullAppData,
    appDataKeccak256,
  }
}
