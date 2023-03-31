import { FormEvent, useCallback, useEffect, useState } from 'react'
import '../../pageStyles.css'
import { OrderQuoteRequest, OrderQuoteResponse, OrderBookApi, OrderQuoteSide } from '@cowprotocol/cow-sdk'
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
    sellToken: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6', // WETH goerli
    buyToken: '0x02abbdbaaa7b1bb64b5c878f7ac17f8dda169532', // GNO goerli
    from: account,
    receiver: account,
    sellAmountBeforeFee: (0.4 * 10 ** 18).toString(),
    kind: OrderQuoteSide.kind.SELL,
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
