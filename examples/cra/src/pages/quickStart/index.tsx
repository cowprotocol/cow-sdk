import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderBookApi, OrderQuoteSide, OrderSigningUtils, OrderQuoteRequest, SigningScheme } from '@cowprotocol/cow-sdk'
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

      // Sell 0.4 WETH for GNO on Goerli network
      const quoteRequest: OrderQuoteRequest = {
        sellToken: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6', // WETH goerli
        buyToken: '0x02abbdbaaa7b1bb64b5c878f7ac17f8dda169532', // GNO goerli
        from: account,
        receiver: account,
        sellAmountBeforeFee: (0.4 * 10 ** 18).toString(), // 0.4 WETH
        kind: OrderQuoteSide.kind.SELL,
      }

      // Get quote
      const { quote } = await orderBookApi.getQuote(quoteRequest)

      // Sign order
      const orderSigningResult = await OrderSigningUtils.signOrder({ ...quote, receiver: account }, chainId, signer)

      // Send order to the order-book
      const orderId = await orderBookApi.sendOrder({
        ...quote,
        signature: orderSigningResult.signature,
        signingScheme: orderSigningResult.signingScheme as string as SigningScheme,
      })

      // Get order data
      const order = await orderBookApi.getOrder(orderId)

      // Get order trades
      const trades = await orderBookApi.getTrades({ orderId })

      // Sign order cancellation
      const orderCancellationSigningResult = await OrderSigningUtils.signOrderCancellations([orderId], chainId, signer)

      // Send order cancellation
      const cancellationResult = await orderBookApi.sendSignedOrderCancellations({
        ...orderCancellationSigningResult,
        orderUids: [orderId],
      })

      setOutput({ orderId, order, trades, orderCancellationSigningResult, cancellationResult })
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
