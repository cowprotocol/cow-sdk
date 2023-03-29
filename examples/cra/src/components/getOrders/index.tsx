import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderBookApi, EnrichedOrder } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { parseFormData } from '../../utils'

const orderBookApi = new OrderBookApi()

export function GetOrdersPage() {
  const { chainId } = useWeb3Info()
  const [result, setResult] = useState<Array<EnrichedOrder> | null>(null)

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const getOrders = useCallback((event: FormEvent) => {
    event.preventDefault()

    const { params } = parseFormData<{ params: string }>(event)

    orderBookApi
      .getOrders(JSON.parse(params))
      .then(setResult)
      .catch((error) => {
        console.error(error)
        setResult(error.toString())
      })
  }, [])

  const params = {
    owner: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    limit: 10,
    offset: 0,
  }

  return (
    <div>
      <form className="form" onSubmit={(event) => getOrders(event)}>
        <div>
          <label>ChainId:</label>
          <input name="chainId" value={chainId} />
        </div>

        <div>
          <label>Params:</label>
          <textarea className="result" name="params" value={JSON.stringify(params, null, 4)}></textarea>
        </div>

        <div>
          <button type="submit">Get orders</button>
        </div>
      </form>

      <h3>Result:</h3>
      <textarea className="result" readOnly={true} value={JSON.stringify(result, null, 4)}></textarea>
    </div>
  )
}
