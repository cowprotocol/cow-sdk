import { FormEvent, useCallback, useState } from 'react'
import '../../pageStyles.css'
import { OrderSigningUtils, SigningResult, OrderKind, UnsignedOrder } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { JsonContent } from '../../components/jsonContent'
import { ResultContent } from '../../components/resultContent'
import { useCurrentChainId } from '../../hooks/useCurrentChainId'

export function SignOrderPage() {
  const { account, provider } = useWeb3Info()
  const chainId = useCurrentChainId()

  const [input, setInput] = useState<UnsignedOrder | null>(null)
  const [output, setOutput] = useState<SigningResult | string>('')

  const signOrder = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      if (!input) return

      setOutput('Loading...')

      const signer = provider.getSigner()

      OrderSigningUtils.signOrder(input, chainId, signer)
        .then(setOutput)
        .catch((error) => {
          setOutput(error.toString())
        })
    },
    [chainId, input, provider]
  )

  const defaultValue: UnsignedOrder = {
    sellToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    buyToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    receiver: account,
    sellAmount: '2',
    buyAmount: '1',
    validTo: Math.round((Date.now() + 200_000) / 1000),
    appData: '0x',
    feeAmount: '0',
    kind: OrderKind.SELL,
    partiallyFillable: false,
  }

  return (
    <div>
      <div className="form">
        <div>
          <h1>Order:</h1>
          <JsonContent defaultValue={defaultValue} onChange={setInput} />
        </div>

        <div>
          <button onClick={signOrder}>Sign order</button>
        </div>
      </div>

      <ResultContent data={output} />
    </div>
  )
}
