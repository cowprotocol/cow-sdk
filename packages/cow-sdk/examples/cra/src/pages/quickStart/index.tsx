import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import {
  OrderBookApi,
  OrderQuoteRequest,
  OrderQuoteSideKindSell,
  OrderSigningUtils,
  SigningScheme,
} from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { useCurrentChainId } from '../../hooks/useCurrentChainId'
import { ResultContent } from '../../components/resultContent'

const orderBookApi = new OrderBookApi()

export function QuickStartPage() {
  const { account, provider } = useWeb3Info()
  const chainId = useCurrentChainId()
  const [output, setOutput] = useState<any>('')

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const getOrders = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()

      const signer = provider.getSigner()

      // Sell 0.4 WETH for GNO on Gnosis chain network
      const quoteRequest: OrderQuoteRequest = {
        sellToken: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', // WETH gnosis chain
        buyToken: '0x9c58bacc331c9aa871afd802db6379a98e80cedb', // GNO gnosis chain
        from: account,
        receiver: account,
        sellAmountBeforeFee: (0.4 * 10 ** 18).toString(), // 0.4 WETH
        kind: OrderQuoteSideKindSell.SELL,
      }

      // Get quote
      const { quote } = await orderBookApi.getQuote(quoteRequest)

      // Sign order
      const orderSigningResult = await OrderSigningUtils.signOrder({ ...quote, receiver: account }, chainId, signer)

      // Send order to the order-book
      const orderUid = await orderBookApi.sendOrder({
        ...quote,
        signature: orderSigningResult.signature,
        signingScheme: orderSigningResult.signingScheme as string as SigningScheme,
      })

      // Get order data
      const order = await orderBookApi.getOrder(orderUid)

      // Get order trades
      const trades = await orderBookApi.getTrades({ orderUid })

      // Sign order cancellation
      const orderCancellationSigningResult = await OrderSigningUtils.signOrderCancellations([orderUid], chainId, signer)

      // Send order cancellation
      const cancellationResult = await orderBookApi.sendSignedOrderCancellations({
        ...orderCancellationSigningResult,
        orderUids: [orderUid],
      })

      setOutput({ orderUid, order, trades, orderCancellationSigningResult, cancellationResult })
    },
    [chainId, provider, account]
  )

  return (
    <div>
      <div className="form">
        <div>
          <button onClick={getOrders}>Get orders</button>
        </div>
      </div>

      <ResultContent data={output} />
    </div>
  )
}
