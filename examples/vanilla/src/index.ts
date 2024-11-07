import { SupportedChainId } from '../../../src'

import { TradingSdk, QuoteAndPost } from '../../../src/trading'

import { TOKENS } from './tokens'
import { atomsToAmount } from './utils'
import { pageHtml } from './pageHtml'
import { pageActions, printResult } from './pageActions'
import { getFormState, getTradeParameters } from './formState'
import './styles.css'

const appCode = 'trade-sdk-example'

// Run the example
;(async function () {
  let quoteAndPost: QuoteAndPost | null = null

  // Render page
  const page = pageHtml()
  document.body.appendChild(page)

  // Bind actions to the page
  pageActions({
    onFormReset() {
      quoteAndPost = null
    },
    async onGetQuote() {
      const {
        slippageBps: _slippageBps,
        chainId: _chainId,
        sellToken: _sellToken,
        buyToken: _buyToken,
        amount: _amount,
        kind,
        privateKey,
      } = getFormState()

      const chainId: SupportedChainId = +_chainId
      const isSell = kind === 'sell'
      const sellToken = TOKENS[chainId].find((t) => t.address === _sellToken)
      const buyToken = TOKENS[chainId].find((t) => t.address === _buyToken)

      const sdk = new TradingSdk({
        chainId,
        signer: privateKey || (window as any).ethereum,
        appCode,
      })

      quoteAndPost = await sdk.getQuote(getTradeParameters())

      const {
        amountsAndCosts: { beforeNetworkCosts, afterSlippage },
      } = quoteAndPost.quoteResults

      console.log('Quote results:', quoteAndPost.quoteResults)

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
      const orderToSign = quoteAndPost.quoteResults.orderToSign

      printResult(`
        You are going to sign:
        ${JSON.stringify(orderToSign, null, 4)}
      `)
    },
    async onSignAndSendOrder() {
      const orderId = await quoteAndPost.postSwapOrderFromQuote()

      printResult(`Order created, id: ${orderId}`)
    },
  })
})()
