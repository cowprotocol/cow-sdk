import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { EcdsaSigningScheme, OrderBookApi, OrderCancellations } from '@cowprotocol/cow-sdk'
import { JsonContent } from '../../components/jsonContent'
import { ResultContent } from '../../components/resultContent'
import { useCurrentChainId } from '../../hooks/useCurrentChainId'

const orderBookApi = new OrderBookApi()

export function SendOrderCancellationPage() {
  const chainId = useCurrentChainId()

  const [input, setInput] = useState<OrderCancellations | null>(null)
  const [output, setOutput] = useState<string>('')

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const sendOrderCancellation = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      if (!input) return

      setOutput('Loading...')

      orderBookApi
        .sendSignedOrderCancellations(input)
        .then((answer: any) => setOutput(answer))
        .catch((error) => {
          setOutput(error.toString())
        })
    },
    [input]
  )

  const defaultValue: OrderCancellations = {
    signature: 'PASTE_CANCELLATION_SIGNATURE_HERE',
    signingScheme: EcdsaSigningScheme.EIP712,
    orderUids: ['PASTE_ORDER_ID_HERE'],
  }

  return (
    <div>
      <div className="form">
        <div>
          <h1>Params:</h1>
          <JsonContent defaultValue={defaultValue} onChange={setInput} />
        </div>

        <div>
          <button onClick={sendOrderCancellation}>Send order cancellation</button>
        </div>
      </div>

      <ResultContent data={output} />
    </div>
  )
}
