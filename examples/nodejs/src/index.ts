import {
  EcdsaSigningScheme,
  getQuoteAmountsAndCosts,
  OrderBookApi,
  OrderCreation,
  OrderQuoteRequest,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  OrderSigningUtils,
  PriceQuality,
  SigningScheme,
  SupportedChainId,
  type UnsignedOrder,
} from '../../../src'
import { AppDataInfo, AppDataRootSchema, BuildAppDataParams, SwapParameters } from './types'
import { MetadataApi, stringifyDeterministic } from '@cowprotocol/app-data'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { ethers } from 'ethers'

const DEFAULT_QUOTE_VALIDITY = 60 * 5 // 5 min

const SIGN_SCHEME_MAP = {
  [EcdsaSigningScheme.EIP712]: SigningScheme.EIP712,
  [EcdsaSigningScheme.ETHSIGN]: SigningScheme.ETHSIGN,
}

const log = (text: string) => console.log(`[SDK] ${text}`)

async function swapTokens(params: SwapParameters) {
  const {
    privateKey,
    chainId,
    from,
    sellToken,
    sellTokenDecimals,
    buyToken,
    buyTokenDecimals,
    amount,
    kind,
    slippageBps = 0,
  } = params

  log(`Swapping ${amount} ${sellToken} for ${buyToken} on chain ${chainId}`)

  const signer = new ethers.Wallet(privateKey)

  const orderBookApi = new OrderBookApi({ chainId, env: 'staging' })

  const isSell = kind === 'sell'
  const validTo = params.validTo || Math.floor(Date.now() / 1000) + DEFAULT_QUOTE_VALIDITY
  const receiver = params.receiver || from

  log('Building app data...')

  const { appDataKeccak256, fullAppData } = await buildAppData({
    chainId,
    slippageBps,
    orderClass: 'market',
    appCode: 'sdk-order',
    environment: 'production',
    utm: undefined,
  })

  const quoteRequest: OrderQuoteRequest = {
    from,
    sellToken,
    buyToken,
    receiver,
    validTo,
    appData: fullAppData,
    appDataHash: appDataKeccak256,
    priceQuality: PriceQuality.OPTIMAL,
    signingScheme: SigningScheme.EIP712,
    ...(isSell
      ? { kind: OrderQuoteSideKindSell.SELL, sellAmountBeforeFee: amount }
      : { kind: OrderQuoteSideKindBuy.BUY, buyAmountAfterFee: amount }),
  }

  log('Getting quote...')

  const { quote, id: quoteId } = await orderBookApi.getQuote(quoteRequest)

  const { afterSlippage } = getQuoteAmountsAndCosts({
    orderParams: quote,
    slippagePercentBps: slippageBps,
    partnerFeeBps: undefined, // TODO
    sellDecimals: sellTokenDecimals,
    buyDecimals: buyTokenDecimals,
  })

  const orderToSign: UnsignedOrder = {
    sellToken: quote.sellToken,
    buyToken: quote.buyToken,
    sellAmount: afterSlippage.sellAmount.toString(),
    buyAmount: afterSlippage.buyAmount.toString(),
    validTo: quote.validTo,
    kind: quote.kind,
    partiallyFillable: quote.partiallyFillable,
    appData: appDataKeccak256,
    receiver,
    feeAmount: '0',
  }

  log('Signing order...')

  const { signature, signingScheme } = await OrderSigningUtils.signOrder(orderToSign, chainId, signer)

  const orderBody: OrderCreation = {
    ...orderToSign,
    from,
    signature,
    signingScheme: SIGN_SCHEME_MAP[signingScheme],
    quoteId,
    appData: fullAppData,
    appDataHash: appDataKeccak256,
  }

  log('Posting order...')

  const orderId = await orderBookApi.sendOrder(orderBody)

  log(`Order created, id: ${orderId}`)
}

async function buildAppData({
  chainId,
  slippageBps,
  referrerAccount,
  appCode,
  environment,
  orderClass: orderClassName,
  utm,
  hooks,
  widget,
  partnerFee,
  replacedOrderUid,
}: BuildAppDataParams): Promise<AppDataInfo> {
  const metadataApiSDK = new MetadataApi()

  const referrerParams =
    referrerAccount && chainId === SupportedChainId.MAINNET ? { address: referrerAccount } : undefined

  const quoteParams = { slippageBips: slippageBps }
  const orderClass = { orderClass: orderClassName }
  const replacedOrder = replacedOrderUid ? { uid: replacedOrderUid } : undefined

  const doc = await metadataApiSDK.generateAppDataDoc({
    appCode,
    environment,
    metadata: {
      referrer: referrerParams,
      quote: quoteParams,
      orderClass,
      utm,
      hooks,
      widget,
      partnerFee,
      ...{ replacedOrder },
    },
  })

  const { fullAppData, appDataKeccak256 } = await generateAppDataFromDoc(doc)

  return { doc, fullAppData, appDataKeccak256 }
}

async function generateAppDataFromDoc(
  doc: AppDataRootSchema
): Promise<Pick<AppDataInfo, 'fullAppData' | 'appDataKeccak256'>> {
  const fullAppData = await stringifyDeterministic(doc)
  const appDataKeccak256 = keccak256(toUtf8Bytes(fullAppData))

  return { fullAppData, appDataKeccak256 }
}

// See more examples in /examples/cra
;(async function () {
  swapTokens({
    privateKey: 'xxx',
    from: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
    chainId: SupportedChainId.SEPOLIA,
    kind: 'sell',
    sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    sellTokenDecimals: 18,
    buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
    buyTokenDecimals: 18,
    amount: '120000000000000000',
  })
})()
