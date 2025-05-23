import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderBookApi, OrderQuoteRequest, OrderQuoteResponse, OrderQuoteSideKindSell } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { JsonContent } from '../../components/jsonContent'
import { useCurrentChainId } from '../../hooks/useCurrentChainId'
import { ResultContent } from '../../components/resultContent'

const orderBookApi = new OrderBookApi()

export function GetQuotePage() {
  const { account } = useWeb3Info()
  const chainId = useCurrentChainId()

  const [input, setInput] = useState<OrderQuoteRequest | null>(null)
  const [output, setOutput] = useState<OrderQuoteResponse | string>('')

  useEffect(() => {
    orderBookApi.context.chainId = chainId
  }, [chainId])

  const getQuote = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      if (!input) return

      setOutput('Loading...')

      orderBookApi
        .getQuote(input)
        .then(setOutput)
        .catch((error) => {
          setOutput(error.toString())
        })
    },
    [input]
  )

  const defaultValue: OrderQuoteRequest = {
    sellToken: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', // WETH gnosis chain
    buyToken: '0x9c58bacc331c9aa871afd802db6379a98e80cedb', // GNO gnosis chain
    from: account,
    receiver: account,
    sellAmountBeforeFee: (0.4 * 10 ** 18).toString(),
    kind: OrderQuoteSideKindSell.SELL,
  }

  return (
    <div>
      <div className="form">
        <div>
          <h1>Order:</h1>
          <JsonContent defaultValue={defaultValue} onChange={setInput} />
        </div>

        <div>
          <button onClick={getQuote}>Get quote</button>
        </div>
      </div>

      <ResultContent data={output} />
    </div>
  )
}
