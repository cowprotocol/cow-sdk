import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderBookApi, Address, UID, Trade } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { useCurrentChainId } from '../../hooks/useCurrentChainId'
import { JsonContent } from '../../components/jsonContent'
import { ResultContent } from '../../components/resultContent'

const orderBookApi = new OrderBookApi()

export function GetTradesPage() {
  const { account } = useWeb3Info()
  const chainId = useCurrentChainId()

  const [input, setInput] = useState<{ owner?: Address; orderId?: UID } | null>(null)
  const [output, setOutput] = useState<Array<Trade> | string>('')

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const getTrades = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      if (!input) return

      setOutput('Loading...')

      orderBookApi
        .getTrades(input)
        .then(setOutput)
        .catch((error) => {
          console.error(error)
          setOutput(error.toString())
        })
    },
    [input]
  )

  const defaultValue = {
    owner: account,
  }

  return (
    <div>
      <div className="form">
        <div>
          <h1>Owner or orderId:</h1>
          <JsonContent defaultValue={defaultValue} onChange={setInput} />
        </div>

        <div>
          <button onClick={getTrades}>Get trades</button>
        </div>
      </div>

      <ResultContent data={output} />
    </div>
  )
}
