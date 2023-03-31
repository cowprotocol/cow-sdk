import { FormEvent, useCallback, useState } from 'react'
import '../../pageStyles.css'
import { OrderCancellations, OrderSigningUtils, SigningResult } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { parseFormData } from '../../utils'
import { JsonContent } from '../../components/jsonContent'
import { ResultContent } from '../../components/resultContent'
import { useCurrentChainId } from '../../hooks/useCurrentChainId'
import { signOrderCancellation } from '@cowprotocol/contracts'

export function SignOrderCancellationPage() {
  const { provider } = useWeb3Info()
  const chainId = useCurrentChainId()

  const [input, setInput] = useState<string[] | null>(null)
  const [output, setOutput] = useState<SigningResult | string>('')

  const signOrderCancellation = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      if (!input) return

      setOutput('Loading...')

      const signer = provider.getSigner()

      OrderSigningUtils.signOrderCancellations(input, chainId, signer)
        .then(setOutput)
        .catch((error) => {
          setOutput(error.toString())
        })
    },
    [provider, input, chainId]
  )

  const defaultValue = [
    '0xe720cfe8881c3ea04f6e67307e6d590ac253ada9183ba6b1487b6f2154baeefa40a50cf069e992aa4536211b23f286ef88752187ffffffff',
  ]

  return (
    <div>
      <div className="form">
        <div>
          <h1>Order ID:</h1>
          <JsonContent defaultValue={defaultValue} onChange={setInput} />
        </div>

        <div>
          <button onClick={signOrderCancellation}>Sign order cancellation</button>
        </div>
      </div>

      <ResultContent data={output} />
    </div>
  )
}
