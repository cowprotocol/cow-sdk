import { SwapAdvancedSettings, SwapParameters } from './types'
import { DEFAULT_QUOTE_VALIDITY, log } from './consts'
import { ethers } from 'ethers'
import {
  OrderBookApi,
  OrderQuoteRequest,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PriceQuality,
  SigningScheme,
} from '../../../src'
import { buildAppData } from './appDataUtils'
import { postCoWProtocolTrade } from './postTrade'

export async function postSwapOrder(params: SwapParameters, advancedSettings?: SwapAdvancedSettings) {
  const {
    appCode,
    chainId,
    sellToken,
    buyToken,
    amount,
    kind,
    validFor = DEFAULT_QUOTE_VALIDITY,
    slippageBps = 0,
    env = 'prod',
  } = params

  log(`Swap ${amount} ${sellToken} for ${buyToken} on chain ${chainId}`)

  const signer = typeof params.signer === 'string' ? new ethers.Wallet(params.signer) : params.signer
  const orderBookApi = new OrderBookApi({ chainId, env })

  const from = await signer.getAddress()
  const receiver = params.receiver || from
  const isSell = kind === 'sell'

  log('Building app data...')

  const appDataInfo = await buildAppData(
    {
      slippageBps,
      orderClass: 'market',
      appCode,
    },
    advancedSettings?.appData
  )

  const { appDataKeccak256, fullAppData } = appDataInfo

  const quoteRequest: OrderQuoteRequest = {
    from,
    sellToken,
    buyToken,
    receiver,
    validFor,
    appData: fullAppData,
    appDataHash: appDataKeccak256,
    priceQuality: PriceQuality.OPTIMAL,
    signingScheme: SigningScheme.EIP712,
    ...(isSell
      ? { kind: OrderQuoteSideKindSell.SELL, sellAmountBeforeFee: amount }
      : { kind: OrderQuoteSideKindBuy.BUY, buyAmountAfterFee: amount }),
    ...advancedSettings?.quoteRequest,
  }

  log('Getting quote...')

  const { quote, id: quoteId } = await orderBookApi.getQuote(quoteRequest)

  await postCoWProtocolTrade(
    orderBookApi,
    signer,
    appDataInfo,
    {
      ...params,
      quoteId,
      sellAmount: quote.sellAmount,
      buyAmount: quote.buyAmount,
    },
    quote.feeAmount
  )
}
