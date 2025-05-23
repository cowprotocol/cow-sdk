import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderBookApi, EnrichedOrder, Address } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { useCurrentChainId } from '../../hooks/useCurrentChainId'
import { JsonContent } from '../../components/jsonContent'
import { ResultContent } from '../../components/resultContent'

const orderBookApi = new OrderBookApi()

export function GetOrdersPage() {
  const { account } = useWeb3Info()
  const chainId = useCurrentChainId()

  const [input, setInput] = useState<{
    owner: Address
    offset?: number
    limit?: number
  } | null>(null)
  const [output, setOutput] = useState<Array<EnrichedOrder> | string>('')

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const getOrders = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      if (!input) return

      setOutput('Loading...')

      orderBookApi
        .getOrders(input)
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
    limit: 10,
    offset: 0,
  }

  return (
    <div>
      <div className="form">
        <div>
          <h1>Params:</h1>
          <JsonContent defaultValue={defaultValue} onChange={setInput} />
        </div>

        <div>
          <button onClick={getOrders}>Get orders</button>
        </div>
      </div>

      <ResultContent data={output} />
    </div>
  )
}
