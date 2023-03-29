import { FormEvent, useCallback, useState } from 'react'
import '../../pageStyles.css'
import { OrderSigningUtils, SigningResult } from '@cowprotocol/cow-sdk'
import { useWeb3Info } from '../../hooks/useWeb3Info'
import { parseFormData } from '../../utils'

export function SignOrderCancellationPage() {
  const { chainId, provider } = useWeb3Info()
  const [result, setResult] = useState<SigningResult | null>(null)

  const signOrder = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      const data = parseFormData<{ chainId: string; orderId: string }>(event)

      const chainId = +data.chainId
      const orderId = data.orderId
      const signer = provider.getSigner()

      OrderSigningUtils.signOrderCancellation(orderId, chainId, signer)
        .then(setResult)
        .catch((error) => {
          setResult(error.toString())
        })
    },
    [provider]
  )

  const orderId =
    '0xe720cfe8881c3ea04f6e67307e6d590ac253ada9183ba6b1487b6f2154baeefa40a50cf069e992aa4536211b23f286ef88752187ffffffff'

  return (
    <div>
      <form className="form" onSubmit={(event) => signOrder(event)}>
        <div>
          <label>ChainId:</label>
          <input name="chainId" value={chainId} />
        </div>

        <div>
          <label>Order Id:</label>
          <textarea className="result" name="orderId" value={orderId}></textarea>
        </div>

        <div>
          <button type="submit">Sign order cancellation</button>
        </div>
      </form>

      <h3>Result:</h3>
      <textarea className="result" readOnly={true} value={JSON.stringify(result, null, 4)}></textarea>
    </div>
  )
}
