import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderBookApi } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { parseFormData } from '../../utils'

const orderBookApi = new OrderBookApi()

export function SendOrderCancellationPage() {
  const { chainId } = useWeb3Info()
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const sendOrderCancellation = useCallback((event: FormEvent) => {
    event.preventDefault()

    const data = parseFormData<{ chainId: string; params: string }>(event)
    const { orderId, signature, signingScheme } = JSON.parse(data.params)

    orderBookApi
      .sendSignedOrderCancellations({ orderUids: [orderId], signature, signingScheme })
      .then((answer: any) => setResult(answer))
      .catch((error) => {
        setResult(error.toString())
      })
  }, [])

  const params = {
    signature: 'PAST_CANCELLATION_SIGNATURE_HERE',
    signingScheme: 'eip712',
    orderId: 'PAST_ORDER_ID_HERE',
  }

  return (
    <div>
      <form className="form" onSubmit={(event) => sendOrderCancellation(event)}>
        <div>
          <label>ChainId:</label>
          <input name="chainId" value={chainId} />
        </div>

        <div>
          <label>Params:</label>
          <textarea className="result" name="params" defaultValue={JSON.stringify(params, null, 4)}></textarea>
        </div>

        <div>
          <button type="submit">Send order cancellation</button>
        </div>
      </form>

      <h3>Result:</h3>
      <textarea className="result" readOnly={true} value={JSON.stringify(result, null, 4)}></textarea>
    </div>
  )
}
