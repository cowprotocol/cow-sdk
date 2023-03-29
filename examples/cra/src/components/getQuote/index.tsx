import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderQuoteRequest, OrderQuoteResponse, OrderBookApi, OrderQuoteSide } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { parseFormData } from '../../utils'

const orderBookApi = new OrderBookApi()

export function GetQuotePage() {
  const { chainId, account } = useWeb3Info()
  const [result, setResult] = useState<OrderQuoteResponse | null>(null)

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const getQuote = useCallback((event: FormEvent) => {
    event.preventDefault()

    const data = parseFormData<{ chainId: string; order: string }>(event)
    const order: OrderQuoteRequest = JSON.parse(data.order)

    orderBookApi
      .getQuote(order)
      .then(setResult)
      .catch((error) => {
        setResult(error.toString())
      })
  }, [])

  const order: OrderQuoteRequest = {
    sellToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    buyToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    from: account,
    receiver: account,
    sellAmountBeforeFee: (200 * 10 ** 18).toString(),
    kind: OrderQuoteSide.kind.SELL,
  }

  return (
    <div>
      <form className="form" onSubmit={(event) => getQuote(event)}>
        <div>
          <label>ChainId:</label>
          <input name="chainId" value={chainId} />
        </div>

        <div>
          <label>Order:</label>
          <textarea className="result" name="order" value={JSON.stringify(order, null, 4)}></textarea>
        </div>

        <div>
          <button type="submit">Get quote</button>
        </div>
      </form>

      <h3>Result:</h3>
      <textarea className="result" readOnly={true} value={JSON.stringify(result, null, 4)}></textarea>
    </div>
  )
}
