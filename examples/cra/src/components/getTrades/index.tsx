import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderBookApi, Trade } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { parseFormData } from '../../utils'

const orderBookApi = new OrderBookApi()

export function GetTradesPage() {
  const { chainId } = useWeb3Info()
  const [result, setResult] = useState<Array<Trade> | null>(null)

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const getTrades = useCallback((event: FormEvent) => {
    event.preventDefault()

    const { owner } = parseFormData<{ owner: string }>(event)

    orderBookApi
      .getTrades({ owner })
      .then(setResult)
      .catch((error) => {
        console.error(error)
        setResult(error.toString())
      })
  }, [])

  const owner = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'

  return (
    <div>
      <form className="form" onSubmit={(event) => getTrades(event)}>
        <div>
          <label>ChainId:</label>
          <input name="chainId" value={chainId} />
        </div>

        <div>
          <label>Owner address:</label>
          <textarea className="result" name="owner" value={owner}></textarea>
        </div>

        <div>
          <button type="submit">Get trades</button>
        </div>
      </form>

      <h3>Result:</h3>
      <textarea className="result" readOnly={true} value={JSON.stringify(result, null, 4)}></textarea>
    </div>
  )
}
