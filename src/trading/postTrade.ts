import { getQuoteAmountsAndCosts, OrderBookApi, OrderCreation } from '../order-book'
import { ethers } from 'ethers'
import { AppDataInfo, LimitOrderParameters } from './types'
import { DEFAULT_QUOTE_VALIDITY, log, SIGN_SCHEME_MAP } from './consts'
import { OrderSigningUtils, UnsignedOrder } from '../order-signing'

export async function postCoWProtocolTrade(
  orderBookApi: OrderBookApi,
  signer: ethers.Signer,
  appData: AppDataInfo,
  params: LimitOrderParameters,
  feeAmount: string
): Promise<string> {
  const {
    chainId,
    sellToken,
    sellTokenDecimals,
    buyToken,
    buyTokenDecimals,
    sellAmount,
    buyAmount,
    kind,
    partiallyFillable = false,
    quoteId = null,
    validFor,
    slippageBps = 0,
  } = params

  const validTo = params.validTo || Math.floor(Date.now() / 1000) + (validFor || DEFAULT_QUOTE_VALIDITY)
  const from = await signer.getAddress()
  const receiver = params.receiver || from
  const { appDataKeccak256, fullAppData, doc } = appData
  const partnerFeeBps = doc?.metadata?.partnerFee?.bps

  const { afterSlippage } = getQuoteAmountsAndCosts({
    orderParams: {
      sellToken,
      buyToken,
      sellAmount,
      buyAmount,
      receiver,
      validTo,
      kind,
      feeAmount,
      appData: appDataKeccak256,
      partiallyFillable,
    },
    slippagePercentBps: slippageBps,
    partnerFeeBps,
    sellDecimals: sellTokenDecimals,
    buyDecimals: buyTokenDecimals,
  })

  const orderToSign: UnsignedOrder = {
    sellToken,
    buyToken,
    sellAmount: afterSlippage.sellAmount.toString(),
    buyAmount: afterSlippage.buyAmount.toString(),
    validTo,
    kind,
    partiallyFillable,
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

  return orderId
}
