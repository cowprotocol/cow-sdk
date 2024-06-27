import { SupportedChainId, getQuote, UnsignedOrder } from '../../../src'

import { getOrderToSignFromQuoteResult, swapParamsToLimitOrderParams, postCoWProtocolTrade } from '../../../src/trading'

import { TOKENS } from './tokens'
import { atomsToAmount } from './utils'
import { pageHtml } from './pageHtml'
import { pageActions, printResult } from './pageActions'
import { GetQuoteResult } from '../../../src/trading/getQuote'
import { getFormState, getSwapParameters } from './formState'
import './styles.css'

// Run the example
;(async function () {
  let getQuoteResult: GetQuoteResult | null = null

  // Render page
  const page = pageHtml()
  document.body.appendChild(page)

  // Bind actions to the page
  pageActions({
    onFormReset() {
      getQuoteResult = null
    },
    async onGetQuote() {
      const {
        slippageBps: _slippageBps,
        chainId: _chainId,
        sellToken: _sellToken,
        buyToken: _buyToken,
        amount: _amount,
        kind,
      } = getFormState()

      const chainId: SupportedChainId = +_chainId
      const isSell = kind === 'sell'
      const sellToken = TOKENS[chainId].find((t) => t.address === _sellToken)
      const buyToken = TOKENS[chainId].find((t) => t.address === _buyToken)

      getQuoteResult = await getQuote(getSwapParameters())

      const {
        amountsAndCosts: { beforeNetworkCosts, afterSlippage },
      } = getQuoteResult

      console.log('Quote results:', getQuoteResult)

      const outputToken = isSell ? buyToken : sellToken

      printResult(`
            Quote amount: ${atomsToAmount(
              beforeNetworkCosts[isSell ? 'buyAmount' : 'sellAmount'],
              outputToken.decimals
            )} ${outputToken.symbol}
            Amount to sign: ${atomsToAmount(
              afterSlippage[isSell ? 'buyAmount' : 'sellAmount'],
              outputToken.decimals
            )} ${outputToken.symbol}
            See more info in the console (Quote results)
        `)
    },
    async onConfirmOrder() {
      const orderToSign = await getOrderToSignFromQuoteResult(getQuoteResult, getSwapParameters())

      printResult(`
        You are going to sign:
        ${JSON.stringify(orderToSign, null, 4)}
      `)
    },
    async onSignAndSendOrder() {
      const { orderBookApi, signer, appDataInfo, quoteResponse } = getQuoteResult

      const orderId = await postCoWProtocolTrade(
        orderBookApi,
        signer,
        appDataInfo,
        swapParamsToLimitOrderParams(getSwapParameters(), quoteResponse)
      )

      printResult(`Order created, id: ${orderId}`)
    },
  })
})()
